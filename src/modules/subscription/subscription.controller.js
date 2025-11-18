import { getStripe } from "../../config/stripe.config.js";
import { UserService } from "../user/user.service.js";
import { SubscriptionService } from "./subscription.service.js";
import Plan from "../../models/plan.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { sendPaymentConfirmationEmail } from "../../utils/mail.util.js";
const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  // ------------------------------------------------------
  // 1) Create Checkout Session
  // ------------------------------------------------------
  async createCheckoutSession(req, res, next) {
    try {
      const { planId } = req.body;
      const user = req.authUser;

      const plan = await Plan.findById(planId);
      if (!plan)
        return next(
          new ErrorClass("Plan not found", 404, null, "createCheckoutSession")
        );

      if (!plan.stripePriceId)
        return next(
          new ErrorClass(
            "Plan missing Stripe priceId",
            400,
            planId,
            "createCheckoutSession"
          )
        );
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: `https://your-frontend-domain.com/subscription/success`,
        cancel_url: `https://your-frontend-domain.com/subscription/cancel`,
        metadata: { userId: user._id.toString(), planId: plan._id.toString() },
        subscription_data: {
          metadata: {
            userId: user._id.toString(),
            planId: plan._id.toString(),
          },
        },
      });

      return res.json({ url: session.url });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to create checkout session",
          500,
          error.message,
          "createCheckoutSession"
        )
      );
    }
  }

  // ------------------------------------------------------
  // 2) Handle Webhook
  // ------------------------------------------------------
  async handleStripeWebhook(req, res) {
    let event;
    console.log("iam in webhook");

    try {
      const signature = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return next(
        new ErrorClass(err.message, 500, null, "Webhook processing error")
      );
    }

    try {
      // Reusable logic for creation + renewal
      const processSubscription = async (stripeSubscription) => {
        const { userId, planId } = stripeSubscription.metadata;

        const plan = await Plan.findById(planId);
        const startDate = new Date(
          stripeSubscription.current_period_start * 1000
        );
        const endDate = new Date(stripeSubscription.current_period_end * 1000);

        // Create or update subscription
        const newSub = await subscriptionService.createOrUpdateSubscription({
          user: userId,
          plan: planId,
          startDate,
          endDate,
          creditsAllocated: plan.credits,
          stripeSubscriptionId: stripeSubscription.id,
        });

        // Link subscription to user
        await UserService.updateUser(userId, {
          currentSubscription: newSub._id,
        });

        // Send payment confirmation email
        try {
          const user = await UserService.getUserById(userId);
          await sendPaymentConfirmationEmail(
            user.email,
            user.fullName,
            plan.name,
            startDate,
            endDate
          );
        } catch (err) {
          console.error("Failed to send payment confirmation email:", err);
        }
      };

      // ----------------------------
      //        EVENT SWITCH
      // ----------------------------

      switch (event.type) {
        case "customer.subscription.created":
          await processSubscription(event.data.object);
          break;

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );
          await processSubscription(subscription);
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object;
          const userId = sub.metadata.userId;

          await UserService.updateUser(userId, { currentSubscription: null });
          await subscriptionService.deactivateSubscription(userId);
          break;
        }
      }

      return res.json({ received: true });
    } catch (err) {
      return next(
        new ErrorClass(
          "Webhook processing error",
          500,
          null,
          "Webhook processing error"
        )
      );
    }
  }

  // ------------------------------------------------------
  // 3) Get My Subscription
  // ------------------------------------------------------
  async getMySubscription(req, res, next) {
    try {
      const userId = req.authUser._id;

      const subscription = await subscriptionService.getSubscriptionByUserId(
        userId
      );

      if (!subscription)
        return next(
          new ErrorClass(
            "No active subscription found",
            404,
            null,
            "getMySubscription"
          )
        );

      return res.json({ subscription });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to get subscription",
          500,
          error.message,
          "getMySubscription"
        )
      );
    }
  }
}

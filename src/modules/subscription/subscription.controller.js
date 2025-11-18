import { getStripe } from "../../config/stripe.config.js";
import { UserService } from "../user/user.service.js";
import { SubscriptionService } from "./subscription.service.js";
import Plan from "../../models/plan.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { sendPaymentConfirmationEmail } from "../../utils/mail.util.js";
const subscriptionService = new SubscriptionService();
const userService = new UserService();
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
  async handleStripeWebhook(req, res, next) {
    // Added 'next' for error handling
    let event;
    const stripe = getStripe(); // Initialize Stripe instance here

    console.log("i am in webhook");

    try {
      const signature = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      // It's good to log the error for debugging purposes
      console.error("Stripe webhook construction error:", err);
      return next(
        new ErrorClass(
          err.message,
          500,
          null,
          "Webhook signature verification error"
        ) // More specific message
      );
    }

    // Now 'event' is guaranteed to be defined if the try block succeeded
    console.log("Stripe event type:", event.type);

    try {
      // Reusable logic for creation + renewal
      const processSubscription = async (stripeSubscription) => {
        const { userId, planId } = stripeSubscription.metadata;

        // Ensure userId and planId exist before proceeding
        if (!userId || !planId) {
          throw new Error("Missing userId or planId in subscription metadata.");
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
          throw new Error(`Plan with ID ${planId} not found.`);
        }

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
        await userService.updateUser(userId, {
          currentSubscription: newSub._id,
        });

        // Send payment confirmation email
        try {
          const user = await userService.getUserById(userId);
          if (user) {
            await sendPaymentConfirmationEmail(
              user.email,
              user.fullName,
              plan.name,
              startDate,
              endDate
            );
          } else {
            console.warn(
              `User with ID ${userId} not found for email confirmation.`
            );
          }
        } catch (err) {
          console.error("Failed to send payment confirmation email:", err);
          // Decide if email sending failure should halt the webhook process
          // For now, it just logs and continues.
        }
      };

      console.log("Processing event of type:", event.type);
      // ----------------------------
      //        EVENT SWITCH
      // ----------------------------

      switch (event.type) {
        case "customer.subscription.created":
          // Ensure the subscription object is available
          if (event.data.object) {
            await processSubscription(event.data.object);
          } else {
            console.warn(
              "customer.subscription.created event missing data.object"
            );
          }
          break;

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          if (invoice && invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription
            );
            await processSubscription(subscription);
          } else {
            console.warn(
              "invoice.payment_succeeded event missing invoice or subscription ID"
            );
          }
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object;
          const userId = sub.metadata.userId;

          if (userId) {
            await userService.updateUser(userId, { currentSubscription: null });
            await subscriptionService.deactivateSubscription(userId);
          } else {
            console.warn(
              "customer.subscription.deleted event missing userId in metadata"
            );
          }
          break;
        }
        // Handle other event types if necessary, or log them
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error("Error processing Stripe webhook event:", err);
      return next(
        new ErrorClass(
          "Webhook processing error",
          500,
          null,
          "An error occurred while processing the webhook event."
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

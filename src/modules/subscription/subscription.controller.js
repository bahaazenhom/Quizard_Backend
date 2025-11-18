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
  // 2) Handle Webhook - FIXED VERSION
  // ------------------------------------------------------
  async handleStripeWebhook(req, res, next) {
    let event;
    const stripe = getStripe();

    console.log("Webhook received");

    // CRITICAL: Validate webhook secret exists
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return res.status(500).json({
        error: "Webhook secret not configured",
      });
    }

    try {
      const signature = req.headers["stripe-signature"];

      // Validate signature header exists
      if (!signature) {
        console.error("Missing stripe-signature header");
        return res.status(400).json({
          error: "Missing stripe-signature header",
        });
      }

      // Check for raw body - this is the most common issue
      if (!req.rawBody && !req.body) {
        console.error("Missing request body for webhook verification");
        return res.status(400).json({
          error: "Missing request body",
        });
      }

      // Use rawBody if available, otherwise try body
      const payload = req.rawBody || req.body;

      console.log("Attempting to verify webhook signature...");
      console.log("Payload type:", typeof payload);
      console.log("Payload length:", payload?.length || 0);

      // Construct and verify the event
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log("Webhook signature verified successfully");
    } catch (err) {
      // Enhanced error logging
      console.error("=== WEBHOOK VERIFICATION ERROR ===");
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message || "No message");
      console.error("Error stack:", err.stack);

      // Check for specific Stripe error properties
      if (err.type) {
        console.error("Stripe error type:", err.type);
      }

      // Log what we received
      console.error("Signature header:", req.headers["stripe-signature"]);
      console.error("Raw body exists:", !!req.rawBody);
      console.error("Body exists:", !!req.body);
      console.error(
        "Webhook secret configured:",
        !!process.env.STRIPE_WEBHOOK_SECRET
      );

      // Return error response to Stripe
      return res.status(400).json({
        error: `Webhook Error: ${err.message || "Unknown error"}`,
        type: err.type || "verification_failed",
      });
    }

    // Process the verified event
    console.log("Processing Stripe event type:", event.type);

    try {
      // Reusable logic for creation + renewal
      const processSubscription = async (stripeSubscription) => {
        const { userId, planId } = stripeSubscription.metadata;

        // Validate metadata
        if (!userId || !planId) {
          console.error("Missing metadata:", { userId, planId });
          throw new Error("Missing userId or planId in subscription metadata.");
        }

        console.log(
          `Processing subscription for user ${userId}, plan ${planId}`
        );

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

        console.log(`Subscription created/updated: ${newSub._id}`);

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
            console.log(`Confirmation email sent to ${user.email}`);
          } else {
            console.warn(
              `User with ID ${userId} not found for email confirmation.`
            );
          }
        } catch (emailErr) {
          console.error("Failed to send payment confirmation email:", emailErr);
          // Email failure shouldn't stop webhook processing
        }
      };

      // ----------------------------
      //        EVENT SWITCH
      // ----------------------------
      switch (event.type) {
        case "customer.subscription.created":
          if (event.data.object) {
            console.log("Processing subscription.created event");
            await processSubscription(event.data.object);
          } else {
            console.warn(
              "customer.subscription.created event missing data.object"
            );
          }
          break;

        case "invoice.payment_succeeded": {
          console.log("Processing invoice.payment_succeeded event");
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
          console.log("Processing subscription.deleted event");
          const sub = event.data.object;
          const userId = sub.metadata?.userId;

          if (userId) {
            await userService.updateUser(userId, { currentSubscription: null });
            await subscriptionService.deactivateSubscription(userId);
            console.log(`Subscription deactivated for user ${userId}`);
          } else {
            console.warn(
              "customer.subscription.deleted event missing userId in metadata"
            );
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Success response
      return res.status(200).json({ received: true });
    } catch (processingErr) {
      console.error("=== WEBHOOK PROCESSING ERROR ===");
      console.error("Error:", processingErr);
      console.error("Stack:", processingErr.stack);

      // Still return 200 to Stripe to avoid retries for business logic errors
      // Log the error for investigation
      return res.status(200).json({
        received: true,
        warning: "Event received but processing failed",
      });
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

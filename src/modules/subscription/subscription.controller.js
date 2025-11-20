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
          throw new Error("Missing userId or planId in subscription metadata.");
        }

        const plan = await Plan.findById(planId);
        if (!plan) {
          throw new Error(`Plan with ID ${planId} not found.`);
        }

        // Use current_period_start and current_period_end if available
        // Otherwise use period_start and period_end (alternative field names)
        // For newer Stripe API versions, these are on the subscription item, not the subscription
        let periodStart =
          stripeSubscription.current_period_start ||
          stripeSubscription.period_start;
        let periodEnd =
          stripeSubscription.current_period_end ||
          stripeSubscription.period_end;

        // Check subscription items for period dates (newer Stripe API)
        if (
          (!periodStart || !periodEnd) &&
          stripeSubscription.items &&
          stripeSubscription.items.data &&
          stripeSubscription.items.data.length > 0
        ) {
          const subscriptionItem = stripeSubscription.items.data[0];
          periodStart = periodStart || subscriptionItem.current_period_start;
          periodEnd = periodEnd || subscriptionItem.current_period_end;
        }

        if (!periodStart || !periodEnd) {
          throw new Error(`Stripe subscription missing required period dates.`);
        }

        // Create or update subscription
        const newSub = await subscriptionService.createOrUpdateSubscription({
          user: userId,
          plan: planId,
          startDate: new Date(periodStart * 1000),
          endDate: new Date(periodEnd * 1000),
          creditsAllocated: plan.credits,
          stripeSubscriptionId: stripeSubscription.id,
          status: stripeSubscription.status || "active",
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
              plan.name
            );
          }
        } catch (emailErr) {
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

          // Check if invoice exists
          if (!invoice) {
            console.error(
              "invoice.payment_succeeded: No invoice object in event data"
            );
            break;
          }

          // Log invoice details for debugging
          console.log("Invoice billing_reason:", invoice.billing_reason);
          console.log("Invoice subscription field:", invoice.subscription);
          console.log("Invoice customer:", invoice.customer);
          console.log(
            "Invoice has lines:",
            invoice.lines ? invoice.lines.data.length : 0
          );

          // Extract subscription ID - try multiple approaches
          let subscriptionId = invoice.subscription;

          // If not found in subscription field, try to get from lines array
          if (
            !subscriptionId &&
            invoice.lines &&
            invoice.lines.data.length > 0
          ) {
            // Look through all line items for subscription ID
            for (const lineItem of invoice.lines.data) {
              if (lineItem.subscription) {
                subscriptionId = lineItem.subscription;
                console.log("Extracted subscription ID from invoice line item");
                break;
              }
            }
          }

          // For subscription_create billing reason, retrieve the subscription from the customer
          if (
            !subscriptionId &&
            invoice.billing_reason === "subscription_create" &&
            invoice.customer
          ) {
            console.log(
              "subscription_create invoice: Attempting to retrieve subscription from customer"
            );
            try {
              // List subscriptions for this customer to find the one for this invoice
              const subscriptions = await stripe.subscriptions.list({
                customer: invoice.customer,
                limit: 10,
              });

              // Find the subscription that matches this invoice period
              if (subscriptions.data && subscriptions.data.length > 0) {
                // Get the most recent subscription (first in list, sorted by creation date descending)
                const subscription = subscriptions.data[0];
                if (subscription) {
                  subscriptionId = subscription.id;
                  console.log(
                    `Found subscription ${subscriptionId} for customer ${invoice.customer}`
                  );
                }
              }
            } catch (listErr) {
              console.error(
                "Failed to list subscriptions for customer:",
                listErr
              );
            }
          }

          // Check if we found a subscription
          if (!subscriptionId) {
            console.warn(
              "invoice.payment_succeeded: No subscription found in invoice or customer"
            );
            console.log(
              "Full invoice metadata:",
              JSON.stringify(invoice.metadata)
            );
            console.warn(
              "This might be a one-time payment. billing_reason:",
              invoice.billing_reason
            );
            // Don't process non-subscription invoices
            break;
          }

          try {
            console.log(`Retrieving subscription: ${subscriptionId}`);
            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );
            if (!subscription) {
              console.error("Failed to retrieve subscription object");
              throw new Error("Subscription not found in Stripe");
            }
            console.log(
              "Subscription retrieved successfully:",
              subscription.id
            );
            await processSubscription(subscription);
          } catch (retrieveErr) {
            console.error("Failed to retrieve subscription:", retrieveErr);
            throw retrieveErr;
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

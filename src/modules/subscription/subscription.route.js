import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller.js";
import { auth } from "../../middlewares/authentication.middleware.js";

const router = Router();
const subscriptionController = new SubscriptionController();

// User creates checkout session
router.post("/checkout", auth(), subscriptionController.createCheckoutSession);

// Stripe webhook (no auth)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleStripeWebhook
);

// Get user's subscription
router.get(
  "/my-subscription",
  auth(),
  subscriptionController.getMySubscription
);

export default router;

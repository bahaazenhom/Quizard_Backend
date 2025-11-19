// routes/subscription.routes.js
import express from "express";
import { SubscriptionController } from "./subscription.controller.js";
import { auth } from "../../middlewares/authentication.middleware.js";
const router = express.Router();
const subscriptionController = new SubscriptionController();

// Other routes with JSON parsing
router.post("/checkout", auth(), subscriptionController.createCheckoutSession);

router.get(
  "/my-subscription",
  auth(),
  subscriptionController.getMySubscription
);

export default router;

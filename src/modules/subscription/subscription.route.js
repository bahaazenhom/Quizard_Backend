// routes/subscription.routes.js
import express from "express";
import { SubscriptionController } from "./subscription.controller.js";
import { auth } from "../../middlewares/authentication.middleware.js";
const router = express.Router();
const subscriptionController = new SubscriptionController();

/**
 * @swagger
 * /api/v1/subscriptions/checkout:
 *   post:
 *     summary: Create Stripe checkout session for subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: ID of the plan to subscribe to
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 *                   description: Stripe checkout session ID
 *                 url:
 *                   type: string
 *                   description: Stripe checkout URL
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Plan not found
 */
router.post("/checkout", auth(), subscriptionController.createCheckoutSession);

router.post("freePlan", auth(), subscriptionController.subscribeFreePlan);
/**
 * @swagger
 * /api/v1/subscriptions/my-subscription:
 *   get:
 *     summary: Get current user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No active subscription found
 */
router.get(
  "/my-subscription",
  auth(),
  subscriptionController.getMySubscription
);

export default router;

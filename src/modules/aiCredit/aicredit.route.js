import express from "express";
import { AICreditController } from "./aiCredit.controller.js";
import { auth } from "../../middlewares/authentication.middleware.js";

const router = express.Router();
const creditController = new AICreditController();

/**
 * @swagger
 * /api/v1/ai-credits/remaining:
 *   get:
 *     summary: Get remaining AI credits for current user
 *     tags: [AI Credits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Remaining credits retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     creditsRemaining:
 *                       type: number
 *                     creditsAllocated:
 *                       type: number
 *                     creditsUsed:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to get remaining credits
 */
router.get(
  "/remaining",
  auth(),
  creditController.getRemainingCredits.bind(creditController)
);

/**
 * @swagger
 * /api/v1/ai-credits/deduct:
 *   post:
 *     summary: Check and Deduct AI credits (Combined Middleware)
 *     description: Validates remaining credits, then deducts them. Use as middleware in AI routes.
 *     tags: [AI Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aiCredit
 *             properties:
 *               aiCredit:
 *                 type: number
 *                 description: Number of AI credits to check and deduct
 *                 example: 10
 *     responses:
 *       200:
 *         description: Credits checked and deducted successfully (only if used as endpoint)
 *       400:
 *         description: aiCredit is required and must be greater than 0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Insufficient AI credits
 *       500:
 *         description: Failed to check and deduct credits
 */
router.post("/deduct", auth(), creditController.checkAndDeductCredits);

/**
 * @swagger
 * /api/v1/ai-credits/refund:
 *   post:
 *     summary: Refund AI credits (admin/system use)
 *     tags: [AI Credits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creditsToRefund
 *             properties:
 *               creditsToRefund:
 *                 type: number
 *                 description: Number of credits to refund
 *                 example: 10
 *     responses:
 *       200:
 *         description: Credits refunded successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to refund credits
 */
router.post(
  "/refund",
  auth(),
  creditController.refundCredits.bind(creditController)
);

export default router;

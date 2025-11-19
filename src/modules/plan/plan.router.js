import { PlanController } from "./plan.controller.js";
import { Router } from "express";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";

const router = Router();
const planController = new PlanController();

/**
 * @swagger
 * /api/v1/plans:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stripePriceId
 *               - credits
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Plan
 *               price:
 *                 type: number
 *                 example: 29.99
 *               stripePriceId:
 *                 type: string
 *                 example: price_1234567890
 *               credits:
 *                 type: number
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: Best for power users
 *               feature:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Unlimited quizzes", "Priority support"]
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post("/", errorHandler(planController.createPlan));

/**
 * @swagger
 * /api/v1/plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Plans]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all active plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 */
router.get("/", errorHandler(planController.getAllPlans));

/**
 * @swagger
 * /api/v1/plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", errorHandler(planController.getPlanById));

/**
 * @swagger
 * /api/v1/plans/{id}:
 *   patch:
 *     summary: Update a plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               credits:
 *                 type: number
 *               description:
 *                 type: string
 *               feature:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/:id", errorHandler(planController.updatePlan));

/**
 * @swagger
 * /api/v1/plans/{id}:
 *   delete:
 *     summary: Delete a plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:id", errorHandler(planController.deletePlan));
export default router;

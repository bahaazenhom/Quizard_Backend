import { Router } from "express";
import { QuestionController } from "./question.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createQuestionSchema, updateQuestionSchema } from "./question.validation.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";

const router = Router();
const controller = new QuestionController();

/**
 * @swagger
 * /api/v1/questions:
 *   post:
 *     summary: Create a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text, options, correctOptionIndex]
 *             properties:
 *               text: { type: string, example: "What is encapsulation?" }
 *               options:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Hiding data", "Inheritance", "Polymorphism", "Abstraction"]
 *               correctOptionIndex: { type: integer, example: 0 }
 *               point: { type: number, example: 5 }
 *     responses:
 *       201: { description: Question created }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.post(
  "/",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  validate(createQuestionSchema),
  errorHandler(controller.createQuestion)
);

/**
 * @swagger
 * /api/v1/questions:
 *   get:
 *     summary: List questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Questions retrieved }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get("/", auth(), errorHandler(controller.getQuestions));

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   get:
 *     summary: Get question by id
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Question retrieved }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get("/:id", auth(), errorHandler(controller.getQuestionById));

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   patch:
 *     summary: Update question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       200: { description: Question updated }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  "/:id",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  validate(updateQuestionSchema),
  errorHandler(controller.updateQuestion)
);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Question deleted }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.delete(
  "/:id",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  errorHandler(controller.deleteQuestion)
);

export default router;

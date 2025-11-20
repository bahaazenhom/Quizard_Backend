import { Router } from "express";
import { QuizController } from "./quiz.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { createQuizValidation, updateQuizValidation } from "./quiz.validation.js";
import { validate } from "../../middlewares/validation.middleware.js";

const router = Router();
const quizController = new QuizController();

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "JavaScript Basics Quiz"
 *               description:
 *                 type: string
 *                 example: "Test your knowledge of JavaScript fundamentals"
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *               totalMarks:
 *                 type: number
 *                 example: 100
 *               durationMinutes:
 *                 type: number
 *                 example: 60
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T10:00:00Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T11:00:00Z"
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
    "/",
    auth(),
    authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
    validate(createQuizValidation),
    errorHandler(quizController.createQuiz)
);

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", auth(), errorHandler(quizController.getAllQuizzes));

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Quiz'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", auth(), errorHandler(quizController.getQuizById));

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated JavaScript Basics Quiz"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *               totalMarks:
 *                 type: number
 *                 example: 100
 *               durationMinutes:
 *                 type: number
 *                 example: 60
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T10:00:00Z"
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T11:00:00Z"
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put(
    "/:id",
    auth(),
    authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
    validate(updateQuizValidation),
    errorHandler(quizController.updateQuiz)
);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete(
    "/:id",
    auth(),
    authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
    errorHandler(quizController.deleteQuiz)
);

export default router;

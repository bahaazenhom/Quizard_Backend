import { Router } from "express";
import { QuizController } from "./quiz.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import {
  createQuizValidation,
  updateQuizValidation,
  createQuizFromDetailsValidation,
} from "./quiz.validation.js";
import { validate } from "../../middlewares/validation.middleware.js";

const router = Router();
const quizController = new QuizController();

/**
 * @swagger
 * /api/v1/quizzes/from-details:
 *   post:
 *     summary: Create a quiz (and its questions) from a full quiz_details payload
 *     description: Used by the agent/MCP to create questions, quiz, and module links in one call.
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
 *               - quiz_details
 *             properties:
 *               quiz_details:
 *                 oneOf:
 *                   - type: string
 *                     description: JSON string of complete quiz payload
 *                     example: |
 *                       {
 *                         "title": "Midterm Exam - OOP & Data Structures",
 *                         "description": "Covers chapters 3-5",
 *                         "totalMarks": 100,
 *                         "durationMinutes": 90,
 *                         "startAt": "2024-12-15T09:00:00Z",
 *                         "endAt": "2024-12-15T12:00:00Z",
 *                         "questions": [
 *                           { "text": "Explain encapsulation", "options": ["A", "B", "C", "D"], "correctOptionIndex": 2, "point": 5 }
 *                         ],
 *                         "module_ids": ["507f1f77bcf86cd799439011"]
 *                       }
 *                   - type: object
 *                     description: Parsed quiz payload
 *                     properties:
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       totalMarks:
 *                         type: number
 *                       durationMinutes:
 *                         type: number
 *                       startAt:
 *                         type: string
 *                         format: date-time
 *                       endAt:
 *                         type: string
 *                         format: date-time
 *                       questions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             text: { type: string }
 *                             options:
 *                               type: array
 *                               items: { type: string }
 *                             correctOptionIndex: { type: integer }
 *                             point: { type: number }
 *                       module_ids:
 *                         type: array
 *                         items: { type: string, description: "Module ObjectId" }
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
  "/from-details",  
  auth(),
  authorization(systemRoles.USER, systemRoles.ADMIN),
  validate(createQuizFromDetailsValidation),
  errorHandler(quizController.createQuizFromDetails)
);

/**
 * @swagger
 * /api/v1/quizzes:
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
    authorization(systemRoles.USER_ADMIN),
    validate(createQuizValidation),
    errorHandler(quizController.createQuiz)
);

/**
 * @swagger
 * /api/v1/quizzes:
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
 * /api/v1/quizzes/{id}:
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
 * /api/v1/quizzes/{id}:
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
 * /api/v1/quizzes/{id}:
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

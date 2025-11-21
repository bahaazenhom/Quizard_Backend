import { Router } from "express";
import { SubmissionController } from "./submission.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createSubmissionSchema,
  updateSubmissionSchema,
} from "./submission.validation.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";

const router = Router();
const controller = new SubmissionController();

/**
 * @swagger
 * /api/v1/submissions:
 *   post:
 *     summary: Create a submission with automatic score calculation
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quiz, answers]
 *             properties:
 *               quiz:
 *                 type: string
 *                 description: Quiz ObjectId
 *                 example: "673a5f8c9d8b2c1f5e4a3c2b"
 *               answers:
 *                 type: array
 *                 description: Array of student answers (student ID and score are auto-calculated)
 *                 items:
 *                   type: object
 *                   required: [question, selectedIndex]
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: Question ObjectId
 *                       example: "673a5f8c9d8b2c1f5e4a3c2b"
 *                     selectedIndex:
 *                       type: integer
 *                       description: Index of selected option (0-based)
 *                       example: 2
 *                 example:
 *                   - question: "673a5f8c9d8b2c1f5e4a3c2b"
 *                     selectedIndex: 2
 *                   - question: "673a5f8c9d8b2c1f5e4a3c2c"
 *                     selectedIndex: 1
 *                   - question: "673a5f8c9d8b2c1f5e4a3c2d"
 *                     selectedIndex: 0
 *               startedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional - Quiz start time (defaults to now)
 *                 example: "2025-11-21T10:00:00Z"
 *     responses:
 *       201:
 *         description: Submission created successfully with calculated score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     quiz: { type: string }
 *                     student: { type: string }
 *                     scoreTotal:
 *                       type: number
 *                       description: Total calculated score
 *                     answers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           question: { type: string }
 *                           selectedIndex: { type: integer }
 *                           isCorrect: { type: boolean }
 *                     startedAt: { type: string, format: date-time }
 *                     submittedAt: { type: string, format: date-time }
 *       400:
 *         description: Validation error or empty answers array
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404:
 *         description: One or more questions not found
 */
router.post(
  "/",
  auth(),
  authorization(systemRoles.STUDENT, systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  validate(createSubmissionSchema),
  errorHandler(controller.createSubmission)
);

/**
 * @swagger
 * /api/v1/submissions:
 *   get:
 *     summary: List submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Submissions retrieved }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
router.get(
  "/",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  errorHandler(controller.getSubmissions)
);

/**
 * @swagger
 * /api/v1/submissions/{id}:
 *   get:
 *     summary: Get submission by id
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Submission retrieved }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get(
  "/:id",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  errorHandler(controller.getSubmissionById)
);

/**
 * @swagger
 * /api/v1/submissions/{id}:
 *   patch:
 *     summary: Update submission
 *     tags: [Submissions]
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
 *             type: object
 *     responses:
 *       200: { description: Submission updated }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.patch(
  "/:id",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  validate(updateSubmissionSchema),
  errorHandler(controller.updateSubmission)
);

/**
 * @swagger
 * /api/v1/submissions/{id}:
 *   delete:
 *     summary: Delete submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Submission deleted }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.delete(
  "/:id",
  auth(),
  authorization(systemRoles.INSTRUCTOR, systemRoles.ADMIN),
  errorHandler(controller.deleteSubmission)
);

export default router;

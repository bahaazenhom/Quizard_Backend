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
 *     summary: Create a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quiz, student, answers]
 *             properties:
 *               quiz: { type: string, description: "Quiz ObjectId" }
 *               student: { type: string, description: "Student ObjectId" }
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question: { type: string }
 *                     selectedIndex: { type: integer }
 *                     isCorrect: { type: boolean }
 *               scoreTotal: { type: number }
 *               startedAt: { type: string, format: date-time }
 *               submittedAt: { type: string, format: date-time }
 *     responses:
 *       201: { description: Submission created }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
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

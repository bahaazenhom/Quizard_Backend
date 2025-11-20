import { Router } from "express";
import { ModuleQuizController } from "./moduleQuiz.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createModuleQuizValidation, updateModuleQuizValidation } from "./moduleQuiz.validation.js";

const router = Router();
const moduleQuizController = new ModuleQuizController();

/**
 * @swagger
 * /api/module-quizzes:
 *   post:
 *     summary: Create a new module-quiz association
 *     tags: [Module-Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleId
 *               - quizId
 *             properties:
 *               moduleId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               quizId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: Module-Quiz association created successfully
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
    validate(createModuleQuizValidation),
    errorHandler(moduleQuizController.createModuleQuiz)
);

/**
 * @swagger
 * /api/module-quizzes:
 *   get:
 *     summary: Get all module-quiz associations
 *     tags: [Module-Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Module-Quiz associations retrieved successfully
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
 *                     $ref: '#/components/schemas/ModuleQuiz'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/", auth(), errorHandler(moduleQuizController.getAllModuleQuizzes));

/**
 * @swagger
 * /api/module-quizzes/{id}:
 *   get:
 *     summary: Get module-quiz association by ID
 *     tags: [Module-Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module-Quiz association ID
 *     responses:
 *       200:
 *         description: Module-Quiz association retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ModuleQuiz'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", auth(), errorHandler(moduleQuizController.getModuleQuizById));

/**
 * @swagger
 * /api/module-quizzes/{id}:
 *   put:
 *     summary: Update module-quiz association
 *     tags: [Module-Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module-Quiz association ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               quizId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Module-Quiz association updated successfully
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
    validate(updateModuleQuizValidation),
    errorHandler(moduleQuizController.updateModuleQuiz)
);

/**
 * @swagger
 * /api/module-quizzes/{id}:
 *   delete:
 *     summary: Delete module-quiz association
 *     tags: [Module-Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module-Quiz association ID
 *     responses:
 *       200:
 *         description: Module-Quiz association deleted successfully
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
    errorHandler(moduleQuizController.deleteModuleQuiz)
);

export default router;

import { Router } from "express";
import { auth } from "../../middlewares/authentication.middleware.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createMaterialSchema,
  updateMaterialSchema,
} from "./material.validation.js";
import { MaterialController } from "./material.controller.js";
import { upload } from "../../utils/FilesUpload.js";

const router = Router();

const materialController = new MaterialController();

/**
 * @swagger
 * /api/v1/materials/{moduleId}:
 *   post:
 *     summary: Create a new material in a module
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction Video
 *               type:
 *                 type: string
 *                 enum: [pdf, video, link]
 *                 example: video
 *               url:
 *                 type: string
 *                 example: https://example.com/video.mp4
 *     responses:
 *       201:
 *         description: Material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/:moduleId",
  auth(),
  upload.array("files", 10),
  validate(createMaterialSchema),
  errorHandler(materialController.createMaterial)
);

/**
 * @swagger
 * /api/v1/materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", errorHandler(materialController.getMaterialById));

/**
 * @swagger
 * /api/v1/materials/{id}:
 *   put:
 *     summary: Update a material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [pdf, video, link]
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Material updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  "/:id",
  auth(),
  validate(updateMaterialSchema),
  errorHandler(materialController.updateMaterial)
);

/**
 * @swagger
 * /api/v1/materials/{moduleId}/{id}:
 *   delete:
 *     summary: Delete a material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  "/:moduleId/:id",
  auth(),
  errorHandler(materialController.deleteMaterial)
);

/**
 * @swagger
 * /api/v1/materials/module/{moduleId}:
 *   get:
 *     summary: Get all materials by module ID
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
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
 *                     $ref: '#/components/schemas/Material'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  "/module/:moduleId",
  auth(),
  errorHandler(materialController.getMaterialsByModuleId)
);

export default router;

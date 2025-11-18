import { Router } from "express";
import { auth } from "../../middlewares/authentication.middleware.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createMaterialSchema, updateMaterialSchema } from "./material.validation.js";
import { MaterialController } from './material.controller.js';

const router = Router();

const materialController = new MaterialController();

// CREATE
router.post(
    "/:moduleId",
    auth(),
    validate(createMaterialSchema),
    errorHandler(materialController.createMaterial)
);

// GET ONE
router.get("/:id", errorHandler(materialController.getMaterialById));

// UPDATE
router.put(
    "/:id",
    auth(),
    validate(updateMaterialSchema), errorHandler(materialController.updateMaterial))

// DELETE
router.delete("/:moduleId/:id",
    auth(),
    errorHandler(materialController.deleteMaterial)
);

export default router;

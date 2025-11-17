import { Router } from "express";
import { ModuleController } from "./module.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { errorHandler } from './../../middlewares/globalErrorHandler.middleware.js';
import {
    createModuleSchema,
    updateModuleSchema
} from "./module.validation.js";
import { auth } from "../../middlewares/authentication.middleware.js";

const router = Router();
const controller = new ModuleController();

router.post(
    "/:groupId",
    auth(),
    validate(createModuleSchema),
    errorHandler(controller.createModule)
);

router.get(
    "/group/:groupId",
    auth(),
    errorHandler(controller.getModules)
);

router.get(
    "/:id",
    auth(),
    errorHandler(controller.getModuleById)
);

router.patch(
    "/:id",
    auth(),
    validate(updateModuleSchema),
    errorHandler(controller.updateModule)
);

router.delete(
    "/:id",
    auth(),
    errorHandler(controller.deleteModule)
);

export default router;

import { Router } from "express";
import { ModuleController } from "./module.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";

const router = Router();
const moduleController = new ModuleController();

router.get("/", errorHandler(moduleController.getModule));
router.get("/me", errorHandler(moduleController.getMyGroups));

router.post("/", errorHandler(moduleController.createModule));
router.patch("/:id", errorHandler(moduleController.updateModule));

router.delete("/:id/hard", errorHandler(moduleController.deleteModule));
router.delete("/:id", errorHandler(moduleController.deleteModule));

router.patch("/:id/restore", errorHandler(moduleController.restoreModule));

export default router;

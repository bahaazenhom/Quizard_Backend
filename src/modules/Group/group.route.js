import { Router } from "express";
import { GroupController } from "./group.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createGroupSchema, updateGroupSchema } from './group.validation.js';

const router = Router();
const groupController = new GroupController();

router.get("/", errorHandler(groupController.getGroup));
router.get("/me", errorHandler(groupController.getMyGroups));

router.post("/",validate(createGroupSchema) ,  errorHandler(groupController.createGroup));
router.patch("/:id",validate(updateGroupSchema), errorHandler(groupController.updateGroup));

router.delete("/:id/hard", errorHandler(groupController.deleteGroup));
router.delete("/:id", errorHandler(groupController.deleteGroup));

router.patch("/:id/restore", errorHandler(groupController.restoreGroup));

export default router;

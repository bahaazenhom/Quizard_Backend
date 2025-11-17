import { Router } from "express";
import { GroupController } from "./group.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createGroupSchema, updateGroupSchema } from './group.validation.js';
import { auth } from './../../middlewares/authentication.middleware.js';
import { systemRoles } from "../../utils/system-roles.util.js";
import { authorization } from "../../middlewares/authorization.middleware.js";


const router = Router();
const groupController = new GroupController();

router.get("/", auth(), authorization(systemRoles.ADMIN), errorHandler(groupController.getGroup));
router.get("/me", auth(), errorHandler(groupController.getMyGroups));
router.get("/:id", auth(), errorHandler(groupController.getGroupById));

router.post("/", auth(), validate(createGroupSchema), errorHandler(groupController.createGroup));
router.patch("/:id", auth(), validate(updateGroupSchema), errorHandler(groupController.updateGroup));

router.delete("/:id/hard", auth(), errorHandler(groupController.deleteGroup));
router.delete("/:id", auth(), authorization(systemRoles.ADMIN), errorHandler(groupController.deleteGroup));

router.patch("/:id/restore", auth(), authorization(systemRoles.ADMIN), errorHandler(groupController.restoreGroup));

export default router;

import { Router } from "express";
import { UserController } from "./user.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import {
  multerHostMiddleware,
  multerMiddleware,
} from "../../middlewares/multer.middleware.js";

const router = Router();
const userController = new UserController();

router.post("/register", errorHandler(userController.registerUser));
router.get("/confirm-email/:userId", errorHandler(userController.confirmEmail));
router.post("/login", errorHandler(userController.loginUser));

// profile routes can be added here in future
router.get("/", auth(), userController.getProfile);
router.put("/", auth(), userController.updateProfile);
router.put("/email", auth(), userController.updateEmail);
router.put("/password", auth(), userController.changePassword);
router.put(
  "/photo",
  auth(),
  multerHostMiddleware("userProfile", ["jpg", "jpeg", "png"]).single("image"),
  userController.updateProfilePhoto
);
router.get("/stats", auth(), userController.getUserStats);

// Admin only routes
router.get(
  "/search",
  auth(),
  authorization(systemRoles.ADMIN),
  userController.searchUsers
);
router.get(
  "/:id",
  auth(),
  authorization(systemRoles.ADMIN),
  userController.getProfileById
);
export default router;

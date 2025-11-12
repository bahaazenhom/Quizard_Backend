import { Router } from "express";
import { UserController } from "./user.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";

const router = Router();
const userController = new UserController();

router.post("/register", errorHandler(userController.registerUser));
router.get("/confirm-email/:userId", errorHandler(userController.confirmEmail));
router.post("/login", errorHandler(userController.loginUser));
export default router;

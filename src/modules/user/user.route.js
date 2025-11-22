import { Router } from "express";
import { UserController } from "./user.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { refreshTokenAuth } from "../../middlewares/refreshToken.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { authorization } from "../../middlewares/authorization.middleware.js";
import {
  multerHostMiddleware,
  multerMiddleware,
} from "../../middlewares/multer.middleware.js";

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *               age:
 *                 type: number
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post("/register", userController.registerUser);

/**
 * @swagger
 * /api/v1/users/confirm-email/{userId}:
 *   get:
 *     summary: Confirm user email
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/confirm-email/:userId", errorHandler(userController.confirmEmail));

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/login", errorHandler(userController.loginUser));

router.post("/google", errorHandler(userController.googleAuth));

/**
 * @swagger
 * /api/v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (optional if using Authorization header)
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  "/refresh-token",
  refreshTokenAuth,
  errorHandler(userController.refreshAccessToken.bind(userController))
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", auth(), userController.getProfile);

/**
 * @swagger
 * /api/v1/users:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put("/", auth(), userController.updateProfile);

/**
 * @swagger
 * /api/v1/users/email:
 *   put:
 *     summary: Update user email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put("/email", auth(), userController.updateEmail);

/**
 * @swagger
 * /api/v1/users/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put("/password", auth(), userController.changePassword);

/**
 * @swagger
 * /api/v1/users/photo:
 *   put:
 *     summary: Update profile photo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put(
  "/photo",
  auth(),
  multerHostMiddleware("userProfile", ["jpg", "jpeg", "png"]).single("image"),
  userController.updateProfilePhoto
);

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     teachingCourses:
 *                       type: number
 *                     enrolledCourses:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/stats", auth(), userController.getUserStats);

/**
 * @swagger
 * /api/v1/users/search:
 *   get:
 *     summary: Search users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/search",
  auth(),
  authorization(systemRoles.ADMIN),
  userController.searchUsers
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user profile by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  "/:id",
  auth(),
  authorization(systemRoles.ADMIN),
  userController.getProfileById
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Cannot delete admin users or not authorized
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  "/:id",
  auth(),
  authorization(systemRoles.ADMIN),
  errorHandler(userController.deleteUser)
);

export default router;

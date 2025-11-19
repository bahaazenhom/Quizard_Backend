import { Router } from "express";
import { GroupController } from "./group.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createGroupSchema,
  updateGroupSchema,
  leaveGroupSchema,
} from "./group.validation.js";
import { auth } from "./../../middlewares/authentication.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { authorization } from "../../middlewares/authorization.middleware.js";

const router = Router();
const groupController = new GroupController();

/**
 * @swagger
 * /api/v1/groups:
 *   get:
 *     summary: Get all groups (Admin only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all groups
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
 *                     $ref: '#/components/schemas/Group'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/",
  auth(),
  authorization(systemRoles.ADMIN),
  errorHandler(groupController.getGroup)
);

/**
 * @swagger
 * /api/v1/groups/me:
 *   get:
 *     summary: Get current user's groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's groups retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [student, teacher]
 *                       group:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Group'
 *                           - type: object
 *                             properties:
 *                               membersCount:
 *                                 type: number
 *                               modulesCount:
 *                                 type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/me", auth(), errorHandler(groupController.getMyGroups));

/**
 * @swagger
 * /api/v1/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group retrieved successfully
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
 *                     group:
 *                       $ref: '#/components/schemas/Group'
 *                     role:
 *                       type: string
 *                       enum: [student, teacher]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not a member of this group
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:id", auth(), errorHandler(groupController.getGroupById));

/**
 * @swagger
 * /api/v1/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 40
 *                 example: Advanced JavaScript Course
 *               coverUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/cover.jpg
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  "/",
  auth(),
  validate(createGroupSchema),
  errorHandler(groupController.createGroup)
);

/**
 * @swagger
 * /api/v1/groups/join:
 *   post:
 *     summary: Join a group using invite code
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: abc123
 *     responses:
 *       201:
 *         description: Successfully joined group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/GroupMember'
 *       400:
 *         description: Invalid invite code
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Already a member or group owner
 *       404:
 *         description: Group not found
 *       409:
 *         description: Already joined this group
 */
router.post("/join", auth(), errorHandler(groupController.joinGroup));

/**
 * @swagger
 * /api/v1/groups/{id}:
 *   patch:
 *     summary: Update a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 40
 *               coverUrl:
 *                 type: string
 *                 format: uri
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  "/:id",
  auth(),
  validate(updateGroupSchema),
  errorHandler(groupController.updateGroup)
);

/**
 * @swagger
 * /api/v1/groups/{id}/hard:
 *   delete:
 *     summary: Permanently delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group permanently deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:id/hard", auth(), errorHandler(groupController.deleteGroup));

/**
 * @swagger
 * /api/v1/groups/{id}:
 *   delete:
 *     summary: Soft delete (archive) a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group archived successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:id", auth(), errorHandler(groupController.deleteGroup));

/**
 * @swagger
 * /api/v1/groups/{id}/leave:
 *   delete:
 *     summary: Leave a group (students only)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Successfully left the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid group ID
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Not authorized (owner or teacher cannot leave, or not a member)
 *       404:
 *         description: Group not found
 */
router.delete(
  "/:id/leave",
  auth(),
  validate(leaveGroupSchema),
  errorHandler(groupController.leaveGroup)
);

/**
 * @swagger
 * /api/v1/groups/{id}/restore:
 *   patch:
 *     summary: Restore an archived group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group restored successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  "/:id/restore",
  auth(),
  errorHandler(groupController.restoreGroup)
);

export default router;

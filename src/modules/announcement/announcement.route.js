import { Router } from "express";
import { AnnouncementController } from "./announcement.controller.js";
import { authentication } from "../../middlewares/authentication.middleware.js";
import { announcementValidation } from "./announcement.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";

const router = Router();
const announcementController = new AnnouncementController();

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     tags: [Announcements]
 *     summary: Create a new announcement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - group
 *             properties:
 *               text:
 *                 type: string
 *               quiz:
 *                 type: string
 *               group:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authentication,
  validation(announcementValidation.createAnnouncement),
  announcementController.createAnnouncement.bind(announcementController)
);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   get:
 *     tags: [Announcements]
 *     summary: Get announcement by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Announcement retrieved successfully
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  authentication,
  announcementController.getAnnouncement.bind(announcementController)
);

/**
 * @swagger
 * /api/v1/announcements/group/{groupId}:
 *   get:
 *     tags: [Announcements]
 *     summary: Get announcements for a group with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Group announcements retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/group/:groupId",
  authentication,
  announcementController.getGroupAnnouncements.bind(announcementController)
);

/**
 * @swagger
 * /api/v1/announcements/author/{userId}:
 *   get:
 *     tags: [Announcements]
 *     summary: Get announcements by author with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Author announcements retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/author/:userId",
  authentication,
  announcementController.getAuthorAnnouncements.bind(announcementController)
);

/**
 * @swagger
 * /api/v1/announcements/search/{groupId}:
 *   get:
 *     tags: [Announcements]
 *     summary: Search announcements in a group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Search query required
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/search/:groupId",
  authentication,
  announcementController.searchAnnouncements.bind(announcementController)
);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   put:
 *     tags: [Announcements]
 *     summary: Update announcement (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               quiz:
 *                 type: string
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  authentication,
  validation(announcementValidation.updateAnnouncement),
  announcementController.updateAnnouncement.bind(announcementController)
);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   delete:
 *     tags: [Announcements]
 *     summary: Delete announcement (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Announcement not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  authentication,
  announcementController.deleteAnnouncement.bind(announcementController)
);

export { router as announcementRouter };

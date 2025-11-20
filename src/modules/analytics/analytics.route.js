import { Router } from "express";
import { AnalyticsController } from "./analytics.controller.js";
import { errorHandler } from "../../middlewares/globalErrorHandler.middleware.js";
import { auth } from "../../middlewares/authentication.middleware.js";
import { systemRoles } from "../../utils/system-roles.util.js";
import { authorization } from "../../middlewares/authorization.middleware.js";

const router = Router();
const analyticsController = new AnalyticsController();

/**
 * @swagger
 * /api/v1/analytics/logins/daily:
 *   get:
 *     summary: Get daily login statistics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD) - defaults to 30 days ago
 *         example: 2025-10-20
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD) - defaults to today
 *         example: 2025-11-20
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of days to retrieve (default 30)
 *         example: 30
 *     responses:
 *       200:
 *         description: Daily login statistics retrieved successfully
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
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2025-11-20"
 *                           uniqueUsers:
 *                             type: number
 *                             example: 45
 *                           totalLogins:
 *                             type: number
 *                             example: 67
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalLogins:
 *                           type: number
 *                         totalUniqueUsers:
 *                           type: number
 *                         dateRange:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                             end:
 *                               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/logins/daily",
  auth(),
  authorization(systemRoles.ADMIN),
  errorHandler(analyticsController.getDailyLoginStats)
);

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     summary: Get overall platform statistics (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                       description: Total registered users
 *                       example: 1250
 *                     activeUsers:
 *                       type: number
 *                       description: Currently active users
 *                       example: 850
 *                     todayLogins:
 *                       type: number
 *                       description: Number of logins today
 *                       example: 234
 *                     last7Days:
 *                       type: object
 *                       properties:
 *                         totalLogins:
 *                           type: number
 *                         uniqueUsers:
 *                           type: number
 *                         averageLoginsPerDay:
 *                           type: number
 *                     last30Days:
 *                       type: object
 *                       properties:
 *                         totalLogins:
 *                           type: number
 *                         uniqueUsers:
 *                           type: number
 *                         averageLoginsPerDay:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - Admin only
 */
router.get(
  "/overview",
  auth(),
  authorization(systemRoles.ADMIN),
  errorHandler(analyticsController.getOverallStats)
);

export default router;

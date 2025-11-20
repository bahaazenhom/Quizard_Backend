import { AnalyticsService } from "./analytics.service.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  /**
   * Get daily login statistics
   * GET /api/v1/analytics/logins/daily
   */
  async getDailyLoginStats(req, res, next) {
    try {
      const { startDate, endDate, limit } = req.query;

      const stats = await analyticsService.getDailyLoginStats(
        startDate,
        endDate,
        limit ? parseInt(limit) : 30
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overall platform statistics
   * GET /api/v1/analytics/overview
   */
  async getOverallStats(req, res, next) {
    try {
      const stats = await analyticsService.getOverallStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

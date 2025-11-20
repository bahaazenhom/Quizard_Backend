import LoginActivity from "../../models/loginActivity.model.js";
import User from "../../models/user.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import moment from "moment";

export class AnalyticsService {
  /**
   * Record a user login activity
   */
  async recordLogin(userId, ipAddress, userAgent) {
    try {
      const loginActivity = new LoginActivity({
        user: userId,
        loginDate: new Date(),
        ipAddress,
        userAgent,
      });
      await loginActivity.save();
      return loginActivity;
    } catch (error) {
      throw new ErrorClass(
        "Failed to record login activity",
        500,
        error.message,
        "AnalyticsService.recordLogin"
      );
    }
  }

  /**
   * Get daily login statistics for the specified date range
   */
  async getDailyLoginStats(startDate, endDate, limit = 30) {
    try {
      const start = startDate
        ? moment(startDate).startOf("day").toDate()
        : moment()
            .subtract(limit - 1, "days")
            .startOf("day")
            .toDate();
      const end = endDate
        ? moment(endDate).endOf("day").toDate()
        : moment().endOf("day").toDate();

      const dailyStats = await LoginActivity.aggregate([
        {
          $match: {
            loginDate: {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$loginDate",
              },
            },
            uniqueUsers: { $addToSet: "$user" },
            totalLogins: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            uniqueUsers: { $size: "$uniqueUsers" },
            totalLogins: 1,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      // Fill in missing dates with zero values
      const filledStats = this.fillMissingDates(dailyStats, start, end);

      return {
        stats: filledStats,
        summary: {
          totalLogins: filledStats.reduce(
            (sum, day) => sum + day.totalLogins,
            0
          ),
          totalUniqueUsers: await this.getUniqueUsersCount(start, end),
          dateRange: {
            start: moment(start).format("YYYY-MM-DD"),
            end: moment(end).format("YYYY-MM-DD"),
          },
        },
      };
    } catch (error) {
      throw new ErrorClass(
        "Failed to get daily login stats",
        500,
        error.message,
        "AnalyticsService.getDailyLoginStats"
      );
    }
  }

  /**
   * Fill missing dates with zero values
   */
  fillMissingDates(stats, startDate, endDate) {
    const filledData = [];
    const statsMap = new Map(stats.map((s) => [s.date, s]));

    let currentDate = moment(startDate).startOf("day");
    const end = moment(endDate).endOf("day");

    while (currentDate.isSameOrBefore(end, "day")) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      filledData.push(
        statsMap.get(dateStr) || {
          date: dateStr,
          uniqueUsers: 0,
          totalLogins: 0,
        }
      );
      currentDate.add(1, "day");
    }

    return filledData;
  }

  /**
   * Get count of unique users who logged in during the period
   */
  async getUniqueUsersCount(startDate, endDate) {
    try {
      const uniqueUsers = await LoginActivity.distinct("user", {
        loginDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      return uniqueUsers.length;
    } catch (error) {
      throw new ErrorClass(
        "Failed to get unique users count",
        500,
        error.message,
        "AnalyticsService.getUniqueUsersCount"
      );
    }
  }

  /**
   * Get overall platform statistics
   */
  async getOverallStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        todayLogins,
        last7DaysStats,
        last30DaysStats,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        this.getTodayLoginsCount(),
        this.getPeriodStats(7),
        this.getPeriodStats(30),
      ]);

      return {
        totalUsers,
        activeUsers,
        todayLogins,
        last7Days: last7DaysStats,
        last30Days: last30DaysStats,
      };
    } catch (error) {
      throw new ErrorClass(
        "Failed to get overall stats",
        500,
        error.message,
        "AnalyticsService.getOverallStats"
      );
    }
  }

  /**
   * Get today's login count
   */
  async getTodayLoginsCount() {
    try {
      const startOfDay = moment().startOf("day").toDate();
      const endOfDay = moment().endOf("day").toDate();

      const count = await LoginActivity.countDocuments({
        loginDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      return count;
    } catch (error) {
      throw new ErrorClass(
        "Failed to get today logins count",
        500,
        error.message,
        "AnalyticsService.getTodayLoginsCount"
      );
    }
  }

  /**
   * Get stats for a specific period
   */
  async getPeriodStats(days) {
    try {
      const startDate = moment()
        .subtract(days - 1, "days")
        .startOf("day")
        .toDate();
      const endDate = moment().endOf("day").toDate();

      const [totalLogins, uniqueUsers] = await Promise.all([
        LoginActivity.countDocuments({
          loginDate: {
            $gte: startDate,
            $lte: endDate,
          },
        }),
        this.getUniqueUsersCount(startDate, endDate),
      ]);

      return {
        totalLogins,
        uniqueUsers,
        averageLoginsPerDay: Math.round(totalLogins / days),
      };
    } catch (error) {
      throw new ErrorClass(
        "Failed to get period stats",
        500,
        error.message,
        "AnalyticsService.getPeriodStats"
      );
    }
  }
}

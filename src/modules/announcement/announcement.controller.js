import { AnnouncementService } from "./announcement.service.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

const announcementService = new AnnouncementService();

export class AnnouncementController {
  /**
   * Create a new announcement
   * POST /api/v1/announcements
   */
  async createAnnouncement(req, res, next) {
    try {
      const { text, quiz, group } = req.body;
      const userId = req.authUser._id;

      if (!text || !group) {
        return next(
          new ErrorClass(
            "text and group are required",
            400,
            { text, group },
            "createAnnouncement"
          )
        );
      }

      const announcementData = {
        author: userId,
        text,
        group,
        ...(quiz && { quiz }),
      };

      const announcement = await announcementService.createAnnouncement(
        announcementData
      );

      return res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        data: announcement,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to create announcement",
          500,
          error.message,
          "createAnnouncement"
        )
      );
    }
  }

  /**
   * Get announcement by ID
   * GET /api/v1/announcements/:id
   */
  async getAnnouncement(req, res, next) {
    try {
      const { id } = req.params;

      const announcement = await announcementService.getAnnouncementById(id);

      return res.json({
        success: true,
        message: "Announcement retrieved successfully",
        data: announcement,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to get announcement",
          404,
          error.message,
          "getAnnouncement"
        )
      );
    }
  }

  /**
   * Get announcements for a group
   * GET /api/v1/announcements/group/:groupId
   */
  async getGroupAnnouncements(req, res, next) {
    try {
      const { groupId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await announcementService.getAnnouncementsByGroup(
        groupId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
        }
      );

      return res.json({
        success: true,
        message: "Group announcements retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to get group announcements",
          500,
          error.message,
          "getGroupAnnouncements"
        )
      );
    }
  }

  /**
   * Get announcements by author
   * GET /api/v1/announcements/author/:userId
   */
  async getAuthorAnnouncements(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await announcementService.getAnnouncementsByAuthor(
        userId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
        }
      );

      return res.json({
        success: true,
        message: "Author announcements retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to get author announcements",
          500,
          error.message,
          "getAuthorAnnouncements"
        )
      );
    }
  }

  /**
   * Update announcement
   * PUT /api/v1/announcements/:id
   */
  async updateAnnouncement(req, res, next) {
    try {
      const { id } = req.params;
      const { text, quiz } = req.body;
      const userId = req.authUser._id;

      // Check if user is the author
      const announcement = await announcementService.getAnnouncementById(id);

      if (announcement.author._id.toString() !== userId.toString()) {
        return next(
          new ErrorClass(
            "Not authorized to update this announcement",
            403,
            null,
            "updateAnnouncement"
          )
        );
      }

      const updateData = {};
      if (text !== undefined) updateData.text = text;
      if (quiz !== undefined) updateData.quiz = quiz;

      const updatedAnnouncement = await announcementService.updateAnnouncement(
        id,
        updateData
      );

      return res.json({
        success: true,
        message: "Announcement updated successfully",
        data: updatedAnnouncement,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to update announcement",
          500,
          error.message,
          "updateAnnouncement"
        )
      );
    }
  }

  /**
   * Delete announcement
   * DELETE /api/v1/announcements/:id
   */
  async deleteAnnouncement(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.authUser._id;

      // Check if user is the author
      const announcement = await announcementService.getAnnouncementById(id);

      if (announcement.author._id.toString() !== userId.toString()) {
        return next(
          new ErrorClass(
            "Not authorized to delete this announcement",
            403,
            null,
            "deleteAnnouncement"
          )
        );
      }

      await announcementService.deleteAnnouncement(id);

      return res.json({
        success: true,
        message: "Announcement deleted successfully",
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to delete announcement",
          500,
          error.message,
          "deleteAnnouncement"
        )
      );
    }
  }

  /**
   * Search announcements in a group
   * GET /api/v1/announcements/search/:groupId
   */
  async searchAnnouncements(req, res, next) {
    try {
      const { groupId } = req.params;
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return next(
          new ErrorClass(
            "Search query (q) is required",
            400,
            null,
            "searchAnnouncements"
          )
        );
      }

      const result = await announcementService.searchAnnouncements(groupId, q, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.json({
        success: true,
        message: "Announcements search results",
        data: result,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to search announcements",
          500,
          error.message,
          "searchAnnouncements"
        )
      );
    }
  }
}

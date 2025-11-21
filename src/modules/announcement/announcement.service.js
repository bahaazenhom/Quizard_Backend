import Announcement from "../../models/announcement.model.js";

export class AnnouncementService {
  /**
   * Create a new announcement
   * @param {Object} data - { author, text, quiz, group }
   * @returns {Promise<Object>} Created announcement
   */
  async createAnnouncement(data) {
    try {
      const announcement = await Announcement.create(data);
      return await announcement.populate(["author", "quiz", "group"]);
    } catch (error) {
      throw new Error("Failed to create announcement: " + error.message);
    }
  }

  /**
   * Get announcement by ID
   * @param {string} announcementId
   * @returns {Promise<Object>} Announcement with populated references
   */
  async getAnnouncementById(announcementId) {
    try {
      const announcement = await Announcement.findById(announcementId).populate(
        ["author", "quiz", "group"]
      );
      if (!announcement) {
        throw new Error("Announcement not found");
      }
      return announcement;
    } catch (error) {
      throw new Error("Failed to get announcement: " + error.message);
    }
  }

  /**
   * Get all announcements for a group
   * @param {string} groupId
   * @param {Object} options - { page, limit, sort }
   * @returns {Promise<{announcements: Array, total: number, pages: number}>}
   */
  async getAnnouncementsByGroup(groupId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = options;
      const skip = (page - 1) * limit;

      const announcements = await Announcement.find({ group: groupId })
        .populate(["author", "quiz"])
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Announcement.countDocuments({ group: groupId });

      return {
        announcements,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new Error("Failed to get group announcements: " + error.message);
    }
  }

  /**
   * Get all announcements created by a user
   * @param {string} userId
   * @param {Object} options - { page, limit, sort }
   * @returns {Promise<{announcements: Array, total: number, pages: number}>}
   */
  async getAnnouncementsByAuthor(userId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt" } = options;
      const skip = (page - 1) * limit;

      const announcements = await Announcement.find({ author: userId })
        .populate(["quiz", "group"])
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Announcement.countDocuments({ author: userId });

      return {
        announcements,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new Error("Failed to get author announcements: " + error.message);
    }
  }

  /**
   * Update announcement
   * @param {string} announcementId
   * @param {Object} updateData - { text, quiz }
   * @returns {Promise<Object>} Updated announcement
   */
  async updateAnnouncement(announcementId, updateData) {
    try {
      // Only allow updating text and quiz, not author or group
      const allowedFields = ["text", "quiz"];
      const cleanedData = {};

      allowedFields.forEach((field) => {
        if (field in updateData) {
          cleanedData[field] = updateData[field];
        }
      });

      const announcement = await Announcement.findByIdAndUpdate(
        announcementId,
        { $set: cleanedData },
        { new: true }
      ).populate(["author", "quiz", "group"]);

      if (!announcement) {
        throw new Error("Announcement not found");
      }

      return announcement;
    } catch (error) {
      throw new Error("Failed to update announcement: " + error.message);
    }
  }

  /**
   * Delete announcement
   * @param {string} announcementId
   * @returns {Promise<Object>} Deleted announcement
   */
  async deleteAnnouncement(announcementId) {
    try {
      const announcement = await Announcement.findByIdAndDelete(announcementId);
      if (!announcement) {
        throw new Error("Announcement not found");
      }
      return announcement;
    } catch (error) {
      throw new Error("Failed to delete announcement: " + error.message);
    }
  }

  /**
   * Get total announcements count for a group
   * @param {string} groupId
   * @returns {Promise<number>}
   */
  async countGroupAnnouncements(groupId) {
    try {
      return await Announcement.countDocuments({ group: groupId });
    } catch (error) {
      throw new Error("Failed to count announcements: " + error.message);
    }
  }

  /**
   * Search announcements by text in a group
   * @param {string} groupId
   * @param {string} searchText
   * @param {Object} options - { page, limit }
   * @returns {Promise<{announcements: Array, total: number}>}
   */
  async searchAnnouncements(groupId, searchText, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const announcements = await Announcement.find({
        group: groupId,
        text: { $regex: searchText, $options: "i" },
      })
        .populate(["author", "quiz"])
        .sort("-createdAt")
        .skip(skip)
        .limit(limit);

      const total = await Announcement.countDocuments({
        group: groupId,
        text: { $regex: searchText, $options: "i" },
      });

      return {
        announcements,
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error("Failed to search announcements: " + error.message);
    }
  }
}

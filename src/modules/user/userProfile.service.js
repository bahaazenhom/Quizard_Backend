import User from "../../models/user.model.js";
import mongoose from "mongoose";

class UserProfileService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("currentSubscription");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Fields that shouldn't be updated through this method
    const restrictedFields = ["password", "role", "isConfirmed"];
    restrictedFields.forEach((field) => delete updateData[field]);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update user email (requires verification)
   */
  async updateUserEmail(userId, newEmail) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error("Email already in use");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email: newEmail, isConfirmed: false },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: "Password updated successfully" };
  }

  /**
   * Upload/Update profile photo
   */
  async updateProfilePhoto(userId, photoURL) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { photoURL },
      { new: true }
    ).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findById(userId)
      .select("teachingCourses enrolledCourses")
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    return {
      teachingCourses: user.teachingCourses || 0,
      enrolledCourses: user.enrolledCourses || 0,
    };
  }

  /**
   * Search users (for admin)
   */
  async searchUsers(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const searchCriteria = {};
    if (query.email) {
      searchCriteria.email = { $regex: query.email, $options: "i" };
    }
    if (query.firstName) {
      searchCriteria.firstName = { $regex: query.firstName, $options: "i" };
    }
    if (query.lastName) {
      searchCriteria.lastName = { $regex: query.lastName, $options: "i" };
    }
    if (query.role) {
      searchCriteria.role = query.role;
    }
    if (query.isActive !== undefined) {
      searchCriteria.isActive = query.isActive;
    }

    const users = await User.find(searchCriteria)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchCriteria);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasMore: skip + users.length < total,
      },
    };
  }
}

export default new UserProfileService();

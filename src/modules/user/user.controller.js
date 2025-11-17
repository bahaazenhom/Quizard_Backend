import { UserService } from "./user.service.js";
import UserProfileService from "./userProfile.service.js";
import {
  generateAccessToken,
  verifyAccessToken,
} from "../../utils/jwt.util.js";
import { log } from "console";
import { cloudinaryConfig } from "../../config/cloudinary.config.js";
const userService = new UserService();

export class UserController {
  async registerUser(req, res) {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  }

  async confirmEmail(req, res) {
    const { userId } = req.params;
    if (!userId) {
      return next(
        new ErrorClass("userId is required", 400, "Validation Error")
      );
    }
    const updatedUser = await userService.updateUser(userId, {
      isConfirmed: true,
    });
    if (!updatedUser) {
      return next(new ErrorClass("User not found", 404, "Validation Error"));
    }
    const accessToken = generateAccessToken({ userId: updatedUser._id });
    res
      .status(200)
      .json({ message: "Email confirmed successfully", accessToken });
  }

  async loginUser(req, res) {
    const { email, password } = req.body;
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isConfirmed) {
      return res.status(401).json({ message: "Email not verified" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await userService.updateUser(user._id, { isActive: true });
    const accessToken = generateAccessToken({
      userId: user._id,
    });
    res.status(200).json({ message: "Login successful", accessToken });
  }
  // profile controller methods will be here in future
  /**
   * Get current user profile
   * GET /api/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.authUser._id;
      const user = await UserProfileService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile by ID (admin only)
   * GET /api/profile/:id
   */
  async getProfileById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserProfileService.getUserProfile(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.authUser._id;
      const updateData = req.body;

      const user = await UserProfileService.updateUserProfile(
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user email
   * PUT /api/profile/email
   */
  async updateEmail(req, res, next) {
    try {
      const userId = req.authUser._id;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await UserProfileService.updateUserEmail(userId, email);

      res.status(200).json({
        success: true,
        message: "Email updated successfully. Please verify your new email.",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * PUT /api/profile/password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.authUser._id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long",
        });
      }

      const result = await UserProfileService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile photo
   * PUT /api/profile/photo
   */
  async updateProfilePhoto(req, res, next) {
    try {
      const userId = req.authUser._id;
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Photo file is required",
        });
      }
      const data = await cloudinaryConfig().uploader.upload(req.file.path, {
        folder: "profile_photos",
        resource_type: "image",
        use_filename: true,
      });
      const photoURL = data.secure_url;
      const user = await UserProfileService.updateProfilePhoto(
        userId,
        photoURL
      );

      res.status(200).json({
        success: true,
        message: "Profile photo updated successfully",
        data: user,
        photoURL: photoURL, // Return the URL for frontend
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/profile/stats
   */
  async getUserStats(req, res, next) {
    try {
      const userId = req.authUser._id;
      const stats = await UserProfileService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search users (admin only)
   * GET /api/profile/search
   */
  async searchUsers(req, res, next) {
    try {
      const { email, firstName, lastName, role, isActive, page, limit } =
        req.query;

      const query = {};
      if (email) query.email = email;
      if (firstName) query.firstName = firstName;
      if (lastName) query.lastName = lastName;
      if (role) query.role = role;
      if (isActive !== undefined) query.isActive = isActive === "true";

      const result = await UserProfileService.searchUsers(
        query,
        parseInt(page) || 1,
        parseInt(limit) || 10
      );

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

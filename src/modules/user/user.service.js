import User from "../../models/user.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";

export class UserService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      const confirmationLink = `https://quizardbackend-production-c78c.up.railway.app/api/v1/users/confirm-email/${user._id}`;
      await sendVerificationEmail(user.email, user.firstName, confirmationLink);

      return user;
    } catch (error) {
      throw new ErrorClass(
        "Failed to create user",
        500,
        error.message,
        "UserService.createUser"
      );
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw new ErrorClass(
        "Failed to get user by email",
        500,
        error.message,
        "UserService.getUserByEmail"
      );
    }
  }

  async updateUser(userId, updateData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      return updatedUser;
    } catch (error) {
      throw new ErrorClass(
        "Failed to update user",
        500,
        error.message,
        "UserService.updateUser"
      );
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      return user;
    } catch (error) {
      throw new ErrorClass(
        "Failed to delete user",
        500,
        error.message,
        "UserService.deleteUser"
      );
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select("-password");
      return user;
    } catch (error) {
      throw new ErrorClass(
        "Failed to get user by ID",
        500,
        error.message,
        "UserService.getUserById"
      );
    }
  }
}

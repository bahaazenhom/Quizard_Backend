import User from "../../models/user.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";

export class UserService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      const confirmationLink = `http://localhost:3000/api/v1/users/confirm-email/${user._id}`;
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
}

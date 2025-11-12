import User from "../../models/user.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";

export class UserService {
  async createUser(userData) {
    try {
      const user = new User(userData);
      // confirmation Link
      await user.save();
      const confirmationLink = `https://localhost/confirm-email/${user._id}`;
      // send email
      const isEmailSent = await sendVerificationEmail({
        to: user.email,
        confirmationLink,
      });

      if (isEmailSent?.rejected?.length) {
        return res.status(400).json({ message: "Email not sent" });
      }
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
}

import { UserService } from "./user.service.js";
import {
  generateAccessToken,
  verifyAccessToken,
} from "../../utils/jwt.util.js";
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
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const accessToken = generateAccessToken({ userId: user._id });
    user.isVerified = true;
    await user.save();
    res
      .status(200)
      .json({ message: "Email confirmed successfully", accessToken });
  }

  async loginUser(req, res) {
    const { email } = req.body;
    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified" });
    }
    const accessToken = generateAccessToken({
      userId: user._id,
    });
    res.status(200).json({ message: "Login successful", accessToken });
  }
}

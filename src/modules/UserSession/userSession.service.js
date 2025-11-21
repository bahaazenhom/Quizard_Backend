import UserSession from "../../models/userSession.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class UserSessionService {
  async createSession(sessionId, userId) {
    try {
      const session = await UserSession.create({ sessionId, userId });
      return session;
    } catch (error) {
      throw new ErrorClass(
        "Failed to create user session",
        500,
        error.message,
        "UserSessionService.createSession"
      );
    }
  }

  async findBySessionId(sessionId) {
    try {
      return await UserSession.findOne({ sessionId });
    } catch (error) {
      throw new ErrorClass(
        "Failed to fetch user session",
        500,
        error.message,
        "UserSessionService.findBySessionId"
      );
    }
  }

  async deleteBySessionId(sessionId) {
    try {
      return await UserSession.findOneAndDelete({ sessionId });
    } catch (error) {
      throw new ErrorClass(
        "Failed to delete user session",
        500,
        error.message,
        "UserSessionService.deleteBySessionId"
      );
    }
  }

  async deleteByUserId(userId) {
    try {
      return await UserSession.deleteMany({ userId });
    } catch (error) {
      throw new ErrorClass(
        "Failed to delete user sessions",
        500,
        error.message,
        "UserSessionService.deleteByUserId"
      );
    }
  }
}

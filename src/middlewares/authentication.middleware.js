import User from "../models/user.model.js";
import { ErrorClass } from "../utils/errorClass.util.js";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { mcpServiceAuthentication } from "./mcpServiceAuthentication.js";
import UserSession from "../models/userSession.model.js";

export const auth = () => {
  return async (req, res, next) => {

    // MCP service authentication path
    if (req.headers["authentication-service"]) {
      try {
        // Validate MCP service token via middleware logic
        await mcpServiceAuthentication(req, res, async () => {
          const sessionId = req.headers["session-id"];
          if (!sessionId) {
            return next(
              new ErrorClass(
                "Unauthorized: session-id header is required for MCP requests",
                401
              )
            );
          }

          const userSession = await UserSession.findOne({ sessionId });
          if (!userSession) {
            return next(new ErrorClass("Not authenticated", 401));
          }

          const user = await User.findById(userSession.userId).select("-password");
          if (!user) {
            return next(new ErrorClass("User not found", 404));
          }

          req.authUser = user;
          return next();
        });
        return; // ensure we don't fall through to normal auth
      } catch (error) {
        // mcpServiceAuthentication already handled response on failure
        return;
      }
    }

    // Normal user authentication flow
    const { authorization } = req.headers;

    // check if token is exists
    if (!authorization) {
      return next(
        new ErrorClass("Token is required", 404, "Token is required")
      );
    }

    // retrieve original token after adding the prefix
    const originalToken = authorization.split(" ")[1];

    // verify token
    const data = verifyAccessToken(originalToken);
    // check if token payload has userId
    if (!data?.userId) {
      return next(
        new ErrorClass(
          "Invalid token payload",
          400,
          "Invalid token payload",
          "authentication.middleware.js"
        )
      );
    }
    // find user by userId
    const isUserExists = await User.findById(data?.userId).select("-password");
    if (!isUserExists) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }
    // add the user data in req object
    req.authUser = isUserExists;
    next();
  };
};

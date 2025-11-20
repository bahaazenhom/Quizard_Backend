import { ErrorClass } from "../utils/errorClass.util.js";

export const authorization = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.authUser) {
      return next(
        new ErrorClass(
          "Unauthorized - Authentication required",
          401,
          "Unauthorized - Authentication required"
        )
      );
    }
    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.authUser.role)) {
      return next(
        new ErrorClass(
          "Forbidden - You don't have permission to access this resource",
          403,
          "Forbidden - You don't have permission to access this resource",
          "authorization.middleware.js"
        )
      );
    }

    // Check if user account is active
    if (!req.authUser.isActive) {
      return next(
        new ErrorClass(
          "Account is deactivated",
          403,
          "Account is deactivated",
          "authorization.middleware.js"
        )
      );
    }

    next();
  };
};

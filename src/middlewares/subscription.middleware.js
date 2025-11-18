import User from "../models/user.model.js";

export const requireSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "currentSubscription"
    );

    if (!user || !user.currentSubscription)
      return next(
        new ErrorClass("No active subscription", 403, "No active subscription")
      );

    const now = new Date();
    if (now > user.currentSubscription.endDate)
      return next(
        new ErrorClass("Subscription expired", 403, "Subscription expired")
      );

    next();
  } catch (err) {
    return next(
      new ErrorClass(
        "Subscription check failed",
        500,
        "Subscription check failed"
      )
    );
  }
};

import Subscription from "../../models/subscription.model.js";

export class SubscriptionService {
  async createOrUpdateSubscription(data) {
    try {
      // Deactivate any existing active subscription for this user
      await Subscription.updateMany(
        { user: data.user, isActive: true },
        { $set: { isActive: false } }
      );

      // Create or update the subscription
      return await Subscription.findOneAndUpdate(
        { user: data.user, stripeSubscriptionId: data.stripeSubscriptionId },
        { $set: { ...data, isActive: true } },
        { new: true, upsert: true }
      );
    } catch (error) {
      throw new Error("Failed to create/update subscription: " + error.message);
    }
  }

  async getSubscriptionByUserId(userId) {
    try {
      return await Subscription.findOne({
        user: userId,
        isActive: true,
      }).populate({
        path: "plan",
        select: "name price credits",
      });
    } catch (error) {
      throw new Error("Failed to get subscription: " + error.message);
    }
  }

  async deactivateSubscription(userId) {
    try {
      return await Subscription.updateMany(
        { user: userId, isActive: true },
        { $set: { isActive: false, status: "canceled" } }
      );
    } catch (error) {
      throw new Error("Failed to deactivate subscription: " + error.message);
    }
  }
}

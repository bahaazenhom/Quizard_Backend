import Subscription from "../../models/subscription.model.js";

export class SubscriptionService {
  async createOrUpdateSubscription(data) {
    try {
      return await Subscription.findOneAndUpdate(
        { user: data.user },
        { $set: data },
        { new: true, upsert: true }
      );
    } catch (error) {
      throw new Error("Failed to create/update subscription: " + error.message);
    }
  }

  async getSubscriptionByUserId(userId) {
    try {
      return await Subscription.findOne({ user: userId });
    } catch (error) {
      throw new Error("Failed to get subscription: " + error.message);
    }
  }

  async deactivateSubscription(userId) {
    try {
      return await Subscription.findOneAndUpdate(
        { user: userId },
        { $set: { isActive: false } }
      );
    } catch (error) {
      throw new Error("Failed to deactivate subscription: " + error.message);
    }
  }
}

import Subscription from "../../models/subscription.model.js";
import Plan from "../../models/plan.model.js";
import moment from "moment";

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

  /**
   * Renew free subscriptions that have expired
   * Should be called by a cron job daily
   */
  async renewExpiredFreeSubscriptions() {
    try {
      const now = new Date();

      // Find all expired free subscriptions
      const expiredFreeSubscriptions = await Subscription.find({
        stripeSubscriptionId: { $regex: /^free_/ },
        endDate: { $lte: now },
        isActive: true,
      }).populate("plan");

      const renewed = [];

      for (const subscription of expiredFreeSubscriptions) {
        // Only renew if it's still a free plan
        if (subscription.plan && subscription.plan.price === 0) {
          const newStartDate = moment().toDate();
          const newEndDate = moment().add(30, "days").toDate();

          await Subscription.findByIdAndUpdate(subscription._id, {
            $set: {
              startDate: newStartDate,
              endDate: newEndDate,
              creditsAllocated: subscription.plan.credits,
              creditsUsed: 0, // Reset credits
              status: "active",
              isActive: true,
            },
          });

          renewed.push(subscription._id);
        }
      }

      return {
        message: `Renewed ${renewed.length} free subscriptions`,
        renewedSubscriptions: renewed,
      };
    } catch (error) {
      throw new Error("Failed to renew free subscriptions: " + error.message);
    }
  }
}

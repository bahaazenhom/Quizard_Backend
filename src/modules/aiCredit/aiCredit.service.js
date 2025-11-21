import Subscription from "../../models/subscription.model.js";

export class AICreditService {
  /**
   * Get remaining AI credits for a user from their active subscription
   * @param {string} userId - User ID
   * @returns {Promise<{creditsRemaining: number, creditsAllocated: number, creditsUsed: number}>}
   */
  async getRemainingCredits(userId) {
    try {
      const subscription = await Subscription.findOne({
        user: userId,
        isActive: true,
      });

      if (!subscription) {
        throw new Error("No active subscription found for user");
      }

      return {
        creditsRemaining: subscription.creditsRemaining,
        creditsAllocated: subscription.creditsAllocated,
        creditsUsed: subscription.creditsUsed,
        subscriptionId: subscription._id,
      };
    } catch (error) {
      throw new Error("Failed to get remaining credits: " + error.message);
    }
  }

  /**
   * Deduct AI credits from user's subscription
   * @param {string} userId - User ID
   * @param {number} creditsToDeduct - Number of credits to deduct
   * @returns {Promise<{creditsRemaining: number, creditsUsed: number}>}
   */
  async deductCredits(userId, creditsToDeduct) {
    try {
      if (!creditsToDeduct || creditsToDeduct <= 0) {
        throw new Error("Credits to deduct must be a positive number");
      }

      const subscription = await Subscription.findOne({
        user: userId,
        isActive: true,
      });

      if (!subscription) {
        throw new Error("No active subscription found for user");
      }

      // Check if user has enough credits
      if (subscription.creditsRemaining < creditsToDeduct) {
        throw new Error(
          `Insufficient credits. Available: ${subscription.creditsRemaining}, Required: ${creditsToDeduct}`
        );
      }

      // Deduct credits
      subscription.creditsUsed += creditsToDeduct;
      await subscription.save();

      return {
        creditsRemaining: subscription.creditsRemaining,
        creditsUsed: subscription.creditsUsed,
        creditsDeducted: creditsToDeduct,
      };
    } catch (error) {
      throw new Error("Failed to deduct credits: " + error.message);
    }
  }

  /**
   * Refund AI credits (in case of failed operation)
   * @param {string} userId - User ID
   * @param {number} creditsToRefund - Number of credits to refund
   * @returns {Promise<{creditsRemaining: number, creditsUsed: number}>}
   */
  async refundCredits(userId, creditsToRefund) {
    try {
      if (!creditsToRefund || creditsToRefund <= 0) {
        throw new Error("Credits to refund must be a positive number");
      }

      const subscription = await Subscription.findOne({
        user: userId,
        isActive: true,
      });

      if (!subscription) {
        throw new Error("No active subscription found for user");
      }

      // Refund credits (decrease used credits)
      subscription.creditsUsed = Math.max(
        0,
        subscription.creditsUsed - creditsToRefund
      );
      await subscription.save();

      return {
        creditsRemaining: subscription.creditsRemaining,
        creditsUsed: subscription.creditsUsed,
        creditsRefunded: creditsToRefund,
      };
    } catch (error) {
      throw new Error("Failed to refund credits: " + error.message);
    }
  }
}

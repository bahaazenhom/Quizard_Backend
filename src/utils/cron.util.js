import cron from "node-cron";
import { SubscriptionService } from "../modules/subscription/subscription.service.js";

const subscriptionService = new SubscriptionService();

/**
 * Schedule a daily cron job to renew expired free subscriptions
 * Runs every day at 00:00 (midnight)
 */
export const scheduleFreeSubscriptionRenewal = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await subscriptionService.renewExpiredFreeSubscriptions();
    } catch (error) {
      console.error("[CRON] Error renewing free subscriptions:", error.message);
    }
  });
};

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  scheduleFreeSubscriptionRenewal();
};

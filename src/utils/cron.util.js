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
      console.log("[CRON] Starting free subscription renewal check...");
      const result = await subscriptionService.renewExpiredFreeSubscriptions();
      console.log(`[CRON] ${result.message}`);
    } catch (error) {
      console.error("[CRON] Error renewing free subscriptions:", error.message);
    }
  });

  console.log(
    "[CRON] Free subscription renewal job scheduled (daily at midnight)"
  );
};

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  scheduleFreeSubscriptionRenewal();
};

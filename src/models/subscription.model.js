import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       required:
 *         - user
 *         - plan
 *         - stripeSubscriptionId
 *         - creditsAllocated
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         user:
 *           type: string
 *           description: Reference to User
 *         plan:
 *           type: string
 *           description: Reference to Plan
 *         stripeSubscriptionId:
 *           type: string
 *           description: Stripe subscription ID (unique)
 *           example: sub_1234567890
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Subscription start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Subscription end date
 *         status:
 *           type: string
 *           description: Subscription status
 *           example: active
 *           enum: [active, past_due, canceled, unpaid, incomplete]
 *         creditsAllocated:
 *           type: number
 *           description: Total credits allocated
 *           example: 100
 *         creditsUsed:
 *           type: number
 *           default: 0
 *           description: Credits used
 *           example: 25
 *         creditsRemaining:
 *           type: number
 *           description: Virtual field - remaining credits
 *           example: 75
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    // Stripe subscription id
    stripeSubscriptionId: { type: String, required: true, unique: true },

    // dates from Stripe but store local for convenience
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: String, // active, past_due, canceled, unpaid, incomplete, etc.
    isActive: { type: Boolean, default: true },
    creditsAllocated: { type: Number, required: true },
    creditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subscriptionSchema.virtual("creditsRemaining").get(function () {
  return Math.max(0, this.creditsAllocated - this.creditsUsed);
});

subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ user: 1, isActive: 1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

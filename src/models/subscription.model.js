import mongoose from "mongoose";

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

    creditsAllocated: { type: Number, required: true },
    creditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

subscriptionSchema.virtual("creditsRemaining").get(function () {
  return Math.max(0, this.creditsAllocated - this.creditsUsed);
});

subscriptionSchema.index({ user: 1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

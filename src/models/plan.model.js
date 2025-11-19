import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stripePriceId
 *         - credits
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: Plan name (unique)
 *           example: Premium Plan
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Plan price
 *           example: 29.99
 *         stripePriceId:
 *           type: string
 *           description: Stripe price ID (unique)
 *           example: price_1234567890
 *         credits:
 *           type: number
 *           minimum: 0
 *           description: Credits allocated per billing cycle
 *           example: 100
 *         description:
 *           type: string
 *           description: Plan description
 *           example: Best for power users
 *         feature:
 *           type: array
 *           items:
 *             type: string
 *           description: List of plan features
 *           example: ['Unlimited quizzes', 'Priority support']
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether plan is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: { type: Number, required: true, min: 0 },
    // Pricing
    stripePriceId: {
      type: String,
      required: true,
      unique: true,
    },

    // Credits per billing cycle
    credits: {
      type: Number,
      required: true,
      min: 0,
    },

    // Plan details
    description: String,
    feature: [String],
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for active plans
planSchema.index({ isActive: 1 });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);

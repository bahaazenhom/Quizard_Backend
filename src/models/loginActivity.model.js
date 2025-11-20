import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginActivity:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         user:
 *           type: string
 *           description: Reference to User
 *         loginDate:
 *           type: string
 *           format: date-time
 *           description: Date and time of login
 *         ipAddress:
 *           type: string
 *           description: IP address of the login
 *         userAgent:
 *           type: string
 *           description: Browser/device user agent
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const loginActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loginDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries on date ranges
loginActivitySchema.index({ loginDate: -1 });
loginActivitySchema.index({ user: 1, loginDate: -1 });

export default mongoose.models.LoginActivity ||
  mongoose.model("LoginActivity", loginActivitySchema);

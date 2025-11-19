import mongoose from "mongoose";
import { nanoid } from "nanoid";

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Group title
 *           example: Advanced JavaScript Course
 *         coverUrl:
 *           type: string
 *           description: URL to group cover image
 *           example: https://example.com/cover.jpg
 *         owner:
 *           type: string
 *           description: Reference to User who owns the group
 *         inviteCode:
 *           type: string
 *           description: Auto-generated 6-character invite code
 *           example: abc123
 *         inviteExpiredAt:
 *           type: string
 *           format: date-time
 *           description: Invite code expiration date
 *         isArchived:
 *           type: boolean
 *           default: false
 *           description: Whether group is archived
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const groupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    coverUrl: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inviteCode: { type: String },
    inviteExpiredAt: Date,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

groupSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = nanoid(6);
    this.inviteExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.models.Group || mongoose.model("Group", groupSchema);

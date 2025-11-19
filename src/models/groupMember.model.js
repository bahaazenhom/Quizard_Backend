import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupMember:
 *       type: object
 *       required:
 *         - group
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         group:
 *           type: string
 *           description: Reference to Group
 *         user:
 *           type: string
 *           description: Reference to User
 *         role:
 *           type: string
 *           enum: [student, teacher]
 *           default: student
 *           description: Member's role in the group
 *         joinedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when user joined
 */

const groupMemberSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["student", "teacher"], default: "student" },
  joinedAt: { type: Date, default: Date.now },
});

groupMemberSchema.index({ group: 1 });
groupMemberSchema.index({ user: 1 });

export default mongoose.models.GroupMember ||
  mongoose.model("GroupMember", groupMemberSchema);

import { mongo } from "mongoose";
import { nanoid } from "nanoid";

const groupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    coverUrl: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    announcement: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Announcement" },
    ],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    inviteCode: { type: String },
    inviteExpiredAt: Date,
    members: Number,
    modules: Number,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

groupSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = nanoid(6); // Assume this function generates a unique invite code
    this.inviteExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 7 days from now
  }
  next();
});

export default mongoose.models.Group || mongoose.model("Group", groupSchema);

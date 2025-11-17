import mongoose from "mongoose";
import { nanoid } from "nanoid";

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

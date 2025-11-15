import mongoose from "mongoose";
import { nanoid } from "nanoid";


const GroupSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inviteCode: String,
    inviteExpiresAt: Date,
    startDate: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    coverImage: String,
  },
  { timestamps: true }
);

GroupSchema.index({ teachers: 1 });
GroupSchema.index({ students: 1 });


GroupSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode = nanoid(6);
    this.inviteExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
  }
  next();
});


export default mongoose.models.Module || mongoose.model("Module", GroupSchema)
import mongoose from "mongoose";


const announcementSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
  },
  { timestamps: true }
);

announcementSchema.index({group:1})

export default mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);

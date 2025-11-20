import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    totalMarks: Number,
    durationMinutes: Number,
    startAt: Date,
    endAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

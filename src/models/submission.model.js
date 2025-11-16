import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedIndex: Number,
      isCorrect: Boolean,
    },
  ],
  scoreTotal: Number,
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
});

export default mongoose.models.Submission ||
  mongoose.model("Submission", submissionSchema);

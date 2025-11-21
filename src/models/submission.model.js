import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      questionText: String,
      options: [String],
      point: Number,
      selectedIndex: Number,
      correctOptionIndex: Number,
      isCorrect: Boolean,
    },
  ],
  scoreTotal: Number,
  totalQuizPoints: Number,
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
});

export default mongoose.models.Submission ||
  mongoose.model("Submission", submissionSchema);

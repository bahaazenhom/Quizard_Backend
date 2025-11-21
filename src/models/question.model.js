import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true, select: false },
  point: { type: Number, default: 1 },
});

export default mongoose.models.Question ||
  mongoose.model("Question", questionSchema);

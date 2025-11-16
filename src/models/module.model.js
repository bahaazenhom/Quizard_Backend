import mongoose from "mongoose";
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  material: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
});
export default mongoose.models.Module || mongoose.model("Module", moduleSchema);

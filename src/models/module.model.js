import mongoose from "mongoose";
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  material: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
});
moduleSchema.index({ group: 1 })

export default mongoose.models.Module || mongoose.model("Module", moduleSchema);

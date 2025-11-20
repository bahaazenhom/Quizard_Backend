import mongoose from "mongoose";
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
});
moduleSchema.index({ group: 1 })

export default mongoose.models.Module || mongoose.model("Module", moduleSchema);

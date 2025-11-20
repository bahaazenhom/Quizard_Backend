import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Module title
 *           example: Introduction to React
 *         material:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Material references
 *         group:
 *           type: string
 *           description: Reference to parent Group
 */

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  material: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
});
moduleSchema.index({ group: 1 });

export default mongoose.models.Module || mongoose.model("Module", moduleSchema);

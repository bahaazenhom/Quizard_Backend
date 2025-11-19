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
 *         quizzes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of Quiz references
 *         group:
 *           type: string
 *           description: Reference to parent Group
 */

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  material: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
});
moduleSchema.index({ group: 1 });

export default mongoose.models.Module || mongoose.model("Module", moduleSchema);

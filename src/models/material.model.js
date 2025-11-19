import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Material title
 *           example: Introduction Video
 *         type:
 *           type: string
 *           enum: [pdf, video, link]
 *           description: Type of material
 *           example: video
 *         url:
 *           type: string
 *           description: URL to the material resource
 *           example: https://example.com/video.mp4
 *         fullName:
 *           type: string
 *           description: Full file name
 *         module:
 *           type: string
 *           description: Reference to parent Module
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const materialSchema = new mongoose.Schema(
  {
    title: String,
    type: { type: String, enum: ["pdf", "video", "link"], required: false },
    url: String,
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    fullName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Material ||
  mongoose.model("Material", materialSchema);

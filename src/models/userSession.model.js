import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSession:
 *       type: object
 *       required:
 *         - sessionId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         sessionId:
 *           type: string
 *           description: External session identifier (e.g., Vertex session)
 *         userId:
 *           type: string
 *           description: Reference to the owning user
 */

const userSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true, unique: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.UserSession ||
  mongoose.model("UserSession", userSessionSchema);

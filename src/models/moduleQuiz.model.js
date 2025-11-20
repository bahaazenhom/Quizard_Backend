import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     ModuleQuiz:
 *       type: object
 *       required:
 *         - moduleId
 *         - quizId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         moduleId:
 *           type: string
 *           description: Reference to Module
 *         quizId:
 *           type: string
 *           description: Reference to Quiz
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const moduleQuizSchema = new mongoose.Schema(
    {
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    },
    { timestamps: true }
);

moduleQuizSchema.index({ moduleId: 1, quizId: 1 }, { unique: true });

export default mongoose.models.ModuleQuiz || mongoose.model("ModuleQuiz", moduleQuizSchema);

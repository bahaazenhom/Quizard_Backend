import Quiz from "../../models/quiz.model.js";
import Question from "../../models/question.model.js";
import ModuleQuiz from "../../models/moduleQuiz.model.js";
import Module from "../../models/module.model.js";
import Group from "../../models/group.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class QuizService {
    async createQuiz(quizData) {
        try {
            const quiz = new Quiz(quizData);
            await quiz.save();
            return quiz;
        } catch (error) {
            throw new ErrorClass(
                "Failed to create quiz",
                500,
                error.message,
                "QuizService.createQuiz"
            );
        }
    }

    async createQuizWithDetails(rawDetails, userId) {
        try {
            const details = typeof rawDetails === "string" ? JSON.parse(rawDetails) : rawDetails;
            if (!details || typeof details !== "object") {
                throw new ErrorClass("Invalid quiz_details payload", 400, null, "QuizService.createQuizWithDetails");
            }

            const {
                title,
                description = "",
                totalMarks,
                durationMinutes,
                startAt,
                endAt,
                questions = [],
                module_ids = []
            } = details;

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new ErrorClass("Quiz questions are required", 400, null, "QuizService.createQuizWithDetails");
            }

            if (!Array.isArray(module_ids) || module_ids.length === 0) {
                throw new ErrorClass("module_ids are required", 400, null, "QuizService.createQuizWithDetails");
            }

            // Ownership and group consistency checks
            const modules = await Module.find({ _id: { $in: module_ids } });
            if (modules.length !== module_ids.length) {
                throw new ErrorClass("One or more modules not found", 404, null, "QuizService.createQuizWithDetails");
            }

            const groupIds = [
                ...new Set(
                    modules
                        .map((m) => (m.group ? m.group.toString() : null))
                        .filter((g) => Boolean(g))
                ),
            ];

            if (groupIds.length !== 1) {
                throw new ErrorClass("Modules must belong to a single group", 400, null, "QuizService.createQuizWithDetails");
            }

            const groupId = groupIds[0];
            const group = await Group.findById(groupId);
            if (!group) {
                throw new ErrorClass("Group not found for selected modules", 404, null, "QuizService.createQuizWithDetails");
            }

            if (userId && group.owner?.toString() !== userId.toString()) {
                throw new ErrorClass("Forbidden: only the group owner can create quizzes for this group", 403, null, "QuizService.createQuizWithDetails");
            }

            // Create question documents
            const createdQuestions = await Question.insertMany(
                questions.map((q) => ({
                    text: q.text,
                    options: q.options,
                    correctOptionIndex: q.correctOptionIndex,
                    point: q.point
                }))
            );
            const questionIds = createdQuestions.map((q) => q._id);

            // Create quiz
            const quiz = new Quiz({
                title,
                description,
                totalMarks,
                durationMinutes,
                startAt,
                endAt,
                questions: questionIds
            });
            await quiz.save();

            // Link quiz to modules
            if (Array.isArray(module_ids) && module_ids.length > 0) {
                const moduleQuizDocs = module_ids.map((moduleId) => ({
                    moduleId,
                    quizId: quiz._id
                }));
                try {
                    await ModuleQuiz.insertMany(moduleQuizDocs, { ordered: false });
                } catch (err) {
                    // Ignore duplicate key errors, bubble up others
                    if (!(err && err.code === 11000)) {
                        throw err;
                    }
                }
            }

            return await Quiz.findById(quiz._id).populate("questions");
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to create quiz with details",
                error.status || 500,
                error.message,
                "QuizService.createQuizWithDetails"
            );
        }
    }

    async getAllQuizzes() {
        try {
            const quizzes = await Quiz.find().populate("questions");
            return quizzes;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get quizzes",
                500,
                error.message,
                "QuizService.getAllQuizzes"
            );
        }
    }

    async getQuizById(id) {
        try {
            const quiz = await Quiz.findById(id).populate("questions");
            if (!quiz) {
                throw new ErrorClass("Quiz not found", 404, "Not Found", "QuizService.getQuizById");
            }
            return quiz;
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to get quiz",
                500,
                error.message,
                "QuizService.getQuizById"
            );
        }
    }

    async updateQuiz(id, updateData) {
        try {
            const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, {
                new: true,
            }).populate("questions");
            if (!updatedQuiz) {
                throw new ErrorClass("Quiz not found", 404, "Not Found", "QuizService.updateQuiz");
            }
            return updatedQuiz;
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to update quiz",
                500,
                error.message,
                "QuizService.updateQuiz"
            );
        }
    }

    async deleteQuiz(id) {
        try {
            const deletedQuiz = await Quiz.findByIdAndDelete(id);
            if (!deletedQuiz) {
                throw new ErrorClass("Quiz not found", 404, "Not Found", "QuizService.deleteQuiz");
            }
            return deletedQuiz;
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to delete quiz",
                500,
                error.message,
                "QuizService.deleteQuiz"
            );
        }
    }
}

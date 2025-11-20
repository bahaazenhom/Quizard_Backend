import Quiz from "../../models/quiz.model.js";
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

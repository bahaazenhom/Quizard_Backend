import { QuizService } from "./quiz.service.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

const quizService = new QuizService();

export class QuizController {
    async createQuizFromDetails(req, res, next) {
        try {
            const { quiz_details } = req.body;
            const newQuiz = await quizService.createQuizWithDetails(quiz_details, req.user?._id);
            res.status(201).json({
                success: true,
                message: "Quiz created successfully",
                data: newQuiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async createQuiz(req, res, next) {
        try {
            const quizData = req.body;
            const newQuiz = await quizService.createQuiz(quizData);
            res.status(201).json({
                success: true,
                message: "Quiz created successfully",
                data: newQuiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllQuizzes(req, res, next) {
        try {
            const quizzes = await quizService.getAllQuizzes();
            res.status(200).json({
                success: true,
                data: quizzes,
            });
        } catch (error) {
            next(error);
        }
    }

    async getQuizById(req, res, next) {
        try {
            const { id } = req.params;
            const quiz = await quizService.getQuizById(id);
            res.status(200).json({
                success: true,
                data: quiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateQuiz(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedQuiz = await quizService.updateQuiz(id, updateData);
            res.status(200).json({
                success: true,
                message: "Quiz updated successfully",
                data: updatedQuiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteQuiz(req, res, next) {
        try {
            const { id } = req.params;
            await quizService.deleteQuiz(id);
            res.status(200).json({
                success: true,
                message: "Quiz deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

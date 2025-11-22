import { QuizService } from "./quiz.service.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { io } from "../../server.js";

const quizService = new QuizService();

export class QuizController {
    async createQuizFromDetails(req, res, next) {
        try {
            console.log('📝 createQuizFromDetails called');
            console.log('📦 Request body keys:', Object.keys(req.body));
            console.log('📦 Request headers x-session-id:', req.headers['x-session-id']);
            
            const { quiz_details } = req.body;
            const sessionId = req.body.sessionId || req.body.session_id || req.headers['x-session-id'];
            
            console.log('🔑 Extracted sessionId:', sessionId);
            
            const newQuiz = await quizService.createQuizWithDetails(
                quiz_details,
                req.authUser?._id || req.user?._id
            );
            
            console.log('✅ Quiz created with ID:', newQuiz._id);
            
            // Emit WebSocket event to notify frontend
            if (sessionId && newQuiz._id) {
                console.log(`🚀 Emitting quiz-created event for session: ${sessionId}, quizId: ${newQuiz._id}`);
                io.to(sessionId).emit('quiz-created', {
                    quizId: newQuiz._id.toString(),
                    action: 'created',
                    timestamp: Date.now()
                });
                console.log('✅ Event emitted successfully');
            } else {
                console.warn('⚠️ Cannot emit event - missing sessionId or quizId');
                console.warn('   sessionId:', sessionId);
                console.warn('   newQuiz._id:', newQuiz._id);
            }
            
            res.status(201).json({
                success: true,
                message: "Quiz created successfully",
                data: newQuiz,
            });
        } catch (error) {
            next(error);
        }
    }
    
    async updateQuizFromDetails(req, res, next) {
        try {
            console.log('✏️ updateQuizFromDetails called');
            console.log('📦 Request body keys:', Object.keys(req.body));
            console.log('📦 Request headers x-session-id:', req.headers['x-session-id']);
            
            const { quiz_details } = req.body;
            const { id } = req.params;
            const sessionId = req.body.sessionId || req.body.session_id || req.headers['x-session-id'];
            
            console.log('🔑 Extracted sessionId:', sessionId);
            console.log('🆔 Quiz ID to update:', id);
            
            const updatedQuiz = await quizService.updateQuizWithDetails(
                id,
                quiz_details,
                req.authUser?._id || req.user?._id
            );
            
            console.log('✅ Quiz updated successfully');
            
            // Emit WebSocket event to notify frontend
            if (sessionId) {
                console.log(`🚀 Emitting quiz-updated event for session: ${sessionId}, quizId: ${id}`);
                io.to(sessionId).emit('quiz-updated', {
                    quizId: id.toString(),
                    action: 'updated',
                    timestamp: Date.now()
                });
                console.log('✅ Event emitted successfully');
            } else {
                console.warn('⚠️ Cannot emit event - missing sessionId');
            }
            
            res.status(200).json({
                success: true,
                message: "Quiz updated successfully",
                data: updatedQuiz,
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

import { ModuleQuizService } from "./moduleQuiz.service.js";

const moduleQuizService = new ModuleQuizService();

export class ModuleQuizController {
    async createModuleQuiz(req, res, next) {
        try {
            const moduleQuizData = req.body;
            const newModuleQuiz = await moduleQuizService.createModuleQuiz(moduleQuizData);
            res.status(201).json({
                success: true,
                message: "Module-Quiz association created successfully",
                data: newModuleQuiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllModuleQuizzes(req, res, next) {
        try {
            const moduleQuizzes = await moduleQuizService.getAllModuleQuizzes();
            res.status(200).json({
                success: true,
                data: moduleQuizzes,
            });
        } catch (error) {
            next(error);
        }
    }

    async getModuleQuizById(req, res, next) {
        try {
            const { id } = req.params;
            const moduleQuiz = await moduleQuizService.getModuleQuizById(id);
            res.status(200).json({
                success: true,
                data: moduleQuiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateModuleQuiz(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedModuleQuiz = await moduleQuizService.updateModuleQuiz(id, updateData);
            res.status(200).json({
                success: true,
                message: "Module-Quiz association updated successfully",
                data: updatedModuleQuiz,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteModuleQuiz(req, res, next) {
        try {
            const { id } = req.params;
            await moduleQuizService.deleteModuleQuiz(id);
            res.status(200).json({
                success: true,
                message: "Module-Quiz association deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

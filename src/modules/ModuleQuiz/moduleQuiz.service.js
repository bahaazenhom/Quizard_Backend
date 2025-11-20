import ModuleQuiz from "../../models/moduleQuiz.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class ModuleQuizService {
    async createModuleQuiz(moduleQuizData) {
        try {
            const moduleQuiz = new ModuleQuiz(moduleQuizData);
            await moduleQuiz.save();
            return moduleQuiz;
        } catch (error) {
            throw new ErrorClass(
                "Failed to create module-quiz association",
                500,
                error.message,
                "ModuleQuizService.createModuleQuiz"
            );
        }
    }

    async getAllModuleQuizzes() {
        try {
            const moduleQuizzes = await ModuleQuiz.find().populate("moduleId").populate("quizId");
            return moduleQuizzes;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get module-quiz associations",
                500,
                error.message,
                "ModuleQuizService.getAllModuleQuizzes"
            );
        }
    }

    async getModuleQuizById(id) {
        try {
            const moduleQuiz = await ModuleQuiz.findById(id).populate("moduleId").populate("quizId");
            if (!moduleQuiz) {
                throw new ErrorClass("Module-Quiz association not found", 404, "Not Found", "ModuleQuizService.getModuleQuizById");
            }
            return moduleQuiz;
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to get module-quiz association",
                500,
                error.message,
                "ModuleQuizService.getModuleQuizById"
            );
        }
    }

    async updateModuleQuiz(id, updateData) {
        try {
            const updatedModuleQuiz = await ModuleQuiz.findByIdAndUpdate(id, updateData, {
                new: true,
            }).populate("moduleId").populate("quizId");
            if (!updatedModuleQuiz) {
                throw new ErrorClass("Module-Quiz association not found", 404, "Not Found", "ModuleQuizService.updateModuleQuiz");
            }
            return updatedModuleQuiz;
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to update module-quiz association",
                500,
                error.message,
                "ModuleQuizService.updateModuleQuiz"
            );
        }
    }

    async deleteModuleQuiz(id) {
        try {
            const deletedModuleQuiz = await ModuleQuiz.findByIdAndDelete(id);
            if (!deletedModuleQuiz) {
                throw new ErrorClass("Module-Quiz association not found", 404, "Not Found", "ModuleQuizService.deleteModuleQuiz");
            }
            return deletedModuleQuiz;
        } catch (error) {
            if (error instanceof ErrorClass) throw error;
            throw new ErrorClass(
                "Failed to delete module-quiz association",
                500,
                error.message,
                "ModuleQuizService.deleteModuleQuiz"
            );
        }
    }
}

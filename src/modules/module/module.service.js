import mongoose from "mongoose";
import Module from "../../models/module.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class ModuleService {
    async getModule() {
        try {
            const modules = await Module.find();
            if (!modules || modules.length === 0)
                throw new ErrorClass("Cannot get Modules", 404);
            return modules;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get module",
                500,
                error.message,
                "moduleService.getModule"
            );
        }
    }

    async getMyGroups(userId) {
        try {
            const modules = await Module.find({
                isArchived: false,
                $or: [{ teachers: userId }, { students: userId }],
            });
            return modules;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get my groups",
                500,
                error.message,
                "moduleService.getMyGroups"
            );
        }
    }

    async createModule(data) {
        try {
            const createdModule = await Module.create(data);
            return createdModule;
        } catch (error) {
            throw new ErrorClass(
                "Failed to create module",
                500,
                error.message,
                "moduleService.createModule"
            );
        }
    }

    async updateModule(id, data) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const updatedModule = await Module.findByIdAndUpdate(id, data, {
                new: true,
            });
            if (!updatedModule) throw new ErrorClass("Cannot find this module", 404);
            return updatedModule;
        } catch (error) {
            throw new ErrorClass(
                "Failed to update module",
                500,
                error.message,
                "moduleService.updateModule"
            );
        }
    }

    async softDeleteModule(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const updatedModule = await Module.findByIdAndUpdate(
                id,
                { isArchived: true },
                { new: true }
            );
            if (!updatedModule) throw new ErrorClass("Cannot find this module", 404);
            return updatedModule;
        } catch (error) {
            throw new ErrorClass(
                "Failed to update module",
                500,
                error.message,
                "moduleService.softDeleteModule"
            );
        }
    }

    async restoreModule(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const restoredModule = await Module.findByIdAndUpdate(
                id,
                { isArchived: false },
                { new: true }
            );
            if (!restoredModule) throw new ErrorClass("Cannot find this module", 404);
            return restoredModule;
        } catch (error) {
            throw new ErrorClass(
                "Failed to restore module",
                500,
                error.message,
                "moduleService.restoreModule"
            );
        }
    }

    async deleteModule(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const deletedModule = await Module.findByIdAndDelete(id);
            if (!deletedModule) throw new ErrorClass("Cannot find this module", 404);
            return deletedModule;
        } catch (error) {
            throw new ErrorClass(
                "Failed to delete module",
                500,
                error.message,
                "moduleService.deleteModule"
            );
        }
    }
}

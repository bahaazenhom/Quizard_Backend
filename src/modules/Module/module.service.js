import Module from "../../models/module.model.js";
import Group from "../../models/group.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class ModuleService {

    // CREATE
    async createModule(title, groupId) {
        try {
            const groupExists = await Group.findById(groupId);
            if (!groupExists)
                throw new ErrorClass("Group not found", 404);

            const module = await Module.create({
                title,
                group: groupId
            });

            return module;
        } catch (error) {
            throw new ErrorClass(
                "Failed to create module",
                500,
                error.message,
                "ModuleService.createModule"
            );
        }
    }

    // GET ALL MODULES FOR A GROUP
    async getModules(groupId) {
        try {
            return await Module.find({ group: groupId })
                .select("title group createdAt updatedAt");
        } catch (error) {
            throw new ErrorClass(
                "Failed to get modules",
                500,
                error.message,
                "ModuleService.getModules"
            );
        }
    }

    // GET ONE MODULE
    async getModuleById(id) {
        try {
            const module = await Module.findById(id)
                .select("title group")
            if (!module)
                throw new ErrorClass("Module not found", 404);
            return module;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get module",
                500,
                error.message,
                "ModuleService.getModuleById"
            );
        }
    }

    // UPDATE
    async updateModule(id, data) {
        try {
            const updated = await Module.findByIdAndUpdate(
                id,
                data,
                { new: true }
            );

            if (!updated)
                throw new ErrorClass("Module not found", 404);

            return updated;
        } catch (error) {
            throw new ErrorClass(
                "Failed to update module",
                500,
                error.message,
                "ModuleService.updateModule"
            );
        }
    }

    // DELETE
    async deleteModule(id) {
        try {
            const deleted = await Module.findByIdAndDelete(id);

            if (!deleted)
                throw new ErrorClass("Module not found", 404);

            return deleted;
        } catch (error) {
            throw new ErrorClass(
                "Failed to delete module",
                500,
                error.message,
                "ModuleService.deleteModule"
            );
        }
    }
}

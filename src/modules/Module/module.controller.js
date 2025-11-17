import { ModuleService } from "./module.service.js";

const moduleService = new ModuleService();

export class ModuleController {

    async createModule(req, res, next) {
        try {
            const { groupId } = req.params;
            const { title } = req.body;

            const newModule = await moduleService.createModule(title, groupId);

            res.status(201).json({
                success: true,
                data: newModule
            });
        } catch (error) {
            next(error);
        }
    }

    async getModules(req, res, next) {
        try {
            const { groupId } = req.params;
            const modules = await moduleService.getModules(groupId);
            res.json({ success: true, data: modules });
        } catch (error) {
            next(error);
        }
    }

    async getModuleById(req, res, next) {
        try {
            const module = await moduleService.getModuleById(req.params.id);
            res.json({ success: true, data: module });
        } catch (error) {
            next(error);
        }
    }

    async updateModule(req, res, next) {
        try {
            const updated = await moduleService.updateModule(req.params.id, req.body);
            res.json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async deleteModule(req, res, next) {
        try {
            const deleted = await moduleService.deleteModule(req.params.id);
            res.json({ success: true, data: deleted });
        } catch (error) {
            next(error);
        }
    }
}

import { ModuleService } from "./module.service.js";
const moduleService = new ModuleService();

export class ModuleController {
  async getModule(req, res, next) {
    try {
      const modules = await moduleService.getModule();
      res.status(200).json({ success: true, data: modules });
    } catch (error) {
      next(error);
    }
  }

  async getMyGroups(req, res, next) {
    try {
      const userId = req.user._id; // assuming req.user exists from auth middleware
      const myGroups = await moduleService.getMyGroups(userId);
      res.status(200).json({ success: true, data: myGroups });
    } catch (error) {
      next(error);
    }
  }

  async createModule(req, res, next) {
    try {
      const createdModule = await moduleService.createModule(req.body);
      res.status(201).json({ success: true, data: createdModule });
    } catch (error) {
      next(error);
    }
  }

  async updateModule(req, res, next) {
    try {
      const updatedModule = await moduleService.updateModule(
        req.params.id,
        req.body
      );
      res.status(200).json({ success: true, data: updatedModule });
    } catch (error) {
      next(error);
    }
  }

  async deleteModule(req, res, next) {
    try {
      const { id } = req.params;
      let deletedModule;
      if (req.url.split("/")[2] === "hard") {
        deletedModule = await moduleService.deleteModule(id);
      } else {
        deletedModule = await moduleService.softDeleteModule(id);
      }
      res.status(200).json({ success: true, data: deletedModule });
    } catch (error) {
      next(error);
    }
  }

  async restoreModule(req, res, next) {
    try {
      const restoredModule = await moduleService.restoreModule(req.params.id);
      res.status(200).json({ success: true, data: restoredModule });
    } catch (error) {
      next(error);
    }
  }
}

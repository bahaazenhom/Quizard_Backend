
import { MaterialService } from './material.service.js';


const materialService = new MaterialService()


export class MaterialController {
  async createMaterial(req, res, next) {
    try {
      const material = await materialService.createMaterial(
        req.body,
        req.params.moduleId
      );

      res.status(201).json({ success: true, data: material });
    } catch (error) {
      next(error);
    }
  }

  async getMaterialById(req, res, next) {
    try {
      const material = await materialService.getMaterialById(req.params.id);

      res.status(200).json({ success: true, data: material });
    } catch (error) {
      next(error);
    }
  }

  async updateMaterial(req, res, next) {
    try {
      const updated = await materialService.updateMaterial(
        req.params.id,
        req.body
      );

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteMaterial(req, res, next) {
    try {
      const deleted = await materialService.deleteMaterial(
        req.params.id,
        req.params.moduleId
      );

      res.status(200).json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }
}



import { MaterialService } from './material.service.js';
import { StorageService } from '../GoogleCloudStorage/StorageService.js';
import { ErrorClass } from '../../utils/errorClass.util.js';


const materialService = new MaterialService()
const storageService = new StorageService()


export class MaterialController {
  async createMaterial(req, res, next) {
    try {
      if (!req.files) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const materials = await Promise.all(
        req.files.map(async (file) => {
          const { fileUrl, fileName, fileType, fullName } = await storageService.uploadFile(file);
          return {
            url: fileUrl,
            title: fileName.split('.')[0],
            type: fileType.split('/')[1],
            fullName: fullName
          };
        })
      );

      const uploadedMaterials = await materialService.createMaterial(
        materials,
        req.params.moduleId
      );


      res.status(201).json({ success: true, data: uploadedMaterials });
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

  async getMaterialsByModuleId(req, res, next) {
    try {
      const { moduleId } = req.params;
      if (!moduleId) {
        throw new ErrorClass("Module ID is required", 400);
      }
      const materials = await materialService.getMaterials(moduleId);
      res.status(200).json({ success: true, data: materials });
    } catch (error) {
      next(error);
    }
  }
}


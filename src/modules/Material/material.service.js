import Module from "../../models/module.model.js";
import mongoose from "mongoose";
import Material from "../../models/material.model.js"
import { ErrorClass } from "../../utils/errorClass.util.js";
import { StorageService } from '../GoogleCloudStorage/StorageService.js';
const storageService = new StorageService();
export class MaterialService {
    async createMaterial(data, moduleId) {
        try {
            if (!mongoose.isValidObjectId(moduleId)) {
                throw new ErrorClass("Invalid module id", 400);
            }

            const module = await Module.findById(moduleId);
            if (!module) throw new ErrorClass("Module not found", 404);
            const materials = []
            await Promise.all(data.map(async (material) => {
                material.module = moduleId;
                const savedMaterial = await Material.create(material);
                materials.push(savedMaterial);
                if (!Array.isArray(module.material)) {
                    module.material = [];
                }
                module.material.push(savedMaterial._id);
            }))

            await module.save();

            return materials;
        } catch (error) {
            throw new ErrorClass(
                "Failed to create material",
                500,
                error.message,
                "MaterialService.createMaterial"
            );
        }
    }

    async getMaterials(module) {
        try {
            return await Material.find({ module });
        } catch (error) {
            throw new ErrorClass(
                "Failed to get materials",
                500,
                error.message,
                "MaterialService.getMaterials"
            );
        }
    }

    async getMaterialById(id) {
        try {
            const material = await Material.findById(id);
            if (!material) throw new ErrorClass("Material not found", 404);
            return material;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get material",
                500,
                error.message,
                "MaterialService.getMaterialById"
            );
        }
    }

    async updateMaterial(id, data) {
        try {
            const updated = await Material.findByIdAndUpdate(id, data, { new: true });
            if (!updated) throw new ErrorClass("Material not found", 404);
            return updated;
        } catch (error) {
            throw new ErrorClass(
                "Failed to update material",
                500,
                error.message,
                "MaterialService.updateMaterial"
            );
        }
    }

    async deleteMaterial(id, moduleId) {
        try {
            const materialToDelete = await Material.findById(id);
            const materialFullName = materialToDelete?.fullName;
            const deleted = await Material.findByIdAndDelete(id);
            if (!deleted) throw new ErrorClass("Material not found", 404);
            if (materialFullName) {
                storageService.deleteFile(materialFullName);
            }
            await Module.findByIdAndUpdate(moduleId, {
                $pull: { material: id },
            });

            return deleted;
        } catch (error) {
            throw new ErrorClass(
                "Failed to delete material",
                500,
                error.message,
                "MaterialService.deleteMaterial"
            );
        }
    }
}



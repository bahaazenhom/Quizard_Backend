import mongoose from "mongoose";
import { ErrorClass } from "../../utils/errorClass.util.js";
import Group from "../../models/group.model.js"
export class GroupService {
    async getGroup() {
        try {
            const groups = await Group.find();
            console.log(groups)
            if (!groups)
                throw new ErrorClass("Cannot get groups", 404);
            return groups;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get groups",
                500,
                error.message,
                "moduleService.getGroup"
            );
        }
    }

    async getMyGroups(userId) {
        try {
            const groups = await GroupMember.find({ user: userId }).populate("group");
            return groups;
        } catch (error) {
            throw new ErrorClass(
                "Failed to get my groups",
                500,
                error.message,
                "moduleService.getMyGroups"
            );
        }
    }

    async createGroup(data , authUser) {
        try {
            
            const createdGroup = await Group.create(data);
            return createdGroup;
        } catch (error) {
            throw new ErrorClass(
                "Failed to create group",
                500,
                error.message,
                "moduleService.createGroup"
            );
        }
    }

    async updateGroup(id, data) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const updatedGroup = await Group.findByIdAndUpdate(id, data, {
                new: true,
            });
            if (!updatedGroup) throw new ErrorClass("Cannot find this Group", 404);
            return updatedGroup;
        } catch (error) {
            throw new ErrorClass(
                "Failed to update Group",
                500,
                error.message,
                "GroupService.updateGroup"
            );
        }
    }

    async softDeleteGroup(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const updatedGroup = await Group.findByIdAndUpdate(
                id,
                { isArchived: true },
                { new: true }
            );
            if (!updatedGroup) throw new ErrorClass("Cannot find this Group", 404);
            return updatedGroup;
        } catch (error) {
            throw new ErrorClass(
                "Failed to update Group",
                500,
                error.message,
                "GroupService.softDeleteGroup"
            );
        }
    }

    async restoreGroup(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const restoredGroup = await Group.findByIdAndUpdate(
                id,
                { isArchived: false },
                { new: true }
            );
            if (!restoredGroup) throw new ErrorClass("Cannot find this Group", 404);
            return restoredGroup;
        } catch (error) {
            throw new ErrorClass(
                "Failed to restore Group",
                500,
                error.message,
                "GroupService.restoreGroup"
            );
        }
    }

    async deleteGroup(id) {
        try {
            if (!mongoose.isValidObjectId(id)) {
                throw new ErrorClass("Invalid ID format", 400);
            }
            const deletedGroup = await Group.findByIdAndDelete(id);
            if (!deletedGroup) throw new ErrorClass("Cannot find this Group", 404);
            return deletedGroup;
        } catch (error) {
            throw new ErrorClass(
                "Failed to delete Group",
                500,
                error.message,
                "GroupService.deleteGroup"
            );
        }
    }
}

import mongoose from "mongoose";
import { ErrorClass } from "../../utils/errorClass.util.js";
import Group from "../../models/group.model.js";
import User from "../../models/user.model.js";
import GroupMember from "../../models/groupMember.model.js";
import Module from "../../models/module.model.js";

export class GroupService {
  async getGroup() {
    try {
      const groups = await Group.find().populate({
        path: "owner",
        select: "firstName lastName email",
      });
      if (!groups) throw new ErrorClass("Cannot get groups", 404);
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

  async getGroupById(groupId, userId) {
    try {
      const membership = await GroupMember.findOne({
        group: groupId,
        user: userId,
      });
      const role = membership?.role;
      if (!membership) {
        throw new ErrorClass("You are not a member of this group", 403);
      }

      // 2️⃣ Fetch the group
      const group = await Group.findById(groupId);
      if (!group) {
        throw new ErrorClass("Cannot get group", 404);
      }
      return { group, role };
    } catch (error) {
      if (error instanceof ErrorClass) throw error;

      throw new ErrorClass(
        "Failed to get group",
        500,
        error.message,
        "GroupService.getGroupById"
      );
    }
  }

  async getMyGroups(userId) {
    try {
      const memberships = await GroupMember.find({ user: userId })
        .select("-_id")
        .populate({
          path: "group",
          select: "title owner ownerName inviteCode coverUrl",
          populate: {
            path: "owner",
            select: "firstName lastName",
          },
        });

      if (memberships.length === 0) return [];

      const data = await Promise.all(
        memberships.map(async (membership) => {
          const group = membership.group;
          console.log(group);
          if (!group) {
            const obj = membership.toObject();
            delete obj.user;
            return obj;
          }

          const membersCount = await GroupMember.countDocuments({
            group: group._id,
          });
          const modulesCount = await Module.countDocuments({
            groupId: group._id,
          });

          // Convert to object & remove user field
          const membershipObj = membership.toObject();
          delete membershipObj.user;

          return {
            ...membershipObj,
            group: {
              ...group.toObject(),
              membersCount,
              modulesCount,
            },
          };
        })
      );

      return data;
    } catch (error) {
      throw new ErrorClass(
        "Failed to fetch user groups",
        500,
        error.message,
        "GroupService.getMyGroups"
      );
    }
  }

  async createGroup(data, authUser) {
    try {
      const createdGroup = await Group.create({
        ...data,
        owner: authUser._id,
        ownerName: [authUser.firstName, authUser.lastName].filter(Boolean).join(" ").trim(),
      });
      const teachingCourses = authUser.teachingCourses;
      await User.findByIdAndUpdate(
        authUser._id,
        { $inc: { teachingCourses: 1 } },
        { new: true }
      );
      await GroupMember.create({
        group: createdGroup._id,
        user: authUser._id,
        role: "teacher",
      });
      return createdGroup;
    } catch (error) {
      throw new ErrorClass(
        "Failed to create group",
        500,
        error.message,
        "groupService.createGroup"
      );
    }
  }

  async joinGroup(data, userId) {
    try {
      const { inviteCode } = data;

      if (!inviteCode) {
        throw new ErrorClass("Invite code is required", 400);
      }

      // 1) Get group
      const group = await Group.findOne({ inviteCode });
      if (!group) {
        throw new ErrorClass("Invalid invite code", 404);
      }

      // 2) Prevent owner (teacher) from joining as a student
      if (group.owner.toString() === userId.toString()) {
        throw new ErrorClass("You are the teacher of this group", 403);
      }

      // 3) Check if already member
      const alreadyMember = await GroupMember.findOne({
        group: group._id,
        user: userId,
      });

      if (alreadyMember) {
        throw new ErrorClass("You already joined this group", 409);
      }

      // 4) Increment enrolledCourses atomically
      await User.findByIdAndUpdate(
        userId,
        { $inc: { enrolledCourses: 1 } },
        { new: true }
      );

      // 5) Create group member record
      const newMember = await GroupMember.create({
        group: group._id,
        user: userId,
        role: "student",
      });

      return newMember;
    } catch (error) {
      throw new ErrorClass(
        "Failed to join group",
        error.statusCode || 500,
        error.message,
        "groupService.joinGroup"
      );
    }
  }

  async updateGroup(id, data, authUser) {
    try {
      const selectedGroup = await Group.findById(id);
      if (!selectedGroup && !selectedGroup.owner !== authUser._id) {
        throw new ErrorClass("Group not found Or you not Authorized", 400);
      }

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
      await GroupMember.deleteMany({ group: id });
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

  async leaveGroup(groupId, userId) {
    try {
      if (!mongoose.isValidObjectId(groupId)) {
        throw new ErrorClass("Invalid ID format", 400);
      }

      const group = await Group.findById(groupId);
      if (!group) {
        throw new ErrorClass("Group not found", 404);
      }

      // Prevent owner from leaving as student
      if (group.owner.toString() === userId.toString()) {
        throw new ErrorClass(
          "Owner cannot leave the group. Transfer ownership or delete the group",
          403
        );
      }

      // Check membership
      const membership = await GroupMember.findOne({
        group: groupId,
        user: userId,
      });
      if (!membership) {
        throw new ErrorClass("You are not a member of this group", 403);
      }

      if (membership.role !== "student") {
        throw new ErrorClass(
          "Only students can leave the group using this endpoint",
          403
        );
      }

      // Remove membership documents (ensure removal of duplicates if any)
      const deleted = await GroupMember.findOneAndDelete({
        group: groupId,
        user: userId,
      });
      await GroupMember.deleteMany({ group: groupId, user: userId });

      // Decrement user's enrolledCourses
      await User.findByIdAndUpdate(
        userId,
        { $inc: { enrolledCourses: -1 } },
        { new: true }
      );

      return deleted || { group: groupId, user: userId };
    } catch (error) {
      if (error instanceof ErrorClass) throw error;

      throw new ErrorClass(
        "Failed to leave group",
        500,
        error.message,
        "GroupService.leaveGroup"
      );
    }
  }
}

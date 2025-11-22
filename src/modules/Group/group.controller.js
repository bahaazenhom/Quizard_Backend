import { GroupService } from "./group.service.js";
import { cloudinaryConfig } from "../../config/cloudinary.config.js";

const groupService = new GroupService();

export class GroupController {
  async getGroup(req, res, next) {
    try {
      const groups = await groupService.getGroup();
      res.status(200).json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  }
  async getGroupById(req, res, next) {
    try {
      const group = await groupService.getGroupById(
        req.params.id,
        req.authUser._id
      );
      res.json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }
  async getMyGroups(req, res, next) {
    try {
      const groups = await groupService.getMyGroups(req.authUser._id);
      res.json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  }

  async createGroup(req, res, next) {
    try {
      let coverUrl;

      if (req.file) {
        const upload = await cloudinaryConfig().uploader.upload(req.file.path, {
          folder: "group_photos",
          resource_type: "image",
          use_filename: true,
        });
        coverUrl = upload.secure_url;
      }

      const createdGroup = await groupService.createGroup(
        { ...req.body, coverUrl },
        req.authUser
      );

      res.status(201).json({
        success: true,
        data: createdGroup,
      });
    } catch (error) {
      next(error);
    }
  }


  async joinGroup(req, res, next) {
    try {
      const joinedGroup = await groupService.joinGroup(req.body, req.authUser);
      res.status(201).json({ success: true, data: joinedGroup });
    } catch (error) {
      next(error);
    }
  }

  async updateGroup(req, res, next) {
    try {
      const updatedGroup = await groupService.updateGroup(
        req.params.id,
        req.body,
        req.authUser
      );
      res.status(200).json({ success: true, data: updatedGroup });
    } catch (error) {
      next(error);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { id } = req.params;
      let deletedGroup;
      if (req.url.split("/")[2] === "hard") {
        deletedGroup = await groupService.deleteGroup(id);
      } else {
        deletedGroup = await groupService.softDeleteGroup(id);
      }
      res.status(200).json({ success: true, data: deletedGroup });
    } catch (error) {
      next(error);
    }
  }

  async restoreGroup(req, res, next) {
    try {
      const restoredGroup = await groupService.restoreGroup(req.params.id);
      res.status(200).json({ success: true, data: restoredGroup });
    } catch (error) {
      next(error);
    }
  }

  async leaveGroup(req, res, next) {
    try {
      const result = await groupService.leaveGroup(
        req.params.id,
        req.authUser._id
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getGroupMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await groupService.getGroupMembers(
        id,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        message: "Group members retrieved successfully",
        data: result.members,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

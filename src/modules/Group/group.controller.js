import { GroupService } from './group.service.js';

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
      const group = await groupService.getGroupById(req.params.id, req.authUser._id);
      res.json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }
  async getMyGroups(req, res, next) {
    try {
      const groups = await groupService.getMyGroups(req.authUser._id);
      res.json({ success: true,data: groups });
    } catch (error) {
      next(error);
    }
  }

  async createGroup(req, res, next) {
    try {
      const createdGroup = await groupService.createGroup(req.body, req.authUser);
      res.status(201).json({ success: true, data: createdGroup });
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
}

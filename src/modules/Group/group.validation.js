import Joi from "joi";
import mongoose from "mongoose";
import User from "../../models/user.model.js"
import Announcement from "../../models/announcement.model.js"
import Module from "../../models/module.model.js"

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
 
const existsInModel = (Model, fieldName = "id") =>
  async (value, helpers) => {
    const exists = await Model.exists({ _id: value });
    if (!exists) {
      return helpers.error("any.notFound", { field: fieldName });
    }
    return value;
  };



export const createGroupSchema = Joi.object({
  title: Joi.string().min(3).max(40).required(),
  coverUrl: Joi.string().uri().optional(),

  owner: Joi.string()
    .custom(objectId)
    .external(existsInModel(User, "owner"))
    .required(),

  announcement: Joi.array()
    .items(
      Joi.string()
        .custom(objectId)
        .external(existsInModel(Announcement, "announcement"))
    )
    .optional(),

  modules: Joi.array()
    .items(
      Joi.string()
        .custom(objectId)
        .external(existsInModel(Module, "module"))
    )
    .optional(),

  isArchived: Joi.boolean().optional(),
});

export const updateGroupSchema = Joi.object({
  title: Joi.string().min(3).max(40),
  coverUrl: Joi.string().uri(),

  owner: Joi.string()
    .custom(objectId)
    .external(existsInModel(User, "owner")),

  announcement: Joi.array().items(
    Joi.string()
      .custom(objectId)
      .external(existsInModel(Announcement, "announcement"))
  ),

  modules: Joi.array().items(
    Joi.string()
      .custom(objectId)
      .external(existsInModel(Module, "module"))
  ),

  isArchived: Joi.boolean(),
}).min(1);


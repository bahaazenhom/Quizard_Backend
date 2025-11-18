import Joi from "joi";
import mongoose from "mongoose";
import User from "../../models/user.model.js";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const existsInModel =
  (Model, fieldName = "id") =>
  async (value) => {
    if (!value) return value; // skip if undefined
    const exists = await Model.exists({ _id: value });
    if (!exists) throw new Error(`${fieldName} not found`);
    return value;
  };

export const createGroupSchema = Joi.object({
  title: Joi.string().min(3).max(40).required(),
  coverUrl: Joi.string().uri().optional(),

  owner: Joi.string()
    .custom(objectId) // sync ObjectId validation
    .external(existsInModel(User, "Owner")),

  isArchived: Joi.boolean().optional(),
});

export const updateGroupSchema = Joi.object({
  title: Joi.string().min(3).max(40),
  coverUrl: Joi.string().uri(),

  owner: Joi.string().custom(objectId).external(existsInModel(User, "owner")),

  isArchived: Joi.boolean(),
}).min(1);

export const leaveGroupSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().custom(objectId).required(),
  }),
});

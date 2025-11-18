import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createMaterialSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  type: Joi.string().valid("pdf", "video", "link").required(),
  url: Joi.string().uri().required(),
});

export const updateMaterialSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  type: Joi.string().valid("pdf", "video", "link"),
  url: Joi.string().uri(),
}).min(1);

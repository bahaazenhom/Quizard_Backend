import Joi from "joi";

export const createQuestionSchema = Joi.object({
  text: Joi.string().trim().min(1).required(),
  options: Joi.array().items(Joi.string().trim().min(1)).min(2).required(),
  correctOptionIndex: Joi.number().integer().min(0).required(),
  point: Joi.number().min(0).optional(),
}).custom((value, helpers) => {
  if (
    typeof value.correctOptionIndex === "number" &&
    Array.isArray(value.options) &&
    value.correctOptionIndex >= value.options.length
  ) {
    return helpers.error("any.invalid");
  }
  return value;
}, "correctOptionIndex bounds check");

export const updateQuestionSchema = Joi.object({
  text: Joi.string().trim().min(1),
  options: Joi.array().items(Joi.string().trim().min(1)).min(2),
  correctOptionIndex: Joi.number().integer().min(0),
  point: Joi.number().min(0),
}).custom((value, helpers) => {
  if (
    typeof value.correctOptionIndex === "number" &&
    Array.isArray(value.options) &&
    value.correctOptionIndex >= value.options.length
  ) {
    return helpers.error("any.invalid");
  }
  return value;
}, "correctOptionIndex bounds check");

import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
    }
    return value;
};

export const createModuleSchema = Joi.object({
    title: Joi.string().min(3).max(100).required()
});

export const updateModuleSchema = Joi.object({
    title: Joi.string().min(3).max(100),
}).min(1);

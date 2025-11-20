import Joi from "joi";

export const createModuleQuizValidation = Joi.object({
    moduleId: Joi.string().hex().length(24).required().messages({
        "string.empty": "Module ID is required",
        "string.hex": "Module ID must be a valid ObjectId",
        "string.length": "Module ID must be a 24-character hex string",
    }),
    quizId: Joi.string().hex().length(24).required().messages({
        "string.empty": "Quiz ID is required",
        "string.hex": "Quiz ID must be a valid ObjectId",
        "string.length": "Quiz ID must be a 24-character hex string",
    }),
}).options({ abortEarly: false, allowUnknown: true });

export const updateModuleQuizValidation = Joi.object({
    moduleId: Joi.string().hex().length(24).messages({
        "string.hex": "Module ID must be a valid ObjectId",
        "string.length": "Module ID must be a 24-character hex string",
    }),
    quizId: Joi.string().hex().length(24).messages({
        "string.hex": "Quiz ID must be a valid ObjectId",
        "string.length": "Quiz ID must be a 24-character hex string",
    }),
}).options({ abortEarly: false, allowUnknown: true });

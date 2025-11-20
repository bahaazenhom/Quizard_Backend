import Joi from "joi";

export const createQuizValidation = Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 1 character long",
        "string.max": "Title must be at most 200 characters long",
    }),
    description: Joi.string().max(1000).messages({
        "string.max": "Description must be at most 1000 characters long",
    }),
    questions: Joi.array().items(Joi.string().hex().length(24)).messages({
        "array.base": "Questions must be an array",
        "string.hex": "Each question must be a valid ObjectId",
        "string.length": "Each question must be a 24-character hex string",
    }),
    totalMarks: Joi.number().integer().min(0).messages({
        "number.base": "Total marks must be a number",
        "number.integer": "Total marks must be an integer",
        "number.min": "Total marks must be at least 0",
    }),
    durationMinutes: Joi.number().integer().min(1).messages({
        "number.base": "Duration must be a number",
        "number.integer": "Duration must be an integer",
        "number.min": "Duration must be at least 1 minute",
    }),
    startAt: Joi.date().iso().messages({
        "date.format": "Start date must be in ISO format",
    }),
    endAt: Joi.date().iso().when("startAt", {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref("startAt")).messages({
            "date.greater": "End date must be after start date",
        }),
    }).messages({
        "date.format": "End date must be in ISO format",
    }),
}).options({ abortEarly: false, allowUnknown: true });

const questionDetailSchema = Joi.object({
    text: Joi.string().min(1).required(),
    options: Joi.array().items(Joi.string().min(1)).min(2).required(),
    correctOptionIndex: Joi.number().integer().min(0).required(),
    point: Joi.number().min(0).required(),
});

export const createQuizFromDetailsValidation = Joi.object({
    quiz_details: Joi.alternatives().try(
        Joi.string().min(2),
        Joi.object({
            title: Joi.string().min(1).required(),
            description: Joi.string().allow("").optional(),
            totalMarks: Joi.number().min(0).required(),
            durationMinutes: Joi.number().min(1).required(),
            startAt: Joi.date().iso().required(),
            endAt: Joi.date().iso().greater(Joi.ref("startAt")).required(),
            questions: Joi.array().items(questionDetailSchema).min(1).required(),
            module_ids: Joi.array().items(Joi.string().length(24).hex()).min(1).required(),
        })
    ).required(),
}).options({ abortEarly: false, allowUnknown: true });

export const updateQuizValidation = Joi.object({
    title: Joi.string().min(1).max(200).messages({
        "string.min": "Title must be at least 1 character long",
        "string.max": "Title must be at most 200 characters long",
    }),
    description: Joi.string().max(1000).messages({
        "string.max": "Description must be at most 1000 characters long",
    }),
    questions: Joi.array().items(Joi.string().hex().length(24)).messages({
        "array.base": "Questions must be an array",
        "string.hex": "Each question must be a valid ObjectId",
        "string.length": "Each question must be a 24-character hex string",
    }),
    totalMarks: Joi.number().integer().min(0).messages({
        "number.base": "Total marks must be a number",
        "number.integer": "Total marks must be an integer",
        "number.min": "Total marks must be at least 0",
    }),
    durationMinutes: Joi.number().integer().min(1).messages({
        "number.base": "Duration must be a number",
        "number.integer": "Duration must be an integer",
        "number.min": "Duration must be at least 1 minute",
    }),
    startAt: Joi.date().iso().messages({
        "date.format": "Start date must be in ISO format",
    }),
    endAt: Joi.date().iso().when("startAt", {
        is: Joi.exist(),
        then: Joi.date().greater(Joi.ref("startAt")).messages({
            "date.greater": "End date must be after start date",
        }),
    }).messages({
        "date.format": "End date must be in ISO format",
    }),
}).options({ abortEarly: false, allowUnknown: true });

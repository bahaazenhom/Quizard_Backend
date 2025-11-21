import Joi from "joi";

const answerSchema = Joi.object({
  question: Joi.string().trim().required(),
  selectedIndex: Joi.number().integer().min(0).required(),
  isCorrect: Joi.boolean().optional(), // Auto-calculated by the service
});

export const createSubmissionSchema = Joi.object({
  quiz: Joi.string().trim().required(),
  student: Joi.string().trim().optional(), // Auto-set from authenticated user
  answers: Joi.array().items(answerSchema).min(1).required(),
  scoreTotal: Joi.number().min(0).optional(),
  startedAt: Joi.date().optional(),
  submittedAt: Joi.date().optional(),
});

export const updateSubmissionSchema = Joi.object({
  quiz: Joi.string().trim(),
  student: Joi.string().trim(),
  answers: Joi.array().items(answerSchema).min(1),
  scoreTotal: Joi.number().min(0),
  startedAt: Joi.date(),
  submittedAt: Joi.date(),
});

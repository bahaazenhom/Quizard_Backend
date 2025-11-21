import Joi from "joi";

export const aiCreditValidationSchema = {
  deductCredits: Joi.object({
    creditsToDeduct: Joi.number().positive().required().messages({
      "number.base": "creditsToDeduct must be a number",
      "number.positive": "creditsToDeduct must be a positive number",
      "any.required": "creditsToDeduct is required",
    }),
  }),

  refundCredits: Joi.object({
    creditsToRefund: Joi.number().positive().required().messages({
      "number.base": "creditsToRefund must be a number",
      "number.positive": "creditsToRefund must be a positive number",
      "any.required": "creditsToRefund is required",
    }),
  }),
};

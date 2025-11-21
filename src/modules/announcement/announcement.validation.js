import Joi from "joi";

export const announcementValidation = {
  createAnnouncement: Joi.object().keys({
    text: Joi.string().required().trim().messages({
      "string.empty": "Announcement text is required",
      "any.required": "Announcement text is required",
    }),
    quiz: Joi.string().optional().messages({
      "string.base": "Quiz must be a valid ID",
    }),
    group: Joi.string().required().messages({
      "any.required": "Group ID is required",
      "string.base": "Group ID must be a string",
    }),
  }),

  updateAnnouncement: Joi.object()
    .keys({
      text: Joi.string().trim().messages({
        "string.empty": "Announcement text cannot be empty",
      }),
      quiz: Joi.string().optional().messages({
        "string.base": "Quiz must be a valid ID",
      }),
    })
    .min(1)
    .messages({
      "object.min":
        "At least one field (text or quiz) must be provided for update",
    }),
};

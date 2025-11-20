import Question from "../../models/question.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class QuestionService {
  async createQuestion(data) {
    try {
      const question = new Question(data);
      await question.save();
      return question;
    } catch (error) {
      throw new ErrorClass("Failed to create question", 500, error.message, "QuestionService.createQuestion");
    }
  }

  async getQuestions() {
    try {
      return await Question.find();
    } catch (error) {
      throw new ErrorClass("Failed to fetch questions", 500, error.message, "QuestionService.getQuestions");
    }
  }

  async getQuestionById(id) {
    try {
      const question = await Question.findById(id);
      if (!question) {
        throw new ErrorClass("Question not found", 404, null, "QuestionService.getQuestionById");
      }
      return question;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass("Failed to fetch question", 500, error.message, "QuestionService.getQuestionById");
    }
  }

  async updateQuestion(id, data) {
    try {
      const updated = await Question.findByIdAndUpdate(id, data, { new: true });
      if (!updated) {
        throw new ErrorClass("Question not found", 404, null, "QuestionService.updateQuestion");
      }
      return updated;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass("Failed to update question", 500, error.message, "QuestionService.updateQuestion");
    }
  }

  async deleteQuestion(id) {
    try {
      const deleted = await Question.findByIdAndDelete(id);
      if (!deleted) {
        throw new ErrorClass("Question not found", 404, null, "QuestionService.deleteQuestion");
      }
      return deleted;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass("Failed to delete question", 500, error.message, "QuestionService.deleteQuestion");
    }
  }
}

import { QuestionService } from "./question.service.js";

const questionService = new QuestionService();

export class QuestionController {
  async createQuestion(req, res, next) {
    try {
      const question = await questionService.createQuestion(req.body);
      res.status(201).json({ success: true, data: question });
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req, res, next) {
    try {
      const questions = await questionService.getQuestions();
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req, res, next) {
    try {
      const question = await questionService.getQuestionById(req.params.id);
      res.status(200).json({ success: true, data: question });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const updated = await questionService.updateQuestion(req.params.id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      const deleted = await questionService.deleteQuestion(req.params.id);
      res.status(200).json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }
}

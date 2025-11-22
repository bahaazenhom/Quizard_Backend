import { SubmissionService } from "./submission.service.js";

const submissionService = new SubmissionService();

export class SubmissionController {
  async createSubmission(req, res, next) {
    try {
      const submissionData = {
        quiz: req.body.quiz,
        answers: req.body.answers || [],
        student: req.authUser._id, // Automatically set student ID from authenticated user
        startedAt: req.body.startedAt,
      };
      const submission = await submissionService.createSubmission(
        submissionData
      );
      res.status(201).json({
        success: true,
        message: "Submission created successfully with feedback",
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissions(req, res, next) {
    try {
      const submissions = await submissionService.getSubmissions();
      res.status(200).json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionById(req, res, next) {
    try {
      const submission = await submissionService.getSubmissionById(
        req.params.id
      );
      res.status(200).json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  async updateSubmission(req, res, next) {
    try {
      const updated = await submissionService.updateSubmission(
        req.params.id,
        req.body
      );
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubmission(req, res, next) {
    try {
      const deleted = await submissionService.deleteSubmission(req.params.id);
      res.status(200).json({ success: true, data: deleted });
    } catch (error) {
      next(error);
    }
  }

  async checkQuizTaken(req, res, next) {
    try {
      const { userId, quizId } = req.body;
      const result = await submissionService.checkQuizTaken(userId, quizId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissionByQuizAndStudent(req, res, next) {
    try {
      const { quizId } = req.params;
      const studentId = req.authUser._id; // Get student ID from authenticated user
      const submission = await submissionService.getSubmissionByQuizAndStudent(
        quizId,
        studentId
      );
      res.status(200).json({
        success: true,
        message: "Submission retrieved successfully",
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }
}

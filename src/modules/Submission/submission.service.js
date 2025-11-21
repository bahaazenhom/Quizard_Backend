import Submission from "../../models/submission.model.js";
import Question from "../../models/question.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class SubmissionService {
  async createSubmission(data) {
    try {
      // Validate required fields
      if (
        !data.answers ||
        !Array.isArray(data.answers) ||
        data.answers.length === 0
      ) {
        throw new ErrorClass(
          "Answers array is required and must not be empty",
          400,
          null,
          "SubmissionService.createSubmission"
        );
      }

      // Fetch all questions to get correct answers and points
      const questionIds = data.answers.map((answer) => answer.question);
      const questions = await Question.find({
        _id: { $in: questionIds },
      }).select("+correctOptionIndex point");

      if (questions.length !== data.answers.length) {
        throw new ErrorClass(
          "One or more questions not found",
          404,
          null,
          "SubmissionService.createSubmission"
        );
      }

      // Create a map of questions for easy lookup
      const questionMap = {};
      questions.forEach((q) => {
        questionMap[q._id.toString()] = q;
      });

      // Calculate score and update isCorrect for each answer
      let totalScore = 0;
      const processedAnswers = data.answers.map((answer) => {
        const question = questionMap[answer.question.toString()];
        const isCorrect = answer.selectedIndex === question.correctOptionIndex;

        // Add points if answer is correct
        if (isCorrect) {
          totalScore += question.point || 1;
        }

        return {
          question: answer.question,
          selectedIndex: answer.selectedIndex,
          isCorrect,
        };
      });

      // Create submission with calculated score
      const submission = new Submission({
        ...data,
        answers: processedAnswers,
        scoreTotal: totalScore,
        submittedAt: new Date(),
      });

      await submission.save();
      return submission;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Failed to create submission",
        500,
        error.message,
        "SubmissionService.createSubmission"
      );
    }
  }

  async getSubmissions() {
    try {
      return await Submission.find()
        .populate("quiz")
        .populate("student")
        .populate("answers.question");
    } catch (error) {
      throw new ErrorClass(
        "Failed to fetch submissions",
        500,
        error.message,
        "SubmissionService.getSubmissions"
      );
    }
  }

  async getSubmissionById(id) {
    try {
      const submission = await Submission.findById(id)
        .populate("quiz")
        .populate("student")
        .populate("answers.question");
      if (!submission) {
        throw new ErrorClass(
          "Submission not found",
          404,
          null,
          "SubmissionService.getSubmissionById"
        );
      }
      return submission;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Failed to fetch submission",
        500,
        error.message,
        "SubmissionService.getSubmissionById"
      );
    }
  }

  async updateSubmission(id, data) {
    try {
      const updated = await Submission.findByIdAndUpdate(id, data, {
        new: true,
      })
        .populate("quiz")
        .populate("student")
        .populate("answers.question");
      if (!updated) {
        throw new ErrorClass(
          "Submission not found",
          404,
          null,
          "SubmissionService.updateSubmission"
        );
      }
      return updated;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Failed to update submission",
        500,
        error.message,
        "SubmissionService.updateSubmission"
      );
    }
  }

  async deleteSubmission(id) {
    try {
      const deleted = await Submission.findByIdAndDelete(id);
      if (!deleted) {
        throw new ErrorClass(
          "Submission not found",
          404,
          null,
          "SubmissionService.deleteSubmission"
        );
      }
      return deleted;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Failed to delete submission",
        500,
        error.message,
        "SubmissionService.deleteSubmission"
      );
    }
  }
}

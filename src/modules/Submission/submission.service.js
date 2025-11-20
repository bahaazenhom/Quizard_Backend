import Submission from "../../models/submission.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class SubmissionService {
  async createSubmission(data) {
    try {
      const submission = new Submission(data);
      await submission.save();
      return submission;
    } catch (error) {
      throw new ErrorClass("Failed to create submission", 500, error.message, "SubmissionService.createSubmission");
    }
  }

  async getSubmissions() {
    try {
      return await Submission.find().populate("quiz").populate("student").populate("answers.question");
    } catch (error) {
      throw new ErrorClass("Failed to fetch submissions", 500, error.message, "SubmissionService.getSubmissions");
    }
  }

  async getSubmissionById(id) {
    try {
      const submission = await Submission.findById(id)
        .populate("quiz")
        .populate("student")
        .populate("answers.question");
      if (!submission) {
        throw new ErrorClass("Submission not found", 404, null, "SubmissionService.getSubmissionById");
      }
      return submission;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass("Failed to fetch submission", 500, error.message, "SubmissionService.getSubmissionById");
    }
  }

  async updateSubmission(id, data) {
    try {
      const updated = await Submission.findByIdAndUpdate(id, data, { new: true })
        .populate("quiz")
        .populate("student")
        .populate("answers.question");
      if (!updated) {
        throw new ErrorClass("Submission not found", 404, null, "SubmissionService.updateSubmission");
      }
      return updated;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass("Failed to update submission", 500, error.message, "SubmissionService.updateSubmission");
    }
  }

  async deleteSubmission(id) {
    try {
      const deleted = await Submission.findByIdAndDelete(id);
      if (!deleted) {
        throw new ErrorClass("Submission not found", 404, null, "SubmissionService.deleteSubmission");
      }
      return deleted;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass("Failed to delete submission", 500, error.message, "SubmissionService.deleteSubmission");
    }
  }
}

import Submission from "../../models/submission.model.js";
import Question from "../../models/question.model.js";
import Quiz from "../../models/quiz.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

export class SubmissionService {
  async createSubmission(data) {
    try {
      // Validate quiz ID is provided
      if (!data.quiz) {
        throw new ErrorClass(
          "Quiz ID is required",
          400,
          null,
          "SubmissionService.createSubmission"
        );
      }

      // Fetch quiz from database
      const quiz = await Quiz.findById(data.quiz).populate("questions");
      if (!quiz) {
        throw new ErrorClass(
          "Quiz not found",
          404,
          null,
          "SubmissionService.createSubmission"
        );
      }

      // Get all questions from the quiz
      const quizQuestions = await Question.find({
        _id: { $in: quiz.questions },
      }).select("+correctOptionIndex point text options");

      if (!quizQuestions || quizQuestions.length === 0) {
        throw new ErrorClass(
          "No questions found in this quiz",
          404,
          null,
          "SubmissionService.createSubmission"
        );
      }

      // Create question map for lookup
      const questionMap = {};
      let totalQuizPoints = 0;
      quizQuestions.forEach((q) => {
        questionMap[q._id.toString()] = q;
        totalQuizPoints += q.point || 1;
      });

      // Process answers and create feedback
      let totalScore = 0;
      const processedAnswers = quizQuestions.map((question) => {
        // Find if student answered this question
        const userAnswer = data.answers?.find(
          (a) => a.question.toString() === question._id.toString()
        );

        // If no answer selected, mark as -1 with false
        const selectedIndex = userAnswer?.selectedIndex ?? -1;
        const isCorrect =
          selectedIndex !== -1 && selectedIndex === question.correctOptionIndex;

        // Add points if answer is correct
        if (isCorrect) {
          totalScore += question.point || 1;
        }

        return {
          question: question._id,
          questionText: question.text,
          options: question.options,
          point: question.point || 1,
          selectedIndex,
          correctOptionIndex: question.correctOptionIndex,
          isCorrect,
        };
      });

      // Create submission with all feedback data
      const submission = new Submission({
        quiz: data.quiz,
        student: data.student,
        answers: processedAnswers,
        scoreTotal: totalScore,
        totalQuizPoints,
        submittedAt: new Date(),
        startedAt: data.startedAt,
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

  async checkQuizTaken(userId, quizId) {
    try {
      const submission = await Submission.findOne({
        student: userId,
        quiz: quizId,
      });

      return {
        isTaken: !!submission,
        submission: submission || null,
      };
    } catch (error) {
      throw new ErrorClass(
        "Failed to check quiz status",
        500,
        error.message,
        "SubmissionService.checkQuizTaken"
      );
    }
  }

  async getSubmissionByQuizAndStudent(quizId, studentId) {
    try {
      const submission = await Submission.findOne({
        quiz: quizId,
        student: studentId,
      })
        .populate("quiz")
        .populate("student", "firstName lastName email");

      if (!submission) {
        throw new ErrorClass(
          "Submission not found for this quiz",
          404,
          null,
          "SubmissionService.getSubmissionByQuizAndStudent"
        );
      }

      return submission;
    } catch (error) {
      if (error instanceof ErrorClass) throw error;
      throw new ErrorClass(
        "Failed to fetch submission",
        500,
        error.message,
        "SubmissionService.getSubmissionByQuizAndStudent"
      );
    }
  }
}

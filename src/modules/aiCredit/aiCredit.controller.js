import { AICreditService } from "./aiCredit.service.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

const creditService = new AICreditService();

export class AICreditController {
  checkAndDeductCredits = async (req, res, next) => {
    try {
      const userId = req.authUser._id;
      const { aiCredit } = req.body;

      // Validate aiCredit is provided in body
      if (!aiCredit || aiCredit <= 0) {
        return next(
          new ErrorClass(
            "aiCredit is required and must be greater than 0",
            400,
            { aiCredit },
            "checkAndDeductCredits"
          )
        );
      }

      // Get user's remaining credits from subscription
      const creditInfo = await creditService.getRemainingCredits(userId);
      req.userCredits = creditInfo;

      // Check if user has enough credits
      if (creditInfo.creditsRemaining < aiCredit) {
        return next(
          new ErrorClass(
            "Insufficient AI credits",
            403,
            {
              available: creditInfo.creditsRemaining,
              required: aiCredit,
              message: `You have ${creditInfo.creditsRemaining} credits but need ${aiCredit}`,
            },
            "checkAndDeductCredits"
          )
        );
      }

      // Deduct the credits
      const deductionResult = await creditService.deductCredits(
        userId,
        aiCredit
      );

      // Attach deduction result to request for use in next middleware/controller
      req.creditDeduction = deductionResult;

      // Proceed to next middleware/controller
      next();
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to check and deduct AI credits",
          500,
          error.message,
          "checkAndDeductCredits"
        )
      );
    }
  };

  /**
   * Get remaining AI credits for current user
   * Endpoint: GET /api/v1/ai-credits/remaining
   */
  async getRemainingCredits(req, res, next) {
    try {
      const userId = req.authUser._id;

      const creditInfo = await creditService.getRemainingCredits(userId);

      return res.json({
        success: true,
        message: "Credits retrieved successfully",
        data: creditInfo,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to get remaining credits",
          500,
          error.message,
          "getRemainingCredits"
        )
      );
    }
  }

  /**
   * Refund AI credits (admin/system use)
   * Endpoint: POST /api/v1/ai-credits/refund
   */
  async refundCredits(req, res, next) {
    try {
      const userId = req.authUser._id;
      const { creditsToRefund } = req.body;

      if (!creditsToRefund) {
        return next(
          new ErrorClass(
            "creditsToRefund is required",
            400,
            null,
            "refundCredits"
          )
        );
      }

      const result = await creditService.refundCredits(userId, creditsToRefund);

      return res.json({
        success: true,
        message: "Credits refunded successfully",
        data: result,
      });
    } catch (error) {
      next(
        new ErrorClass(
          "Failed to refund credits",
          500,
          error.message,
          "refundCredits"
        )
      );
    }
  }
}

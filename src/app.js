import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import planRouter from "./modules/plan/plan.router.js";
import userRouter from "./modules/user/user.route.js";
import groupRouter from "./modules/Group/group.route.js";
import subscriptionRouter from "./modules/subscription/subscription.route.js";
import aiCreditRouter from "./modules/aiCredit/aicredit.route.js";
import materialRouter from "./modules/Material/material.route.js";
import moduleRouter from "./modules/Module/module.route.js";
import analyticsRouter from "./modules/analytics/analytics.route.js";
import questionRouter from "./modules/Question/question.route.js";
import submissionRouter from "./modules/Submission/submission.route.js";
import quizRoutes from "./modules/Quiz/quiz.route.js";
import moduleQuizRoutes from "./modules/ModuleQuiz/moduleQuiz.route.js";
import { announcementRouter } from "./modules/announcement/announcement.route.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config.js";
import { SubscriptionController } from "./modules/subscription/subscription.controller.js";
import agentRouter from "./modules/Agent/agent.routes.js";

const subscriptionController = new SubscriptionController();
const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: false, // Allow Google OAuth popup
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173", "https://quizzard-frontend.vercel.app"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.post(
  "/api/v1/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleStripeWebhook.bind(subscriptionController)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies for refresh token and other uses
// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Quizard API Docs",
  })
);
// Define your routes here
app.use("/api/v1/users", userRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/ai-credits", aiCreditRouter);
app.use("/api/v1/materials", materialRouter);
app.use("/api/v1/modules", moduleRouter);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/module-quizzes", moduleQuizRoutes);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/submissions", submissionRouter);
app.use("/api/v1/agent", agentRouter);

// global error handler
app.use(globalResponse);

export default app;

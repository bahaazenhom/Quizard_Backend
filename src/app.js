import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import planRouter from "./modules/plan/plan.router.js";
import userRouter from "./modules/user/user.route.js";
import groupRouter from "./modules/Group/group.route.js";
import subscriptionRouter from "./modules/subscription/subscription.route.js";
import materialRouter from "./modules/Material/material.route.js";
import moduleRouter from "./modules/Module/module.route.js";
import quizRoutes from "./modules/Quiz/quiz.route.js";
import moduleQuizRoutes from "./modules/ModuleQuiz/moduleQuiz.route.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config.js";
import { SubscriptionController } from "./modules/subscription/subscription.controller.js";
const subscriptionController = new SubscriptionController(); 
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://quizzard-frontend.vercel.app"],
    credentials: true,
  })
);

app.post(
  "/api/v1/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleStripeWebhook.bind(subscriptionController)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api/v1/materials", materialRouter);
app.use("/api/v1/modules", moduleRouter);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/module-quizzes", moduleQuizRoutes);
// global error handler
app.use(globalResponse);

export default app;

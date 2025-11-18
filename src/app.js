import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import planRouter from "./modules/plan/plan.router.js";
import userRouter from "./modules/user/user.route.js";
import groupRouter from "./modules/Group/group.route.js";
import subscriptionRouter from "./modules/subscription/subscription.route.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quizzard-frontend.vercel.app", // <-- add your deployed frontend URL here
    ],
    credentials: true,
  })
);
app.use(express.json());
// Define your routes here
app.use("/api/v1/users", userRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/plans", planRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
// global error handler
app.use(globalResponse);

export default app;

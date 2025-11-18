import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import path from "path";
import userRouter from "./modules/user/user.route.js";
import groupRouter from "./modules/Group/group.route.js";
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

app.use("/uploads", express.static(path.resolve("src/uploads")));

// global error handler
app.use(globalResponse);

export default app;

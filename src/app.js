import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import userRouter from "./modules/user/user.route.js";
import groupRouter from "./modules/Group/group.route.js";
import cors from "cors";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads", "profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/users", userRouter);
app.use("/api/v1/groups", groupRouter);

// global error handler
app.use(globalResponse);

export default app;

import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import userRouter from "./modules/user/user.route.js";
const app = express();

app.use(express.json());

// Define your routes here
app.use("/api/v1/users", userRouter);
// global error handler
app.use(globalResponse);

export default app;

import express from "express";
import { globalResponse } from "./middlewares/globalErrorHandler.middleware.js";
import userRouter from "./modules/user/user.route.js";
import moduleRouter from "./modules/module/module.route.js";
const app = express();

app.use(express.json());

// Define your routes here
app.use("/api/v1/users", userRouter);
app.use("/api/v1/modules", moduleRouter);
// global error handler
app.use(globalResponse);

export default app;

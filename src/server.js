import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { initializeCronJobs } from "./utils/cron.util.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);

    // Initialize cron jobs for automatic tasks
    initializeCronJobs();
  });
});

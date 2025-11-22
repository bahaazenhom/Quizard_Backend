import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { initializeCronJobs } from "./utils/cron.util.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  // Join room for specific session
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`📡 Socket ${socket.id} joined session room: ${sessionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log(`WebSocket server ready on port: ${PORT}`);

    // Initialize cron jobs for automatic tasks
    initializeCronJobs();
  });
});

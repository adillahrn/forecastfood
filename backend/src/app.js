import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use("/api", routes);

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Error Handler ──
app.use(errorHandler);

export default app;

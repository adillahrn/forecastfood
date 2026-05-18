import express from "express";
import {
  getAllHistory,
  getHistoryById,
  deleteHistory,
} from "../controllers/historyController.js";

const router = express.Router();

// GET /api/history — get all prediction sessions
router.get("/", getAllHistory);

// GET /api/history/:id — get detail of one session
router.get("/:id", getHistoryById);

// DELETE /api/history/:id — delete a session
router.delete("/:id", deleteHistory);

export default router;

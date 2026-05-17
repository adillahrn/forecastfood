import express from "express";
import multer from "multer";
import {
  createPrediction,
  getPredictionById,
} from "../controllers/predictionController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/predictions — upload CSV & run prediction
router.post("/", upload.single("file"), createPrediction);

// GET /api/predictions/:id — get prediction by session ID
router.get("/:id", getPredictionById);

export default router;

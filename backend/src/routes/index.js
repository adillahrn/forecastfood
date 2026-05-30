import express from "express";
import predictionRoutes from "./predictionRoutes.js";
import stockRoutes from "./stockRoutes.js";
import historyRoutes from "./historyRoutes.js";
import { authenticate } from "../middleware/validateRequest.js";

const router = express.Router();

// Semua route butuh authentication
router.use(authenticate);

router.use("/predictions", predictionRoutes);
router.use("/stocks", stockRoutes);
router.use("/history", historyRoutes);

export default router;
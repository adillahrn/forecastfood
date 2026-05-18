import express from "express";
import predictionRoutes from "./predictionRoutes.js";
import stockRoutes from "./stockRoutes.js";
import historyRoutes from "./historyRoutes.js";

const router = express.Router();

router.use("/predictions", predictionRoutes);
router.use("/stocks", stockRoutes);
router.use("/history", historyRoutes);

export default router;

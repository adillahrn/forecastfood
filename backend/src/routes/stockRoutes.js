import express from "express";
import {
  getStocks,
  markAsOrdered,
} from "../controllers/stockController.js";

const router = express.Router();

// GET /api/stocks — get all stock recommendations
router.get("/", getStocks);

// PUT /api/stocks/:id/order — mark item as ordered
router.put("/:id/order", markAsOrdered);

export default router;

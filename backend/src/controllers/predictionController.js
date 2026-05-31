import axios from "axios";
import { supabase } from "../services/supabase.js";
import { parseCSV } from "../utils/csvParser.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/predictions
export const createPrediction = async (req, res) => {
  try {
    let items = [];

    // Handle CSV upload
    if (req.file) {
      const csvText = req.file.buffer.toString("utf-8");
      const parsed = parseCSV(csvText);
      items = parsed.map((row) => ({
        type_of_food: row.type_of_food,
        number_of_guests: parseInt(row.number_of_guests),
        event_type: row.event_type,
        storage_conditions: row.storage_conditions,
        seasonality: row.seasonality,
        preparation_method: row.preparation_method,
        wastage_food_amount: parseFloat(row.wastage_food_amount),
      }));
    }
    // Handle manual entry (JSON body)
    else if (req.body.items) {
      items = JSON.parse(req.body.items);
    } else if (req.body.type_of_food) {
      // Single item
      items = [{
        type_of_food: req.body.type_of_food,
        number_of_guests: parseInt(req.body.number_of_guests),
        event_type: req.body.event_type,
        storage_conditions: req.body.storage_conditions,
        seasonality: req.body.seasonality,
        preparation_method: req.body.preparation_method,
        wastage_food_amount: parseFloat(req.body.wastage_food_amount),
      }];
    } else {
      return sendError(res, 400, "No data provided.");
    }

    // Call AI Service
    let predictions = [];
    try {
      if (items.length === 1) {
        // Single prediction
        const aiRes = await axios.post(`${AI_SERVICE_URL}/predict`, items[0]);
        predictions = [{
          ...aiRes.data.data.input_summary,
          predicted_quantity: aiRes.data.data.predicted_quantity,
        }];
      } else {
        // Batch prediction
        const aiRes = await axios.post(`${AI_SERVICE_URL}/predict/batch`, { items });
        predictions = aiRes.data.predictions.map((p) => ({
          ...p.input_summary,
          predicted_quantity: p.predicted_quantity,
        }));
      }
    } catch (aiError) {
      console.error("AI Service error:", aiError.message);
      return sendError(res, 503, "AI service is currently unavailable. Please try again later.");
    }

    // Save session to Supabase
    const { data: session, error: sessionError } = await supabase
      .from("prediction_history")
      .insert({
        file_name: req.file?.originalname || "manual_entry",
        total_items: predictions.length,
        status: "completed",
        user_id: req.user.id,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Save predictions to Supabase
    const { error: predError } = await supabase
      .from("predictions")
      .insert(predictions.map((p) => ({
        history_id: session.id,
        user_id: req.user.id,
        type_of_food: p.type_of_food,
        number_of_guests: p.number_of_guests,
        event_type: p.event_type,
        storage_conditions: p.storage_conditions,
        seasonality: p.seasonality,
        preparation_method: p.preparation_method,
        wastage_food_amount: p.wastage_food_amount,
        predicted_quantity: p.predicted_quantity,
      })));

    if (predError) throw predError;

    return sendSuccess(res, 201, "Prediksi berhasil dibuat", {
      session_id: session.id,
      total_items: predictions.length,
      predictions,
    });
  } catch (error) {
    console.error("createPrediction error:", error);
    return sendError(res, 500, "Gagal membuat prediksi", error.message);
  }
};

// GET /api/predictions/:id
export const getPredictionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("history_id", id)
      .eq("user_id", req.user.id);

    if (error) throw error;
    if (!data.length) return sendError(res, 404, "Data prediksi tidak ditemukan");

    return sendSuccess(res, 200, "Berhasil mengambil data prediksi", {
      session_id: id,
      predictions: data,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil data prediksi", error.message);
  }
};
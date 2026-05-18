import { supabase } from "../services/supabase.js";
import { parseCSV } from "../utils/csvParser.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

// POST /api/predictions
export const createPrediction = async (req, res) => {
  try {
    let items = [];

    // Handle CSV upload
    if (req.file) {
      const csvText = req.file.buffer.toString("utf-8");
      items = parseCSV(csvText);
    } 
    // Handle manual entry
    else if (req.body.items) {
      items = JSON.parse(req.body.items);
    } else {
      return sendError(res, 400, "No data provided. Upload a CSV or send manual entries.");
    }

    // TODO: Call AI service for prediction
    // const aiResponse = await axios.post(process.env.AI_SERVICE_URL + "/predict", { items });
    // const predictions = aiResponse.data.predictions;

    // Dummy prediction for now (replace with AI response later)
    const predictions = items.map((item) => ({
      item_name: item.item_name || item.name,
      unit: item.unit || "units",
      today_demand: parseInt(item.quantity) || 0,
      day_1: Math.floor(Math.random() * 100) + 50,
      day_2: Math.floor(Math.random() * 100) + 50,
      day_3: Math.floor(Math.random() * 100) + 50,
      day_4: Math.floor(Math.random() * 100) + 50,
      day_5: Math.floor(Math.random() * 100) + 50,
      day_6: Math.floor(Math.random() * 100) + 50,
      day_7: Math.floor(Math.random() * 100) + 50,
      trend: ["up", "down", "flat"][Math.floor(Math.random() * 3)],
    }));

    // Save session to Supabase
    const { data: session, error: sessionError } = await supabase
      .from("prediction_history")
      .insert({
        file_name: req.file?.originalname || "manual_entry",
        total_items: predictions.length,
        status: "completed",
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Save predictions to Supabase
    const { error: predError } = await supabase
      .from("predictions")
      .insert(predictions.map((p) => ({ ...p, history_id: session.id })));

    if (predError) throw predError;

    // Save stock recommendations
    const stocks = predictions.map((p) => {
      const totalDemand = p.day_1 + p.day_2 + p.day_3 + p.day_4 + p.day_5 + p.day_6 + p.day_7;
      const currentStock = p.today_demand;
      const recommended = Math.max(0, totalDemand - currentStock);
      const status = recommended > 0 ? "low" : currentStock > totalDemand * 1.5 ? "overstock" : "safe";

      return {
        history_id: session.id,
        item_name: p.item_name,
        current_stock: currentStock,
        predicted_demand: totalDemand,
        recommended_order: recommended,
        unit: p.unit,
        status,
      };
    });

    const { error: stockError } = await supabase
      .from("stock_recommendations")
      .insert(stocks);

    if (stockError) throw stockError;

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
      .eq("history_id", id);

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

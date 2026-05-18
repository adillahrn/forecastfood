import { supabase } from "../services/supabase.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

// GET /api/stocks
export const getStocks = async (req, res) => {
  try {
    const { session_id, status } = req.query;

    let query = supabase.from("stock_recommendations").select("*");

    if (session_id) query = query.eq("history_id", session_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 200, "Berhasil mengambil rekomendasi stok", data);
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil rekomendasi stok", error.message);
  }
};

// PUT /api/stocks/:id/order
export const markAsOrdered = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("stock_recommendations")
      .update({ is_ordered: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 404, "Item tidak ditemukan");

    return sendSuccess(res, 200, "Item berhasil ditandai sebagai sudah dipesan", data);
  } catch (error) {
    return sendError(res, 500, "Gagal update status order", error.message);
  }
};

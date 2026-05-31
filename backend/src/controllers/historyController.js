import { supabase } from "../services/supabase.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

// GET /api/history
export const getAllHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("prediction_history")
      .select("*", { count: "exact" })
      .eq("user_id", req.user.id)  // ← tambah ini
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return sendSuccess(res, 200, "Berhasil mengambil riwayat", {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      sessions: data,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil riwayat", error.message);
  }
};

// GET /api/history/:id
export const getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: session, error: sessionError } = await supabase
      .from("prediction_history")
      .select("*")
      .eq("id", id)
      .single();

    if (sessionError) throw sessionError;
    if (!session) return sendError(res, 404, "Sesi tidak ditemukan");

    const { data: predictions } = await supabase
      .from("predictions")
      .select("*")
      .eq("history_id", id);

    const { data: stocks } = await supabase
      .from("stock_recommendations")
      .select("*")
      .eq("history_id", id);

    return sendSuccess(res, 200, "Berhasil mengambil detail riwayat", {
      session,
      predictions,
      stocks,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil detail riwayat", error.message);
  }
};

// DELETE /api/history/:id
export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("prediction_history")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return sendSuccess(res, 200, "Riwayat berhasil dihapus", null);
  } catch (error) {
    return sendError(res, 500, "Gagal menghapus riwayat", error.message);
  }
};

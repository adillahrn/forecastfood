import api from "./api";

/**
 * Mengirim satu prediksi berbasis event ke backend Node.js
 * yang kemudian meneruskannya ke AI API (FastAPI).
 * @param {object} eventData - Objek berisi 7 fitur event
 */
export const runPrediction = async (eventData) => {
  const res = await api.post("/predictions", eventData);
  return res.data;
};

/**
 * Mengirim banyak prediksi sekaligus (batch)
 * @param {Array<object>} items - Array berisi objek 7 fitur event
 */
export const runBatchPrediction = async (items) => {
  const res = await api.post("/predictions/batch", { items });
  return res.data;
};

/**
 * Mengambil data prediksi berdasarkan session ID
 * @param {string} id - Session ID
 */
export const getPrediction = async (id) => {
  const res = await api.get(`/predictions/${id}`);
  return res.data;
};
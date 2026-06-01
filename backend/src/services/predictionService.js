import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const runPrediction = async (payload) => {
  try {
    const isBatch = Array.isArray(payload.items);

    const endpoint = isBatch
      ? "/predict/batch"
      : "/predict";

    const response = await axios.post(
      `${API_BASE_URL}${endpoint}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("API ERROR DETAIL:", error);
    throw error;
  }
};
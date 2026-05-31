import api from "./api";

export const runPrediction = async (payload) => {
  // Kalau payload punya 'items' → batch
  // Kalau tidak → single
  if (payload.items) {
    const res = await api.post("/predictions", {
      items: JSON.stringify(payload.items),
    });
    return res.data;
  } else {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const res = await api.post("/predictions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
};
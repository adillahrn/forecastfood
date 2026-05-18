import api from "./api";

export const runPrediction = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/predictions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getPrediction = async (id) => {
  const res = await api.get(`/predictions/${id}`);
  return res.data;
};
import api from "./api";

export const getAllHistory = async (page = 1, limit = 10) => {
  const res = await api.get("/history", { params: { page, limit } });
  return res.data;
};

export const getHistoryById = async (id) => {
  const res = await api.get(`/history/${id}`);
  return res.data;
};

export const deleteHistory = async (id) => {
  const res = await api.delete(`/history/${id}`);
  return res.data;
};
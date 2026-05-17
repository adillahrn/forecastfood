import api from "./api";

export const getStocks = async (sessionId, status) => {
  const params = {};
  if (sessionId) params.session_id = sessionId;
  if (status) params.status = status;
  const res = await api.get("/stocks", { params });
  return res.data;
};

export const markAsOrdered = async (id) => {
  const res = await api.put(`/stocks/${id}/order`);
  return res.data;
};
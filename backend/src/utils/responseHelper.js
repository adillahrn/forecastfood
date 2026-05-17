export const sendSuccess = (res, status, message, data) => {
  return res.status(status).json({ success: true, message, data });
};

export const sendError = (res, status, message, error) => {
  return res.status(status).json({ success: false, message, error });
};

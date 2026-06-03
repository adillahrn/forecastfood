import app from "./app.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

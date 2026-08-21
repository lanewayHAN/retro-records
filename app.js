import express from "express";

const app = express();

// Allow the API to receive JSON
app.use(express.json());

// Test route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Retro Records API is running"
  });
});

export default app;
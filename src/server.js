import app from "./app.js";
import pool from "./db.js";

const PORT = 3000;

try {
  await pool.query("SELECT NOW()");
  console.log("PostgreSQL connected successfully");

  app.listen(PORT, () => {
    console.log(`Retro Records API running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Database connection failed:", error.message);
  process.exit(1);
}
import pool from "../db.js";
import { checkRabbitMQ } from "../messaging/rabbitmq.js";

export async function getHealthStatus() {
  let postgresql = "down";
  let rabbitmq = "down";

  // Check PostgreSQL
  try {
    await pool.query("SELECT 1");
    postgresql = "up";
  } catch {
    postgresql = "down";
  }

  // Check RabbitMQ
  try {
    const rabbitHealthy = await checkRabbitMQ();

    if (rabbitHealthy) {
      rabbitmq = "up";
    }
  } catch {
    rabbitmq = "down";
  }

  const healthy =
    postgresql === "up" &&
    rabbitmq === "up";

  return {
    status: healthy ? "healthy" : "degraded",
    service: "retro-records-api",
    timestamp: new Date().toISOString(),
    dependencies: {
      postgresql,
      rabbitmq
    }
  };
}
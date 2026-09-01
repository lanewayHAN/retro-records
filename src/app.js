import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import productRoutes from "./products/product.routes.js";
import userRoutes from "./users/user.routes.js";
import orderRoutes from "./orders/order.routes.js";
import authRoutes from "./auth/auth.routes.js";
import discogsRoutes from "./discogs/discogs.routes.js";
import healthRoutes from "./health/health.routes.js";

import swaggerDocument from "./swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// Health endpoints
app.use("/health", healthRoutes);
app.use("/api/health", healthRoutes);

// API endpoints
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/discogs", discogsRoutes);

app.use(errorHandler);

export default app;
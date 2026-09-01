import express from "express";

import {
  getProducts,
  getProduct,
  postProduct,
  putProduct,
  patchProduct,
  deleteProduct
} from "./product.controller.js";

import { validate } from "../middleware/validate.js";

import {
  createProductSchema,
  replaceProductSchema,
  updateProductSchema
} from "./product.validation.js";

import {
  authenticateToken,
  authorizeRoles
} from "../auth/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Staff/Admin only
router.post(
  "/",
  authenticateToken,
  authorizeRoles("staff", "admin"),
  validate(createProductSchema),
  postProduct
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("staff", "admin"),
  validate(replaceProductSchema),
  putProduct
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("staff", "admin"),
  validate(updateProductSchema),
  patchProduct
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("staff", "admin"),
  deleteProduct
);

export default router;
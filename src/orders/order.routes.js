import express from "express";

import {
  getOrders,
  getOrder,
  postOrder,
  putOrder,
  patchOrder,
  deleteOrder
} from "./order.controller.js";

import { validate } from "../middleware/validate.js";

import {
  createOrderSchema,
  replaceOrderSchema,
  updateOrderSchema
} from "./order.validation.js";

const router = express.Router();

router.get("/", getOrders);
router.get("/:id", getOrder);

router.post(
  "/",
  validate(createOrderSchema),
  postOrder
);

router.put(
  "/:id",
  validate(replaceOrderSchema),
  putOrder
);

router.patch(
  "/:id",
  validate(updateOrderSchema),
  patchOrder
);

router.delete("/:id", deleteOrder);

export default router;
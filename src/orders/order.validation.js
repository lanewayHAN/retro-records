import { z } from "zod";

const statusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "cancelled"
]);

export const createOrderSchema = z.object({
  customer_id: z.number().int().positive("customer_id must be valid"),
  created_by: z.number().int().positive("created_by must be valid").optional(),
  product_id: z.number().int().positive("product_id must be valid"),
  quantity: z.number().int().positive("quantity must be greater than 0"),
  status: statusSchema.default("pending"),
  total_amount: z.number().min(0, "total_amount must be 0 or greater")
});

export const replaceOrderSchema = z.object({
  customer_id: z.number().int().positive("customer_id must be valid"),
  created_by: z.number().int().positive("created_by must be valid"),
  product_id: z.number().int().positive("product_id must be valid"),
  quantity: z.number().int().positive("quantity must be greater than 0"),
  status: statusSchema,
  total_amount: z.number().min(0, "total_amount must be 0 or greater")
});

export const updateOrderSchema = z.object({
  customer_id: z.number().int().positive("customer_id must be valid").optional(),
  created_by: z.number().int().positive("created_by must be valid").optional(),
  product_id: z.number().int().positive("product_id must be valid").optional(),
  quantity: z.number().int().positive("quantity must be greater than 0").optional(),
  status: statusSchema.optional(),
  total_amount: z.number().min(0, "total_amount must be 0 or greater").optional()
});
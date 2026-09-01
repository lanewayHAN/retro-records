import { z } from "zod";

const roleSchema = z.enum([
  "customer",
  "staff",
  "admin"
]);

export const createUserSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("email must be valid"),
  phone: z.string().optional(),
  password_hash: z.string().min(1, "password_hash is required"),
  role: roleSchema
});

export const replaceUserSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("email must be valid"),
  phone: z.string(),
  password_hash: z.string().min(1, "password_hash is required"),
  role: roleSchema
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "name cannot be empty").optional(),
  email: z.string().email("email must be valid").optional(),
  phone: z.string().optional(),
  password_hash: z.string().min(1, "password_hash cannot be empty").optional(),
  role: roleSchema.optional()
});
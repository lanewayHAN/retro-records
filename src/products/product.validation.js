import { z } from "zod";

export const createProductSchema = z.object({
  discogs_release_id: z.number().int().positive().optional(),

  album_name: z
    .string()
    .min(1, "album_name is required"),

  artist: z
    .string()
    .min(1, "artist is required"),

  format: z
    .string()
    .min(1, "format is required"),

  price: z
    .number()
    .min(0, "price must be 0 or greater"),

  stock_quantity: z
    .number()
    .int()
    .min(0, "stock_quantity must be 0 or greater")
});


export const replaceProductSchema = z.object({
  discogs_release_id: z
    .number()
    .int()
    .positive(),

  album_name: z
    .string()
    .min(1, "album_name is required"),

  artist: z
    .string()
    .min(1, "artist is required"),

  format: z
    .string()
    .min(1, "format is required"),

  price: z
    .number()
    .min(0, "price must be 0 or greater"),

  stock_quantity: z
    .number()
    .int()
    .min(0, "stock_quantity must be 0 or greater")
});

export const updateProductSchema = z.object({
  discogs_release_id: z
    .number()
    .int()
    .positive()
    .optional(),

  album_name: z
    .string()
    .min(1, "album_name cannot be empty")
    .optional(),

  artist: z
    .string()
    .min(1, "artist cannot be empty")
    .optional(),

  format: z
    .string()
    .min(1, "format cannot be empty")
    .optional(),

  price: z
    .number()
    .min(0, "price must be 0 or greater")
    .optional(),

  stock_quantity: z
    .number()
    .int()
    .min(0, "stock_quantity must be 0 or greater")
    .optional()
});
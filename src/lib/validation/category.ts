// lib/validations/category.ts
import { z } from "zod";

export const imageCategoryInput = z.object({
  imageUrl: z.string().url(),
  alt: z.string().trim().max(200).optional(),
  isPrimary: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const createCategoryInput = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  images: z.array(imageCategoryInput).optional().default([]),
});

export const updateCategoryInput = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  images: z
    .array(imageCategoryInput.extend({ id: z.string().cuid().optional() }))
    .optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategoryInput>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInput>;

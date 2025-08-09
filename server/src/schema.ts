import { z } from 'zod';

// Product schema with proper numeric handling
export const productSchema = z.object({
  id: z.number(),
  nama: z.string(),
  kategori: z.string(),
  harga_beli: z.number(),
  harga_jual: z.number(),
  stok: z.number().int(),
  deskripsi: z.string().nullable(), // Nullable field, not optional (can be explicitly null)
  created_at: z.coerce.date() // Automatically converts string timestamps to Date objects
});

export type Product = z.infer<typeof productSchema>;

// Input schema for creating products
export const createProductInputSchema = z.object({
  nama: z.string(),
  kategori: z.string(),
  harga_beli: z.number().positive(), // Validate that price is positive
  harga_jual: z.number().positive(), // Validate that price is positive
  stok: z.number().int().nonnegative(), // Validate that stock is non-negative integer
  deskripsi: z.string().nullable() // Explicit null allowed, undefined not allowed
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Input schema for updating products
export const updateProductInputSchema = z.object({
  id: z.number(),
  nama: z.string().optional(), // Optional = field can be undefined (omitted)
  kategori: z.string().optional(),
  harga_beli: z.number().positive().optional(),
  harga_jual: z.number().positive().optional(),
  stok: z.number().int().nonnegative().optional(),
  deskripsi: z.string().nullable().optional() // Can be null or undefined
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Input schema for deleting products (simple ID wrapper)
export const deleteProductInputSchema = z.object({
  id: z.number()
});

export type DeleteProductInput = z.infer<typeof deleteProductInputSchema>;

// Input schema for getting product by ID
export const getProductByIdInputSchema = z.object({
  id: z.number()
});

export type GetProductByIdInput = z.infer<typeof getProductByIdInputSchema>;

// Response schema for delete operations
export const deleteProductResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export type DeleteProductResponse = z.infer<typeof deleteProductResponseSchema>;
import { serial, text, pgTable, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  nama: text('nama').notNull(),
  kategori: text('kategori').notNull(),
  harga_beli: numeric('harga_beli', { precision: 10, scale: 2 }).notNull(), // Use numeric for monetary values with precision
  harga_jual: numeric('harga_jual', { precision: 10, scale: 2 }).notNull(), // Use numeric for monetary values with precision
  stok: integer('stok').notNull(), // Use integer for whole numbers
  deskripsi: text('deskripsi'), // Nullable by default, matches Zod schema
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Product = typeof productsTable.$inferSelect; // For SELECT operations
export type NewProduct = typeof productsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { products: productsTable };
import { serial, text, pgTable, timestamp, numeric, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

export const salesTable = pgTable('sales', {
  id: serial('id').primaryKey(),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  kasir: text('kasir').notNull(),
});

export const saleItemsTable = pgTable('sale_items', {
  id: serial('id').primaryKey(),
  sale_id: integer('sale_id').notNull().references(() => salesTable.id, { onDelete: 'cascade' }),
  product_id: integer('product_id').notNull().references(() => productsTable.id, { onDelete: 'cascade' }),
  qty: integer('qty').notNull(),
  harga_jual: numeric('harga_jual', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
});

// Define relations
export const salesRelations = relations(salesTable, ({ many }) => ({
  items: many(saleItemsTable),
}));

export const saleItemsRelations = relations(saleItemsTable, ({ one }) => ({
  sale: one(salesTable, {
    fields: [saleItemsTable.sale_id],
    references: [salesTable.id],
  }),
  product: one(productsTable, {
    fields: [saleItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

// TypeScript type for the table schema
export type Product = typeof productsTable.$inferSelect; // For SELECT operations
export type NewProduct = typeof productsTable.$inferInsert; // For INSERT operations

export type Sale = typeof salesTable.$inferSelect;
export type NewSale = typeof salesTable.$inferInsert;

export type SaleItem = typeof saleItemsTable.$inferSelect;
export type NewSaleItem = typeof saleItemsTable.$inferInsert;

// Important: Export all tables and relations for proper query building
export const tables = { 
  products: productsTable, 
  sales: salesTable, 
  saleItems: saleItemsTable 
};
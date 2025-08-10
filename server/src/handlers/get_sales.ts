import { db } from '../db';
import { salesTable, saleItemsTable, productsTable } from '../db/schema';
import { type SaleDetail, type SaleItemWithProductName } from '../schema';
import { desc, eq } from 'drizzle-orm';

export const getSales = async (): Promise<SaleDetail[]> => {
  try {
    // Fetch sales with their items and related product names
    const rawSalesData = await db.select({
        saleId: salesTable.id,
        tanggal: salesTable.tanggal,
        total: salesTable.total,
        kasir: salesTable.kasir,
        // Sale Item details
        itemId: saleItemsTable.id,
        itemProductId: saleItemsTable.product_id,
        itemQty: saleItemsTable.qty,
        itemHargaJual: saleItemsTable.harga_jual,
        itemSubtotal: saleItemsTable.subtotal,
        // Product details for the item
        productNama: productsTable.nama,
    })
    .from(salesTable)
    .leftJoin(saleItemsTable, eq(salesTable.id, saleItemsTable.sale_id))
    .leftJoin(productsTable, eq(saleItemsTable.product_id, productsTable.id))
    .orderBy(desc(salesTable.tanggal)) // Order by date descending
    .execute();

    const salesMap = new Map<number, SaleDetail>();

    for (const row of rawSalesData) {
      const saleId = row.saleId;
      let sale = salesMap.get(saleId);

      if (!sale) {
        sale = {
          id: saleId,
          tanggal: row.tanggal, // Already Date object from Drizzle
          total: parseFloat(row.total), // Convert numeric string to number
          kasir: row.kasir,
          items: [],
        };
        salesMap.set(saleId, sale);
      }

      if (row.itemId && row.itemProductId && row.itemQty !== null && row.itemHargaJual && row.itemSubtotal && row.productNama) { 
        // Only add item if all required fields exist (for sales with items from leftJoin)
        const item: SaleItemWithProductName = {
          product_id: row.itemProductId,
          qty: row.itemQty,
          harga_jual: parseFloat(row.itemHargaJual), // Convert numeric string to number
          subtotal: parseFloat(row.itemSubtotal),   // Convert numeric string to number
          nama_produk: row.productNama,
        };
        sale.items.push(item);
      }
    }

    // Convert map values back to an array
    return Array.from(salesMap.values());
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    throw error;
  }
};
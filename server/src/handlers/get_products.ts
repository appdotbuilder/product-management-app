import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { desc } from 'drizzle-orm';

export const getProducts = async (): Promise<Product[]> => {
  try {
    // Query all products ordered by creation time (newest first)
    const results = await db.select()
      .from(productsTable)
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers for all products
    return results.map(product => ({
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string back to number
      harga_jual: parseFloat(product.harga_jual) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};
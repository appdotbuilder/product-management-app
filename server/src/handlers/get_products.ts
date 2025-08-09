import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';

export const getProducts = async (): Promise<Product[]> => {
  try {
    // Select all products from the database
    const results = await db.select()
      .from(productsTable)
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string back to number
      harga_jual: parseFloat(product.harga_jual)  // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};
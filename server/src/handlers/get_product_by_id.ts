import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductByIdInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const getProductById = async (input: GetProductByIdInput): Promise<Product | null> => {
  const { id } = input;
  try {
    // Query product by ID
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const product = results[0];
    return {
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string back to number
      harga_jual: parseFloat(product.harga_jual) // Convert string back to number
    };
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    throw error;
  }
};
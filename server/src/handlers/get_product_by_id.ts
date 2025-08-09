import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductByIdInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export async function getProductById(input: GetProductByIdInput): Promise<Product | null> {
  try {
    // Query product by ID
    const result = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    // Return null if product not found
    if (result.length === 0) {
      return null;
    }

    const product = result[0];
    
    // Convert numeric fields back to numbers before returning
    return {
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string to number
      harga_jual: parseFloat(product.harga_jual)  // Convert string to number
    };
  } catch (error) {
    console.error('Failed to get product by ID:', error);
    throw error;
  }
}
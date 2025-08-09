import { db } from '../db';
import { productsTable } from '../db/schema';
import { type DeleteProductInput, type DeleteProductResponse } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProduct = async (input: DeleteProductInput): Promise<DeleteProductResponse> => {
  const { id } = input;
  try {
    // First, check if the product exists
    const existingProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .execute();

    if (existingProduct.length === 0) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }

    // Delete the product
    const results = await db.delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning({ id: productsTable.id })
      .execute();

    if (results.length > 0) {
      return {
        success: true,
        message: `Product with ID ${id} deleted successfully`
      };
    } else {
      return {
        success: false,
        message: `Failed to delete product with ID ${id}`
      };
    }
  } catch (error) {
    console.error('Product deletion failed:', error);
    throw error;
  }
};
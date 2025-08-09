import { db } from '../db';
import { productsTable } from '../db/schema';
import { type DeleteProductInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProduct = async (input: DeleteProductInput): Promise<{ success: boolean; message: string }> => {
  try {
    // First, check if the product exists
    const existingProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    if (existingProduct.length === 0) {
      return {
        success: false,
        message: `Product with ID ${input.id} not found`
      };
    }

    // Delete the product
    const result = await db.delete(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    return {
      success: true,
      message: `Product with ID ${input.id} deleted successfully`
    };
  } catch (error) {
    console.error('Product deletion failed:', error);
    throw error;
  }
};
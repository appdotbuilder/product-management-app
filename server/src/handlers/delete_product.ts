import { db } from '../db';
import { productsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteProductInput, type DeleteProductResponse } from '../schema';

export const deleteProduct = async (input: DeleteProductInput): Promise<DeleteProductResponse> => {
  try {
    const result = await db.delete(productsTable)
      .where(eq(productsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return {
        success: false,
        message: `Product with ID ${input.id} not found`
      };
    }

    return {
      success: true,
      message: `Product with ID ${input.id} deleted successfully`
    };
  } catch (error) {
    console.error('Product deletion failed:', error);
    throw error;
  }
};
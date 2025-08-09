import { db } from '../db';
import { productsTable } from '../db/schema';
import { type UpdateProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProduct = async (input: UpdateProductInput): Promise<Product> => {
  try {
    // First, check if the product exists
    const existingProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.id))
      .execute();

    if (existingProduct.length === 0) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (input.nama !== undefined) {
      updateData.nama = input.nama;
    }
    if (input.kategori !== undefined) {
      updateData.kategori = input.kategori;
    }
    if (input.harga_beli !== undefined) {
      updateData.harga_beli = input.harga_beli.toString(); // Convert number to string for numeric column
    }
    if (input.harga_jual !== undefined) {
      updateData.harga_jual = input.harga_jual.toString(); // Convert number to string for numeric column
    }
    if (input.stok !== undefined) {
      updateData.stok = input.stok; // Integer column - no conversion needed
    }
    if (input.deskripsi !== undefined) {
      updateData.deskripsi = input.deskripsi; // Can be null or string
    }

    // Update the product
    const result = await db.update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string back to number
      harga_jual: parseFloat(product.harga_jual)  // Convert string back to number
    };
  } catch (error) {
    console.error('Product update failed:', error);
    throw error;
  }
};
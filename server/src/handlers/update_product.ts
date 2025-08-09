import { db } from '../db';
import { productsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateProductInput, type Product } from '../schema';

export const updateProduct = async (input: UpdateProductInput): Promise<Product> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.nama !== undefined) updateData.nama = input.nama;
    if (input.kategori !== undefined) updateData.kategori = input.kategori;
    if (input.harga_beli !== undefined) updateData.harga_beli = input.harga_beli.toString();
    if (input.harga_jual !== undefined) updateData.harga_jual = input.harga_jual.toString();
    if (input.stok !== undefined) updateData.stok = input.stok;
    if (input.deskripsi !== undefined) updateData.deskripsi = input.deskripsi;

    // Update product record
    const result = await db.update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string back to number
      harga_jual: parseFloat(product.harga_jual) // Convert string back to number
    };
  } catch (error) {
    console.error('Product update failed:', error);
    throw error;
  }
};
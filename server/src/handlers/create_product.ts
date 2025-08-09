import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput, type Product } from '../schema';

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  try {
    // Insert product record
    const result = await db.insert(productsTable)
      .values({
        nama: input.nama,
        kategori: input.kategori,
        harga_beli: input.harga_beli.toString(), // Convert number to string for numeric column
        harga_jual: input.harga_jual.toString(), // Convert number to string for numeric column
        stok: input.stok, // Integer column - no conversion needed
        deskripsi: input.deskripsi // Can be null
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      harga_beli: parseFloat(product.harga_beli), // Convert string back to number
      harga_jual: parseFloat(product.harga_jual) // Convert string back to number
    };
  } catch (error) {
    console.error('Product creation failed:', error);
    throw error;
  }
};
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type DeleteProductInput, type CreateProductInput } from '../schema';
import { deleteProduct } from '../handlers/delete_product';
import { eq } from 'drizzle-orm';

// Test product data for setup
const testProductData: CreateProductInput = {
  nama: 'Test Product',
  kategori: 'Electronics',
  harga_beli: 100.00,
  harga_jual: 150.00,
  stok: 50,
  deskripsi: 'A test product for deletion'
};

// Helper function to create a test product
const createTestProduct = async (): Promise<number> => {
  const result = await db.insert(productsTable)
    .values({
      nama: testProductData.nama,
      kategori: testProductData.kategori,
      harga_beli: testProductData.harga_beli.toString(),
      harga_jual: testProductData.harga_jual.toString(),
      stok: testProductData.stok,
      deskripsi: testProductData.deskripsi
    })
    .returning({ id: productsTable.id })
    .execute();

  return result[0].id;
};

describe('deleteProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing product', async () => {
    // Create a test product first
    const productId = await createTestProduct();

    const input: DeleteProductInput = { id: productId };
    const result = await deleteProduct(input);

    // Verify the response
    expect(result.success).toBe(true);
    expect(result.message).toBe(`Product with ID ${productId} deleted successfully`);

    // Verify the product is actually deleted from database
    const deletedProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(deletedProduct).toHaveLength(0);
  });

  it('should return failure when trying to delete non-existent product', async () => {
    const nonExistentId = 99999;
    const input: DeleteProductInput = { id: nonExistentId };
    
    const result = await deleteProduct(input);

    // Verify the response indicates failure
    expect(result.success).toBe(false);
    expect(result.message).toBe(`Product with ID ${nonExistentId} not found`);
  });

  it('should not affect other products when deleting one product', async () => {
    // Create multiple test products
    const productId1 = await createTestProduct();
    
    const product2Data = {
      ...testProductData,
      nama: 'Second Test Product'
    };
    const result2 = await db.insert(productsTable)
      .values({
        nama: product2Data.nama,
        kategori: product2Data.kategori,
        harga_beli: product2Data.harga_beli.toString(),
        harga_jual: product2Data.harga_jual.toString(),
        stok: product2Data.stok,
        deskripsi: product2Data.deskripsi
      })
      .returning({ id: productsTable.id })
      .execute();
    const productId2 = result2[0].id;

    // Delete only the first product
    const input: DeleteProductInput = { id: productId1 };
    const deleteResult = await deleteProduct(input);

    // Verify deletion was successful
    expect(deleteResult.success).toBe(true);

    // Verify first product is deleted
    const deletedProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId1))
      .execute();
    expect(deletedProduct).toHaveLength(0);

    // Verify second product still exists
    const remainingProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId2))
      .execute();
    expect(remainingProduct).toHaveLength(1);
    expect(remainingProduct[0].nama).toBe('Second Test Product');
  });

  it('should handle deletion of product with different data types correctly', async () => {
    // Create a product with edge case data
    const edgeCaseProduct = await db.insert(productsTable)
      .values({
        nama: 'Edge Case Product',
        kategori: 'Special',
        harga_beli: '0.01', // Minimum price
        harga_jual: '999999.99', // Large price
        stok: 0, // Zero stock
        deskripsi: null // Null description
      })
      .returning({ id: productsTable.id })
      .execute();

    const productId = edgeCaseProduct[0].id;
    const input: DeleteProductInput = { id: productId };
    
    const result = await deleteProduct(input);

    // Verify successful deletion
    expect(result.success).toBe(true);
    expect(result.message).toBe(`Product with ID ${productId} deleted successfully`);

    // Verify product is removed from database
    const deletedProduct = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();
    expect(deletedProduct).toHaveLength(0);
  });

  it('should work with zero as a valid product ID', async () => {
    // Note: This tests the edge case where ID might be 0
    // In practice, serial IDs usually start from 1, but this tests the logic
    const input: DeleteProductInput = { id: 0 };
    
    const result = await deleteProduct(input);

    // Should return not found since ID 0 doesn't exist
    expect(result.success).toBe(false);
    expect(result.message).toBe('Product with ID 0 not found');
  });
});
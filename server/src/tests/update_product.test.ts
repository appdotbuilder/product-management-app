import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput, type UpdateProductInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

// Helper to create a test product in the database
const createTestProduct = async (): Promise<number> => {
  const result = await db.insert(productsTable)
    .values({
      nama: 'Original Product',
      kategori: 'Original Category',
      harga_beli: '10.50',
      harga_jual: '15.75',
      stok: 50,
      deskripsi: 'Original description'
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a product', async () => {
    const productId = await createTestProduct();

    const updateInput: UpdateProductInput = {
      id: productId,
      nama: 'Updated Product',
      kategori: 'Updated Category',
      harga_beli: 12.00,
      harga_jual: 18.50,
      stok: 75,
      deskripsi: 'Updated description'
    };

    const result = await updateProduct(updateInput);

    // Verify all fields are updated correctly
    expect(result.id).toEqual(productId);
    expect(result.nama).toEqual('Updated Product');
    expect(result.kategori).toEqual('Updated Category');
    expect(result.harga_beli).toEqual(12.00);
    expect(typeof result.harga_beli).toBe('number');
    expect(result.harga_jual).toEqual(18.50);
    expect(typeof result.harga_jual).toBe('number');
    expect(result.stok).toEqual(75);
    expect(result.deskripsi).toEqual('Updated description');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const productId = await createTestProduct();

    // Update only nama and harga_jual
    const updateInput: UpdateProductInput = {
      id: productId,
      nama: 'Partially Updated Product',
      harga_jual: 20.00
    };

    const result = await updateProduct(updateInput);

    // Verify only specified fields are updated
    expect(result.nama).toEqual('Partially Updated Product');
    expect(result.harga_jual).toEqual(20.00);
    expect(typeof result.harga_jual).toBe('number');
    
    // Verify other fields remain unchanged
    expect(result.kategori).toEqual('Original Category');
    expect(result.harga_beli).toEqual(10.50);
    expect(result.stok).toEqual(50);
    expect(result.deskripsi).toEqual('Original description');
  });

  it('should update deskripsi to null', async () => {
    const productId = await createTestProduct();

    const updateInput: UpdateProductInput = {
      id: productId,
      deskripsi: null
    };

    const result = await updateProduct(updateInput);

    expect(result.deskripsi).toBeNull();
    // Verify other fields remain unchanged
    expect(result.nama).toEqual('Original Product');
    expect(result.kategori).toEqual('Original Category');
  });

  it('should persist changes to database', async () => {
    const productId = await createTestProduct();

    const updateInput: UpdateProductInput = {
      id: productId,
      nama: 'Database Test Product',
      harga_beli: 25.99,
      stok: 100
    };

    await updateProduct(updateInput);

    // Query database directly to verify changes are persisted
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(products).toHaveLength(1);
    const product = products[0];
    expect(product.nama).toEqual('Database Test Product');
    expect(parseFloat(product.harga_beli)).toEqual(25.99);
    expect(product.stok).toEqual(100);
    // Verify unchanged fields
    expect(product.kategori).toEqual('Original Category');
    expect(parseFloat(product.harga_jual)).toEqual(15.75);
  });

  it('should throw error when product does not exist', async () => {
    const nonExistentId = 99999;

    const updateInput: UpdateProductInput = {
      id: nonExistentId,
      nama: 'This should fail'
    };

    await expect(updateProduct(updateInput)).rejects.toThrow(/Product with id 99999 not found/);
  });

  it('should handle numeric precision correctly', async () => {
    const productId = await createTestProduct();

    const updateInput: UpdateProductInput = {
      id: productId,
      harga_beli: 123.456789, // High precision number
      harga_jual: 99.99
    };

    const result = await updateProduct(updateInput);

    // Verify numeric conversion maintains precision within database limits
    expect(typeof result.harga_beli).toBe('number');
    expect(typeof result.harga_jual).toBe('number');
    expect(result.harga_beli).toBeCloseTo(123.46, 2); // Database precision is 2 decimal places
    expect(result.harga_jual).toEqual(99.99);
  });

  it('should update with minimum values', async () => {
    const productId = await createTestProduct();

    const updateInput: UpdateProductInput = {
      id: productId,
      harga_beli: 0.01, // Minimum positive value
      harga_jual: 0.01,
      stok: 0 // Minimum stock value
    };

    const result = await updateProduct(updateInput);

    expect(result.harga_beli).toEqual(0.01);
    expect(result.harga_jual).toEqual(0.01);
    expect(result.stok).toEqual(0);
  });
});
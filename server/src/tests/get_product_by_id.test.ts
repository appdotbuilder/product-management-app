import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductByIdInput, type CreateProductInput } from '../schema';
import { getProductById } from '../handlers/get_product_by_id';

// Test data for creating a product
const testProductInput: CreateProductInput = {
  nama: 'Test Product',
  kategori: 'Electronics',
  harga_beli: 100.50,
  harga_jual: 150.75,
  stok: 25,
  deskripsi: 'A test product for validation'
};

// Test data for creating a product with null description
const testProductWithNullDesc: CreateProductInput = {
  nama: 'Product Without Description',
  kategori: 'Books',
  harga_beli: 25.00,
  harga_jual: 40.00,
  stok: 10,
  deskripsi: null
};

describe('getProductById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return product when found', async () => {
    // Create a product first
    const insertResult = await db.insert(productsTable)
      .values({
        nama: testProductInput.nama,
        kategori: testProductInput.kategori,
        harga_beli: testProductInput.harga_beli.toString(),
        harga_jual: testProductInput.harga_jual.toString(),
        stok: testProductInput.stok,
        deskripsi: testProductInput.deskripsi
      })
      .returning()
      .execute();

    const createdProduct = insertResult[0];
    
    // Get product by ID
    const input: GetProductByIdInput = { id: createdProduct.id };
    const result = await getProductById(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProduct.id);
    expect(result!.nama).toEqual('Test Product');
    expect(result!.kategori).toEqual('Electronics');
    expect(result!.harga_beli).toEqual(100.50);
    expect(result!.harga_jual).toEqual(150.75);
    expect(result!.stok).toEqual(25);
    expect(result!.deskripsi).toEqual('A test product for validation');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should handle numeric conversions correctly', async () => {
    // Create a product with specific decimal values
    const insertResult = await db.insert(productsTable)
      .values({
        nama: testProductInput.nama,
        kategori: testProductInput.kategori,
        harga_beli: testProductInput.harga_beli.toString(),
        harga_jual: testProductInput.harga_jual.toString(),
        stok: testProductInput.stok,
        deskripsi: testProductInput.deskripsi
      })
      .returning()
      .execute();

    const createdProduct = insertResult[0];
    
    // Get product by ID
    const input: GetProductByIdInput = { id: createdProduct.id };
    const result = await getProductById(input);

    // Verify numeric types are correctly converted
    expect(result).not.toBeNull();
    expect(typeof result!.harga_beli).toBe('number');
    expect(typeof result!.harga_jual).toBe('number');
    expect(typeof result!.stok).toBe('number');
    expect(result!.harga_beli).toEqual(100.50);
    expect(result!.harga_jual).toEqual(150.75);
  });

  it('should return null when product not found', async () => {
    // Try to get a product that doesn't exist
    const input: GetProductByIdInput = { id: 999 };
    const result = await getProductById(input);

    expect(result).toBeNull();
  });

  it('should handle products with null description', async () => {
    // Create a product with null description
    const insertResult = await db.insert(productsTable)
      .values({
        nama: testProductWithNullDesc.nama,
        kategori: testProductWithNullDesc.kategori,
        harga_beli: testProductWithNullDesc.harga_beli.toString(),
        harga_jual: testProductWithNullDesc.harga_jual.toString(),
        stok: testProductWithNullDesc.stok,
        deskripsi: testProductWithNullDesc.deskripsi
      })
      .returning()
      .execute();

    const createdProduct = insertResult[0];
    
    // Get product by ID
    const input: GetProductByIdInput = { id: createdProduct.id };
    const result = await getProductById(input);

    // Verify null description is handled correctly
    expect(result).not.toBeNull();
    expect(result!.nama).toEqual('Product Without Description');
    expect(result!.deskripsi).toBeNull();
    expect(result!.harga_beli).toEqual(25.00);
    expect(result!.harga_jual).toEqual(40.00);
  });

  it('should retrieve product from database correctly', async () => {
    // Create a product
    const insertResult = await db.insert(productsTable)
      .values({
        nama: testProductInput.nama,
        kategori: testProductInput.kategori,
        harga_beli: testProductInput.harga_beli.toString(),
        harga_jual: testProductInput.harga_jual.toString(),
        stok: testProductInput.stok,
        deskripsi: testProductInput.deskripsi
      })
      .returning()
      .execute();

    const createdProduct = insertResult[0];
    
    // Get product using handler
    const input: GetProductByIdInput = { id: createdProduct.id };
    const result = await getProductById(input);

    // Verify database retrieval
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProduct.id);
    expect(result!.created_at).toBeInstanceOf(Date);
    
    // Verify all fields match the created product
    expect(result!.nama).toEqual(testProductInput.nama);
    expect(result!.kategori).toEqual(testProductInput.kategori);
    expect(result!.stok).toEqual(testProductInput.stok);
    expect(result!.deskripsi).toEqual(testProductInput.deskripsi);
  });
});
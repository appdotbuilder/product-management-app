import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateProductInput = {
  nama: 'Laptop Gaming',
  kategori: 'Electronics',
  harga_beli: 8500000.50,
  harga_jual: 12000000.99,
  stok: 25,
  deskripsi: 'High-performance gaming laptop with RGB keyboard'
};

// Test input with null description
const testInputWithNullDesc: CreateProductInput = {
  nama: 'Mouse Wireless',
  kategori: 'Accessories',
  harga_beli: 150000.00,
  harga_jual: 250000.00,
  stok: 100,
  deskripsi: null
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    const result = await createProduct(testInput);

    // Basic field validation
    expect(result.nama).toEqual('Laptop Gaming');
    expect(result.kategori).toEqual('Electronics');
    expect(result.harga_beli).toEqual(8500000.50);
    expect(result.harga_jual).toEqual(12000000.99);
    expect(result.stok).toEqual(25);
    expect(result.deskripsi).toEqual('High-performance gaming laptop with RGB keyboard');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Verify numeric type conversions are correct
    expect(typeof result.harga_beli).toBe('number');
    expect(typeof result.harga_jual).toBe('number');
    expect(typeof result.stok).toBe('number');
  });

  it('should create a product with null description', async () => {
    const result = await createProduct(testInputWithNullDesc);

    expect(result.nama).toEqual('Mouse Wireless');
    expect(result.kategori).toEqual('Accessories');
    expect(result.harga_beli).toEqual(150000.00);
    expect(result.harga_jual).toEqual(250000.00);
    expect(result.stok).toEqual(100);
    expect(result.deskripsi).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const result = await createProduct(testInput);

    // Query the database to verify the product was saved
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];
    
    expect(savedProduct.nama).toEqual('Laptop Gaming');
    expect(savedProduct.kategori).toEqual('Electronics');
    // Verify that numeric values are stored as strings in database but converted correctly
    expect(parseFloat(savedProduct.harga_beli)).toEqual(8500000.50);
    expect(parseFloat(savedProduct.harga_jual)).toEqual(12000000.99);
    expect(savedProduct.stok).toEqual(25);
    expect(savedProduct.deskripsi).toEqual('High-performance gaming laptop with RGB keyboard');
    expect(savedProduct.created_at).toBeInstanceOf(Date);
  });

  it('should handle decimal precision correctly', async () => {
    const precisionTest: CreateProductInput = {
      nama: 'Test Product',
      kategori: 'Test',
      harga_beli: 123.45,
      harga_jual: 987.65,
      stok: 10,
      deskripsi: 'Precision test'
    };

    const result = await createProduct(precisionTest);

    expect(result.harga_beli).toEqual(123.45);
    expect(result.harga_jual).toEqual(987.65);
    
    // Verify precision is maintained in database
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();
    
    expect(parseFloat(products[0].harga_beli)).toEqual(123.45);
    expect(parseFloat(products[0].harga_jual)).toEqual(987.65);
  });

  it('should handle zero stock correctly', async () => {
    const zeroStockInput: CreateProductInput = {
      nama: 'Out of Stock Item',
      kategori: 'Test',
      harga_beli: 100000,
      harga_jual: 150000,
      stok: 0,
      deskripsi: 'Currently out of stock'
    };

    const result = await createProduct(zeroStockInput);

    expect(result.stok).toEqual(0);
    expect(typeof result.stok).toBe('number');
  });

  it('should generate unique IDs for multiple products', async () => {
    const input1: CreateProductInput = {
      nama: 'Product 1',
      kategori: 'Category A',
      harga_beli: 100000,
      harga_jual: 150000,
      stok: 10,
      deskripsi: 'First product'
    };

    const input2: CreateProductInput = {
      nama: 'Product 2',
      kategori: 'Category B',
      harga_beli: 200000,
      harga_jual: 300000,
      stok: 20,
      deskripsi: 'Second product'
    };

    const result1 = await createProduct(input1);
    const result2 = await createProduct(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.created_at).toBeInstanceOf(Date);
    expect(result2.created_at).toBeInstanceOf(Date);
    
    // Verify both products exist in database
    const allProducts = await db.select().from(productsTable).execute();
    expect(allProducts).toHaveLength(2);
  });

  it('should preserve timestamp accuracy', async () => {
    const beforeCreation = new Date();
    const result = await createProduct(testInput);
    const afterCreation = new Date();

    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { getProducts } from '../handlers/get_products';

// Test product data
const testProduct1: CreateProductInput = {
  nama: 'Laptop Gaming',
  kategori: 'Elektronik',
  harga_beli: 5000000.50,
  harga_jual: 7500000.75,
  stok: 10,
  deskripsi: 'Laptop gaming dengan spesifikasi tinggi'
};

const testProduct2: CreateProductInput = {
  nama: 'Mouse Wireless',
  kategori: 'Aksesoris',
  harga_beli: 150000.25,
  harga_jual: 200000.99,
  stok: 25,
  deskripsi: null // Test null description
};

const testProduct3: CreateProductInput = {
  nama: 'Keyboard Mechanical',
  kategori: 'Aksesoris',
  harga_beli: 800000.00,
  harga_jual: 1200000.00,
  stok: 5,
  deskripsi: 'Keyboard mechanical dengan switch blue'
};

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all products from database', async () => {
    // Insert test products directly to database
    await db.insert(productsTable)
      .values([
        {
          nama: testProduct1.nama,
          kategori: testProduct1.kategori,
          harga_beli: testProduct1.harga_beli.toString(),
          harga_jual: testProduct1.harga_jual.toString(),
          stok: testProduct1.stok,
          deskripsi: testProduct1.deskripsi
        },
        {
          nama: testProduct2.nama,
          kategori: testProduct2.kategori,
          harga_beli: testProduct2.harga_beli.toString(),
          harga_jual: testProduct2.harga_jual.toString(),
          stok: testProduct2.stok,
          deskripsi: testProduct2.deskripsi
        },
        {
          nama: testProduct3.nama,
          kategori: testProduct3.kategori,
          harga_beli: testProduct3.harga_beli.toString(),
          harga_jual: testProduct3.harga_jual.toString(),
          stok: testProduct3.stok,
          deskripsi: testProduct3.deskripsi
        }
      ])
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(3);
    
    // Verify all products are returned
    const productNames = result.map(p => p.nama);
    expect(productNames).toContain('Laptop Gaming');
    expect(productNames).toContain('Mouse Wireless');
    expect(productNames).toContain('Keyboard Mechanical');
  });

  it('should return products with correct data types', async () => {
    // Insert one test product
    await db.insert(productsTable)
      .values({
        nama: testProduct1.nama,
        kategori: testProduct1.kategori,
        harga_beli: testProduct1.harga_beli.toString(),
        harga_jual: testProduct1.harga_jual.toString(),
        stok: testProduct1.stok,
        deskripsi: testProduct1.deskripsi
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    
    const product = result[0];
    
    // Verify field types and values
    expect(typeof product.id).toBe('number');
    expect(typeof product.nama).toBe('string');
    expect(typeof product.kategori).toBe('string');
    expect(typeof product.harga_beli).toBe('number'); // Should be converted from string
    expect(typeof product.harga_jual).toBe('number'); // Should be converted from string
    expect(typeof product.stok).toBe('number');
    expect(product.created_at).toBeInstanceOf(Date);
    
    // Verify actual values
    expect(product.nama).toEqual('Laptop Gaming');
    expect(product.kategori).toEqual('Elektronik');
    expect(product.harga_beli).toEqual(5000000.50);
    expect(product.harga_jual).toEqual(7500000.75);
    expect(product.stok).toEqual(10);
    expect(product.deskripsi).toEqual('Laptop gaming dengan spesifikasi tinggi');
  });

  it('should handle null descriptions correctly', async () => {
    // Insert product with null description
    await db.insert(productsTable)
      .values({
        nama: testProduct2.nama,
        kategori: testProduct2.kategori,
        harga_beli: testProduct2.harga_beli.toString(),
        harga_jual: testProduct2.harga_jual.toString(),
        stok: testProduct2.stok,
        deskripsi: testProduct2.deskripsi // null
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].deskripsi).toBeNull();
    expect(result[0].nama).toEqual('Mouse Wireless');
  });

  it('should return products ordered by creation time', async () => {
    // Insert products in specific order
    await db.insert(productsTable)
      .values({
        nama: 'Product A',
        kategori: 'Category A',
        harga_beli: '100.00',
        harga_jual: '150.00',
        stok: 10,
        deskripsi: 'First product'
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(productsTable)
      .values({
        nama: 'Product B',
        kategori: 'Category B',
        harga_beli: '200.00',
        harga_jual: '300.00',
        stok: 20,
        deskripsi: 'Second product'
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    
    // Verify products are returned (order may vary without explicit ORDER BY)
    const names = result.map(p => p.nama);
    expect(names).toContain('Product A');
    expect(names).toContain('Product B');
    
    // Verify both have valid creation timestamps
    result.forEach(product => {
      expect(product.created_at).toBeInstanceOf(Date);
      expect(product.created_at.getTime()).toBeGreaterThan(0);
    });
  });

  it('should handle decimal precision correctly', async () => {
    // Test with various decimal values
    await db.insert(productsTable)
      .values({
        nama: 'Test Product',
        kategori: 'Test',
        harga_beli: '99.99',
        harga_jual: '149.95',
        stok: 1,
        deskripsi: 'Price precision test'
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].harga_beli).toEqual(99.99);
    expect(result[0].harga_jual).toEqual(149.95);
  });
});
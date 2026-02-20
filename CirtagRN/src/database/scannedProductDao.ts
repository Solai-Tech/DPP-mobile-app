import { getDatabaseSync } from './database';
import { ScannedProduct } from '../types/ScannedProduct';

export async function getAllProducts(): Promise<ScannedProduct[]> {
  const db = getDatabaseSync();
  return db.getAllSync<ScannedProduct>(
    'SELECT * FROM scanned_products ORDER BY scannedAt DESC'
  );
}

export async function getProductById(id: number): Promise<ScannedProduct | null> {
  const db = getDatabaseSync();
  return db.getFirstSync<ScannedProduct>('SELECT * FROM scanned_products WHERE id = ?', [id]);
}

export async function insertProduct(product: Omit<ScannedProduct, 'id'>): Promise<number> {
  const db = getDatabaseSync();
  const result = db.runSync(
    `INSERT INTO scanned_products (
      rawValue, displayValue, format, type, productName, productDescription,
      imageUrl, productId, price, supplier, skuId, weight,
      co2Total, co2Details, certifications, datasheetUrl, scannedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.rawValue,
      product.displayValue,
      product.format,
      product.type,
      product.productName,
      product.productDescription,
      product.imageUrl,
      product.productId,
      product.price,
      product.supplier,
      product.skuId,
      product.weight,
      product.co2Total,
      product.co2Details,
      product.certifications,
      product.datasheetUrl,
      product.scannedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('DELETE FROM scanned_products WHERE id = ?', [id]);
}

export async function deleteAllProducts(): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('DELETE FROM scanned_products');
}

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

export async function getProductByRawValue(rawValue: string): Promise<ScannedProduct | null> {
  const db = getDatabaseSync();
  return db.getFirstSync<ScannedProduct>('SELECT * FROM scanned_products WHERE rawValue = ?', [rawValue]);
}

export async function insertProduct(product: Omit<ScannedProduct, 'id'>): Promise<number> {
  const db = getDatabaseSync();
  const result = db.runSync(
    `INSERT INTO scanned_products (
      rawValue, displayValue, format, type, productName, productDescription,
      imageUrl, productId, price, supplier, skuId, weight,
      co2Total, co2Details, certifications, datasheetUrl, documents, scannedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      product.documents,
      product.scannedAt,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateProductName(id: number, name: string): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('UPDATE scanned_products SET productName = ? WHERE id = ?', [name, id]);
}

export async function updateProductCO2(id: number, co2Total: string, co2Details: string): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('UPDATE scanned_products SET co2Total = ?, co2Details = ? WHERE id = ?', [co2Total, co2Details, id]);
}

export async function updateProductDocuments(id: number, documents: string): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('UPDATE scanned_products SET documents = ? WHERE id = ?', [documents, id]);
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('DELETE FROM scanned_products WHERE id = ?', [id]);
}

export async function deleteAllProducts(): Promise<void> {
  const db = getDatabaseSync();
  db.runSync('DELETE FROM scanned_products');
}

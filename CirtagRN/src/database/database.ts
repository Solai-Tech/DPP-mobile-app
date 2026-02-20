import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cirtag_database';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (db) return db;
  db = SQLite.openDatabaseSync(DB_NAME);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS scanned_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rawValue TEXT NOT NULL,
      displayValue TEXT NOT NULL,
      format TEXT NOT NULL,
      type TEXT NOT NULL,
      productName TEXT NOT NULL DEFAULT '',
      productDescription TEXT NOT NULL DEFAULT '',
      imageUrl TEXT NOT NULL DEFAULT '',
      productId TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL DEFAULT '',
      supplier TEXT NOT NULL DEFAULT '',
      skuId TEXT NOT NULL DEFAULT '',
      weight TEXT NOT NULL DEFAULT '',
      co2Total TEXT NOT NULL DEFAULT '',
      co2Details TEXT NOT NULL DEFAULT '',
      certifications TEXT NOT NULL DEFAULT '',
      datasheetUrl TEXT NOT NULL DEFAULT '',
      scannedAt INTEGER NOT NULL
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      productId INTEGER,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketId INTEGER,
      message TEXT NOT NULL,
      sender TEXT NOT NULL DEFAULT 'user',
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (ticketId) REFERENCES tickets(id)
    );
  `);
  return db;
}

// Keep async wrapper for backward compatibility with existing DAOs
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return getDatabaseSync();
}

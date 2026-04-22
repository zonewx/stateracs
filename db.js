const path = require('path');
let Database;
try { Database = require('better-sqlite3'); } catch(e) { Database = null; }

let db = null;

function initDB(dataDir) {
  if (!Database) {
    console.warn('[db] better-sqlite3 not installed — CS features disabled');
    return null;
  }
  const dbPath = path.join(dataDir, 'skins.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS cs_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skin_name TEXT NOT NULL,
      exterior TEXT,
      float_value REAL,
      pattern INTEGER,
      stickers TEXT,
      purchase_price REAL NOT NULL DEFAULT 0,
      purchase_currency TEXT NOT NULL DEFAULT 'SEK',
      purchase_date TEXT NOT NULL,
      notes TEXT,
      steam_asset_id TEXT,
      image_url TEXT,
      sold INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cs_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_id INTEGER NOT NULL REFERENCES cs_inventory(id) ON DELETE CASCADE,
      sale_price REAL NOT NULL,
      sale_currency TEXT NOT NULL DEFAULT 'SEK',
      sale_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cs_price_cache (
      skin_name TEXT PRIMARY KEY,
      price_usd REAL,
      price_sek REAL,
      last_updated TEXT
    );

    CREATE TABLE IF NOT EXISTS cs_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('[db] SQLite database ready at', dbPath);
  return db;
}

function getDB() { return db; }

module.exports = { initDB, getDB };

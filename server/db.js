import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'exchange_rates.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    base_code TEXT NOT NULL,
    jpy_rate REAL NOT NULL,
    usd_per_jpy REAL NOT NULL,
    last_updated TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  )
`);

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export function getCachedRate() {
  const row = db.prepare('SELECT * FROM exchange_rates WHERE id = 1').get();
  if (!row) return null;

  const age = Date.now() - row.fetched_at;
  if (age > TWELVE_HOURS_MS) return null;

  return {
    baseCode: row.base_code,
    jpyRate: row.jpy_rate,
    usdPerJpy: row.usd_per_jpy,
    lastUpdated: row.last_updated,
    fetchedAt: row.fetched_at,
    cached: true,
    cacheAgeMinutes: Math.round(age / 60000),
  };
}

export function setCachedRate(data) {
  const stmt = db.prepare(`
    INSERT INTO exchange_rates (id, base_code, jpy_rate, usd_per_jpy, last_updated, fetched_at)
    VALUES (1, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      base_code = excluded.base_code,
      jpy_rate = excluded.jpy_rate,
      usd_per_jpy = excluded.usd_per_jpy,
      last_updated = excluded.last_updated,
      fetched_at = excluded.fetched_at
  `);

  stmt.run(
    data.baseCode,
    data.jpyRate,
    data.usdPerJpy,
    data.lastUpdated,
    Date.now()
  );
}

export function getLastCachedRate() {
  return db.prepare('SELECT * FROM exchange_rates WHERE id = 1').get();
}

export default db;

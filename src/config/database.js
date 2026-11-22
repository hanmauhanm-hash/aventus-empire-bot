import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
const candidateDirs = [
  path.resolve(process.cwd(), 'data'),
  path.resolve(__dirname, '../../data'),
  path.join(os.tmpdir(), 'aventus_data')
];

let selectedPath = null;

for (const dir of candidateDirs) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const testDbPath = path.join(dir, 'aventus.sqlite');
    const testDb = new Database(testDbPath);
    try {
      testDb.pragma('journal_mode = DELETE');
    } catch (e) {
      // pragma failure ignored
    }
    testDb.exec('SELECT 1;');
    db = testDb;
    selectedPath = testDbPath;
    console.log(`[Database] Successfully connected to SQLite at: ${selectedPath}`);
    break;
  } catch (err) {
    console.warn(`[Database Warning] Could not open SQLite in ${dir}: ${err.message}. Trying next location...`);
  }
}

if (!db) {
  console.warn('[Database Fallback] Using in-memory SQLite database.');
  db = new Database(':memory:');
}

// Initialize database schemas
try {
  db.exec(`
    -- Guild Configuration
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      welcome_channel_id TEXT,
      leave_channel_id TEXT,
      autorole_id TEXT,
      ai_channel_id TEXT,
      welcome_message TEXT,
      leave_message TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User Economy & OwO Stats
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      gold INTEGER DEFAULT 250,
      bank INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      hunt_count INTEGER DEFAULT 0,
      daily_streak INTEGER DEFAULT 0,
      last_daily INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- OwO Zoo & Inventory
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      item_id TEXT,
      name TEXT,
      rarity TEXT,
      type TEXT DEFAULT 'beast',
      attack INTEGER DEFAULT 10,
      hp INTEGER DEFAULT 50,
      count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_id)
    );

    -- Lifeboat Clan Waypoints & Coords
    CREATE TABLE IF NOT EXISTS waypoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      name TEXT,
      x INTEGER,
      y INTEGER,
      z INTEGER,
      dimension TEXT DEFAULT 'Overworld',
      is_clan INTEGER DEFAULT 0,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Clan Raid Events
    CREATE TABLE IF NOT EXISTS raids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      creator_id TEXT,
      title TEXT,
      description TEXT,
      target_time TEXT,
      attendees_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'OPEN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (schemaErr) {
  console.error('[Database Error] Failed to initialize schemas:', schemaErr);
}

export default db;

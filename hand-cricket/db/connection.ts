import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const getDb = () => {
  if (!db) {
    const sqlite = openDatabaseSync('handcricket.db');
    db = drizzle(sqlite, { schema });
  }
  return db;
};

export const initDb = async () => {
  const database = getDb();
  // Create tables if they don't exist
  await database.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL DEFAULT 'You',
      user_avatar INTEGER DEFAULT 0,
      opponent_name TEXT NOT NULL DEFAULT 'Bot',
      opponent_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
      user_score INTEGER NOT NULL DEFAULT 0,
      user_wickets INTEGER NOT NULL DEFAULT 0,
      opponent_score INTEGER NOT NULL DEFAULT 0,
      opponent_wickets INTEGER NOT NULL DEFAULT 0,
      user_overs REAL NOT NULL DEFAULT 0,
      opponent_overs REAL NOT NULL DEFAULT 0,
      total_overs INTEGER NOT NULL DEFAULT 1,
      winner TEXT NOT NULL DEFAULT 'draw',
      played_at INTEGER NOT NULL DEFAULT (unixepoch()),
      is_deleted INTEGER NOT NULL DEFAULT 0
    )
  `);
  
  // Create index for faster queries
  await database.run(`
    CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id)
  `);
  await database.run(`
    CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC)
  `);
  
  return database;
};

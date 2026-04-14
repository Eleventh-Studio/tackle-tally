import { db } from './client';
import { sql } from 'drizzle-orm';

/**
 * Initialise the database schema.
 * Called once at app startup in app/_layout.tsx before any screen renders.
 * Uses CREATE TABLE IF NOT EXISTS so it is safe to call on every launch.
 *
 * Stage 2: replace with drizzle-kit generated migrations + migrate() from
 * drizzle-orm/expo-sqlite/migrator when the schema starts changing.
 */
export async function initializeDatabase(): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS catches (
      id TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      species TEXT NOT NULL,
      length_cm REAL,
      weight_g REAL,
      device_lat REAL,
      device_lng REAL,
      exif_lat REAL,
      exif_lng REAL,
      location_name TEXT,
      barometric_pressure_hpa REAL,
      weather_temp_c REAL,
      weather_wind_kph REAL,
      weather_wind_dir_deg REAL,
      moon_phase REAL,
      tide_height_m REAL,
      lure_type TEXT,
      lure_brand TEXT,
      lure_size TEXT,
      line_type TEXT,
      line_weight TEXT,
      session_id TEXT,
      notes TEXT
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      cover_photo_uri TEXT,
      mood_emoji TEXT,
      notes TEXT
    )
  `);
}

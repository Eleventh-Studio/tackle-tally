import { expoDB } from './client';

/**
 * Versioned schema migrations using SQLite PRAGMA user_version.
 *
 * Version history:
 *   0 → unversioned (either fresh or pre-versioning install with species NOT NULL)
 *   2 → species column made nullable (v1 skipped — never shipped as a versioned schema)
 *   3 → catches.taken_at added (EXIF DateTimeOriginal of the photo)
 *
 * Called once at app startup in app/_layout.tsx before any screen renders.
 *
 * Stage 2: replace with drizzle-kit generated migrations + migrate() from
 * drizzle-orm/expo-sqlite/migrator when the schema starts changing frequently.
 */
export async function initializeDatabase(): Promise<void> {
  const versionRow = expoDB.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= 3) return; // Schema is current

  // ── 0 → 2: make species nullable (or fresh-install create) ──────────────
  if (currentVersion < 2) {
    const catchesExists = expoDB.getFirstSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='catches'"
    );

    if (catchesExists) {
      // Existing install with old schema (species NOT NULL) — recreate catches table
      // SQLite does not support ALTER COLUMN so we use the rename-copy-drop pattern.
      expoDB.withTransactionSync(() => {
        expoDB.runSync(`
          CREATE TABLE catches_new (
            id TEXT PRIMARY KEY NOT NULL,
            created_at TEXT NOT NULL,
            photo_uri TEXT NOT NULL,
            species TEXT,
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
        expoDB.runSync('INSERT INTO catches_new SELECT * FROM catches');
        expoDB.runSync('DROP TABLE catches');
        expoDB.runSync('ALTER TABLE catches_new RENAME TO catches');
      });
    } else {
      // Fresh install — create both tables with v2 shape; v3 adds taken_at below.
      expoDB.runSync(`
        CREATE TABLE catches (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          photo_uri TEXT NOT NULL,
          species TEXT,
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
      expoDB.runSync(`
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
  }

  // ── 2 → 3: add taken_at (EXIF DateTimeOriginal) ─────────────────────────
  expoDB.runSync('ALTER TABLE catches ADD COLUMN taken_at TEXT');

  expoDB.runSync('PRAGMA user_version = 3');
}

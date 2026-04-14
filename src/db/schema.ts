import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const catches = sqliteTable('catches', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at').notNull(), // ISO timestamp — system-generated, never user-editable

  // Media
  photo_uri: text('photo_uri').notNull(),

  // Fish
  species: text('species'), // nullable — user can fill in later or via AI identification
  length_cm: real('length_cm'),
  weight_g: real('weight_g'),

  // Location — two sources stored independently (full-fidelity, per ADR-005)
  device_lat: real('device_lat'),      // from expo-location at log time
  device_lng: real('device_lng'),
  exif_lat: real('exif_lat'),          // from photo EXIF (may be null on iOS without permission)
  exif_lng: real('exif_lng'),
  location_name: text('location_name'), // reverse-geocoded, populated in Stage 2

  // Conditions — captured at log time from device sensors
  barometric_pressure_hpa: real('barometric_pressure_hpa'), // expo-sensors Barometer
  // Weather fields null in Stage 1 (require network); populated in Stage 2
  weather_temp_c: real('weather_temp_c'),
  weather_wind_kph: real('weather_wind_kph'),
  weather_wind_dir_deg: real('weather_wind_dir_deg'),
  moon_phase: real('moon_phase'),       // 0–1
  tide_height_m: real('tide_height_m'),

  // Gear (all optional)
  lure_type: text('lure_type'),         // 'Soft Plastic' | 'Hard Plastic' | 'Bait'
  lure_brand: text('lure_brand'),
  lure_size: text('lure_size'),
  line_type: text('line_type'),         // 'Mono' | 'Braid' | 'Fluorocarbon'
  line_weight: text('line_weight'),     // e.g. '20lb'

  // Relationships
  session_id: text('session_id'),       // optional FK to sessions.id

  // Notes
  notes: text('notes'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at').notNull(),
  name: text('name').notNull(),
  started_at: text('started_at').notNull(),
  ended_at: text('ended_at'),           // null = session still active
  cover_photo_uri: text('cover_photo_uri'),
  mood_emoji: text('mood_emoji'),
  notes: text('notes'),
});

export type CatchRow = typeof catches.$inferSelect;
export type NewCatch = typeof catches.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

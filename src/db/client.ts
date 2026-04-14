import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Singleton — opened once, reused across the app
const expoDB = openDatabaseSync('tackle-tally.db');

export const db = drizzle(expoDB, { schema });

export type Database = typeof db;

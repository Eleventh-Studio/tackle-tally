// Public surface of the DB layer — import from here, not from sub-modules
export { db } from './client';
export { initializeDatabase } from './migrate';
export * from './repositories/catches';
export * from './repositories/sessions';
export type { CatchRow, NewCatch, SessionRow, NewSession } from './schema';

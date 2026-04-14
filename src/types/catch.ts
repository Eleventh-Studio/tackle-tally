import type { CatchRow, NewCatch } from '@/db/schema';

// Re-export DB types as the canonical app types
// The schema is the single source of truth — these are not duplicates
export type Catch = CatchRow;
export type CreateCatchInput = NewCatch;

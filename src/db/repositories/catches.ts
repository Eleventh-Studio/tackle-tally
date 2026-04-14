import { eq, desc, and } from 'drizzle-orm';
import { db } from '../client';
import { catches, type CatchRow, type NewCatch } from '../schema';

export async function getAllCatches(): Promise<CatchRow[]> {
  return db.select().from(catches).orderBy(desc(catches.created_at));
}

export async function getCatchById(id: string): Promise<CatchRow | undefined> {
  const result = await db.select().from(catches).where(eq(catches.id, id));
  return result[0];
}

export async function getCatchesBySession(sessionId: string): Promise<CatchRow[]> {
  return db
    .select()
    .from(catches)
    .where(eq(catches.session_id, sessionId))
    .orderBy(desc(catches.created_at));
}

export async function getRecentCatches(limit = 20): Promise<CatchRow[]> {
  return db.select().from(catches).orderBy(desc(catches.created_at)).limit(limit);
}

export async function createCatch(data: NewCatch): Promise<CatchRow> {
  await db.insert(catches).values(data);
  const created = await getCatchById(data.id);
  if (!created) throw new Error('Failed to create catch');
  return created;
}

export async function updateCatch(
  id: string,
  data: Partial<Omit<NewCatch, 'id' | 'created_at'>>
): Promise<void> {
  await db.update(catches).set(data).where(eq(catches.id, id));
}

export async function deleteCatch(id: string): Promise<void> {
  await db.delete(catches).where(eq(catches.id, id));
}

export async function getCatchCount(): Promise<number> {
  const result = await db.select({ count: catches.id }).from(catches);
  return result.length;
}

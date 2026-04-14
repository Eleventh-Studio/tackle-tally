import { eq, desc, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../client';
import { sessions, type SessionRow, type NewSession } from '../schema';

export async function getAllSessions(): Promise<SessionRow[]> {
  return db.select().from(sessions).orderBy(desc(sessions.started_at));
}

export async function getSessionById(id: string): Promise<SessionRow | undefined> {
  const result = await db.select().from(sessions).where(eq(sessions.id, id));
  return result[0];
}

export async function getActiveSession(): Promise<SessionRow | undefined> {
  const result = await db
    .select()
    .from(sessions)
    .where(isNull(sessions.ended_at))
    .orderBy(desc(sessions.started_at))
    .limit(1);
  return result[0];
}

export async function createSession(data: NewSession): Promise<SessionRow> {
  await db.insert(sessions).values(data);
  const created = await getSessionById(data.id);
  if (!created) throw new Error('Failed to create session');
  return created;
}

export async function endSession(id: string): Promise<void> {
  await db
    .update(sessions)
    .set({ ended_at: new Date().toISOString() })
    .where(eq(sessions.id, id));
}

export async function updateSession(
  id: string,
  data: Partial<Omit<NewSession, 'id' | 'created_at'>>
): Promise<void> {
  await db.update(sessions).set(data).where(eq(sessions.id, id));
}

export async function deleteSession(id: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, id));
}

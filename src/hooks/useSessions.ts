import { useCallback } from 'react';
import * as sessionRepo from '@/db/repositories/sessions';
import { useSessionStore } from '@/stores/useSessionStore';
import { generateId } from '@/utils/ids';
import type { Session, CreateSessionInput } from '@/types';

export function useSessions() {
  const {
    sessions,
    activeSession,
    isLoading,
    setSessions,
    setActiveSession,
    addSession,
    updateSession,
    removeSession,
    setLoading,
  } = useSessionStore();

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [all, active] = await Promise.all([
        sessionRepo.getAllSessions(),
        sessionRepo.getActiveSession(),
      ]);
      setSessions(all);
      setActiveSession(active ?? null);
    } finally {
      setLoading(false);
    }
  }, [setSessions, setActiveSession, setLoading]);

  const createSession = useCallback(
    async (name: string, startedAt: Date = new Date()): Promise<Session> => {
      const now = new Date().toISOString();
      const startedAtIso = startedAt.toISOString();
      // A retrospective session (started_at clearly in the past) is created
      // already-ended at creation time — the user is recording a fishing trip
      // that happened earlier. A live session (started_at ≈ now) stays open.
      const isRetrospective = Date.now() - startedAt.getTime() > 60 * 1000;
      const record: CreateSessionInput = {
        id: generateId(),
        created_at: now,
        name,
        started_at: startedAtIso,
        ended_at: isRetrospective ? now : null,
      };
      const created = await sessionRepo.createSession(record);
      addSession(created);
      // Only a live session becomes the active one. A retrospective session
      // is already ended, so leave activeSession alone.
      if (!isRetrospective) setActiveSession(created);
      return created;
    },
    [addSession, setActiveSession]
  );

  const endSession = useCallback(
    async (id: string) => {
      await sessionRepo.endSession(id);
      const ended_at = new Date().toISOString();
      updateSession(id, { ended_at });
      setActiveSession(null);
    },
    [updateSession, setActiveSession]
  );

  const editSession = useCallback(
    async (id: string, data: Partial<Session>) => {
      await sessionRepo.updateSession(id, data);
      updateSession(id, data);
    },
    [updateSession]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await sessionRepo.deleteSession(id);
      removeSession(id);
    },
    [removeSession]
  );

  return {
    sessions,
    activeSession,
    isLoading,
    loadSessions,
    createSession,
    endSession,
    editSession,
    deleteSession,
  };
}

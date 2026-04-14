import { create } from 'zustand';
import type { Session } from '@/types';

interface SessionStore {
  sessions: Session[];
  activeSession: Session | null;
  isLoading: boolean;
  setSessions: (sessions: Session[]) => void;
  setActiveSession: (session: Session | null) => void;
  addSession: (s: Session) => void;
  updateSession: (id: string, data: Partial<Session>) => void;
  removeSession: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,
  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (activeSession) => set({ activeSession }),
  addSession: (s) =>
    set((state) => ({
      sessions: [s, ...state.sessions],
      activeSession: !s.ended_at ? s : state.activeSession,
    })),
  updateSession: (id, data) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...data } : s)),
      activeSession:
        state.activeSession?.id === id
          ? { ...state.activeSession, ...data }
          : state.activeSession,
    })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSession: state.activeSession?.id === id ? null : state.activeSession,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));

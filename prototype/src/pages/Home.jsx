import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@/components/NavigationContext';
import usePullToRefresh from '@/components/usePullToRefresh';
import {
  Plus, Fish, Square, LogOut, RefreshCw, Camera, Layers
} from 'lucide-react';
import { format } from 'date-fns';
import NewSessionModal from '@/components/session/NewSessionModal';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const { navigate } = useNavigation();
  const [showNewSession, setShowNewSession] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  const { refreshing, pullY, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh();

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', currentUser?.email],
    queryFn: () => base44.entities.Session.filter({ created_by: currentUser.email }, '-started_at'),
    enabled: !!currentUser,
  });

  const { data: catches = [] } = useQuery({
    queryKey: ['catches', currentUser?.email],
    queryFn: () => base44.entities.Catch.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const activeSession = sessions.find(s => s.is_active);

  const createSession = useMutation({
    mutationFn: (name) => base44.entities.Session.create({
      name,
      started_at: new Date().toISOString(),
      is_active: true,
    }),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ['sessions', currentUser?.email] });
      const prev = queryClient.getQueryData(['sessions', currentUser?.email]);
      const optimistic = { id: `opt-${Date.now()}`, name, started_at: new Date().toISOString(), is_active: true };
      queryClient.setQueryData(['sessions', currentUser?.email], old => [optimistic, ...(old || [])]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['sessions', currentUser?.email], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const endSession = useMutation({
    mutationFn: (session) => base44.entities.Session.update(session.id, {
      ended_at: new Date().toISOString(),
      is_active: false,
    }),
    onMutate: async (session) => {
      await queryClient.cancelQueries({ queryKey: ['sessions', currentUser?.email] });
      const prev = queryClient.getQueryData(['sessions', currentUser?.email]);
      queryClient.setQueryData(['sessions', currentUser?.email], old =>
        (old || []).map(s => s.id === session.id ? { ...s, is_active: false, ended_at: new Date().toISOString() } : s)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['sessions', currentUser?.email], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const handleStartSession = (name) => {
    setShowNewSession(false);
    createSession.mutate(name);
  };

  const handleAddCatch = () => {
    navigate('LogCatch', activeSession ? { session_id: activeSession.id } : {});
  };

  // Stats
  const totalCatches = catches.length;
  const speciesCounts = catches.reduce((acc, c) => { const s = c.fish_type || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const totalSessions = sessions.length;

  return (
    <div
      className="min-h-screen bg-[#121212] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullY > 10 && (
        <div className="flex items-center justify-center py-2 transition-all" style={{ height: pullY }}>
          <RefreshCw className={`w-5 h-5 text-[#CCFF00] ${refreshing ? 'animate-spin' : ''}`} style={{ opacity: pullY / 80 }} />
        </div>
      )}
      {refreshing && !pullY && (
        <div className="flex items-center justify-center py-3">
          <RefreshCw className="w-5 h-5 text-[#CCFF00] animate-spin" />
        </div>
      )}
      {/* ── TOP STRIP ── */}
      <header className="bg-[#121212]/95 backdrop-blur-xl border-b border-gray-800/60 px-5 pb-4 flex-shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        {/* Line 1: Brand + User */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#CCFF00] flex items-center justify-center flex-shrink-0">
            <Fish className="w-6 h-6 text-[#121212]" />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-xl font-black tracking-tight leading-none">TACKLE TALLY</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">
              {currentUser?.full_name || 'Angler Dashboard'}
            </p>
          </div>
          <button
            onClick={() => base44.auth.logout()}
            className="w-10 h-10 rounded-xl bg-[#1E1E1E] border border-gray-800 flex items-center justify-center hover:border-red-500/50 hover:text-red-400 text-gray-500 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Line 2: Stats */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-800/60">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <div className="text-center flex-shrink-0">
              <p className="text-[#CCFF00] font-black text-lg leading-none">{totalCatches}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">Catches</p>
            </div>
            <div className="w-px h-6 bg-gray-800 flex-shrink-0" />
            <div className="text-center flex-shrink-0">
              <p className="text-[#CCFF00] font-black text-lg leading-none">{totalSessions}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">Sessions</p>
            </div>
            <div className="w-px h-6 bg-gray-800 flex-shrink-0" />
            <div className="text-center flex-shrink-0">
              <p className="text-[#CCFF00] font-black text-lg leading-none">{Object.keys(speciesCounts).length}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">Species</p>
            </div>
          </div>
        </div>

        {/* Line 3: Big action buttons */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-800/60">
          <button
            onClick={handleAddCatch}
            className="w-full flex items-center justify-center gap-3 bg-[#CCFF00] text-[#121212] py-5 rounded-2xl font-black text-lg active:scale-95 transition-transform shadow-[0_0_24px_rgba(204,255,0,0.3)]"
          >
            <Camera className="w-6 h-6" strokeWidth={2.5} />
            LOG A CATCH
          </button>
          <button
            onClick={() => setShowNewSession(true)}
            disabled={!!activeSession}
            className="w-full flex items-center justify-center gap-3 bg-[#1E1E1E] border-2 border-[#CCFF00]/60 text-[#CCFF00] py-5 rounded-2xl font-black text-lg active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Layers className="w-6 h-6" strokeWidth={2.5} />
            {activeSession ? 'SESSION IN PROGRESS' : 'START SESSION'}
          </button>
        </div>

        {/* Active session banner */}
        {activeSession && (
          <div className="mt-3 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
              <div>
                <p className="text-[#CCFF00] font-bold text-sm">{activeSession.name}</p>
                <p className="text-gray-400 text-xs">Started {format(new Date(activeSession.started_at), 'h:mm a')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCatch}
                className="bg-[#CCFF00] text-[#121212] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                Log Catch
              </button>
              <button
                onClick={() => endSession.mutate(activeSession)}
                className="bg-[#2A2A2A] text-gray-300 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-gray-700"
              >
                <Square className="w-3 h-3" fill="currentColor" />
                End
              </button>
            </div>
          </div>
        )}
      </header>

      <NewSessionModal
        isOpen={showNewSession}
        onClose={() => setShowNewSession(false)}
        onStart={handleStartSession}
      />

      <BottomNav currentPage="Home" />
      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
}
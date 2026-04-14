import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@/components/NavigationContext';
import usePullToRefresh from '@/components/usePullToRefresh';
import { Layers, ChevronRight, Fish, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import BottomNav from '@/components/BottomNav';

export default function Sessions() {
  const { navigate } = useNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const { refreshing, pullY, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh();

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', currentUser?.email],
    queryFn: () => base44.entities.Session.filter({ created_by: currentUser.email }, '-started_at'),
    enabled: !!currentUser,
  });

  const { data: catches = [] } = useQuery({
    queryKey: ['catches', currentUser?.email],
    queryFn: () => base44.entities.Catch.filter({ created_by: currentUser.email }),
    enabled: !!currentUser,
  });

  const catchCountBySession = catches.reduce((acc, c) => {
    if (c.session_id) acc[c.session_id] = (acc[c.session_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen bg-[#121212] flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullY > 10 && (
        <div className="flex items-center justify-center transition-all" style={{ height: pullY }}>
          <RefreshCw className={`w-5 h-5 text-[#CCFF00] ${refreshing ? 'animate-spin' : ''}`} style={{ opacity: pullY / 80 }} />
        </div>
      )}
      {refreshing && !pullY && (
        <div className="flex items-center justify-center py-3">
          <RefreshCw className="w-5 h-5 text-[#CCFF00] animate-spin" />
        </div>
      )}
      <header className="bg-[#121212]/95 backdrop-blur-xl border-b border-gray-800/60 px-5 py-5 flex-shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.25rem)' }}>
        <h1 className="text-white text-xl font-black tracking-tight">SESSIONS</h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">Your Fishing Sessions</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Layers className="w-8 h-8 text-[#CCFF00] animate-pulse" />
          </div>
        )}

        {!isLoading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#1E1E1E] border border-gray-800 flex items-center justify-center">
              <Layers className="w-10 h-10 text-gray-600" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">No Sessions Yet</p>
              <p className="text-gray-500 text-sm mt-1">Start a session from the Action tab to begin tracking.</p>
            </div>
          </div>
        )}

        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => navigate('SessionDetail', { session_id: session.id })}
            className="w-full bg-[#1E1E1E] border border-gray-800 hover:border-[#CCFF00]/40 rounded-2xl p-4 flex items-center gap-4 text-left transition-colors"
          >
            {session.cover_photo_url ? (
              <img src={session.cover_photo_url} alt={session.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#2A2A2A] border border-gray-700 flex items-center justify-center flex-shrink-0">
                <Fish className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {session.is_active && <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse flex-shrink-0" />}
                <p className="text-white font-bold text-sm truncate">{session.name}</p>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{format(new Date(session.started_at), 'MMM d, yyyy · h:mm a')}</p>
              <p className="text-[#CCFF00] text-xs font-semibold mt-1">{catchCountBySession[session.id] || 0} catches</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
          </button>
        ))}
      </div>

      <BottomNav currentPage="Sessions" />
    </div>
  );
}
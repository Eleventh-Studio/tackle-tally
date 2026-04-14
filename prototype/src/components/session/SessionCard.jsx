import React from 'react';
import { motion } from 'framer-motion';
import { Fish, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';

export default function SessionCard({ session, catches, onClick }) {
  const sessionCatches = catches.filter(c => c.session_id === session.id);
  const isActive = session.is_active;

  const duration = session.started_at && session.ended_at
    ? intervalToDuration({ start: new Date(session.started_at), end: new Date(session.ended_at) })
    : null;

  const durationStr = duration
    ? formatDuration(duration, { format: ['hours', 'minutes'] }) || '< 1 min'
    : null;

  const topSpecies = sessionCatches.reduce((acc, c) => {
    if (c.fish_type) acc[c.fish_type] = (acc[c.fish_type] || 0) + 1;
    return acc;
  }, {});
  const best = Object.entries(topSpecies).sort(([, a], [, b]) => b - a)[0];

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#1E1E1E] rounded-2xl p-5 border border-gray-800 cursor-pointer hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isActive && (
              <span className="flex items-center gap-1 bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                Live
              </span>
            )}
            {!isActive && (
              <span className="flex items-center gap-1 bg-gray-800 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-lg tracking-tight">{session.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {session.started_at ? format(new Date(session.started_at), 'MMM d, yyyy · h:mm a') : ''}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Fish className="w-4 h-4 text-[#CCFF00]" />
          <span className="text-white font-bold">{sessionCatches.length}</span>
          <span className="text-gray-500 text-sm">catch{sessionCatches.length !== 1 ? 'es' : ''}</span>
        </div>
        {durationStr && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-sm">{durationStr}</span>
          </div>
        )}
        {best && (
          <div className="ml-auto text-gray-500 text-xs truncate max-w-[120px]">
            Top: <span className="text-gray-300">{best[0]}</span>
          </div>
        )}
      </div>

      {/* Tiny photo strip */}
      {sessionCatches.length > 0 && (
        <div className="flex gap-2 mt-4">
          {sessionCatches.slice(0, 5).map(c => (
            <div key={c.id} className="w-10 h-10 rounded-xl overflow-hidden bg-[#2A2A2A] flex-shrink-0">
              <img src={c.photo_url} alt={c.fish_type} className="w-full h-full object-cover" />
            </div>
          ))}
          {sessionCatches.length > 5 && (
            <div className="w-10 h-10 rounded-xl bg-[#2A2A2A] flex-shrink-0 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">+{sessionCatches.length - 5}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
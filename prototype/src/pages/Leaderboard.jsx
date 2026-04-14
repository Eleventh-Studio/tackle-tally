import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigation } from '@/components/NavigationContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Fish, Layers, Zap, Medal } from 'lucide-react';
import { subDays, subMonths, isAfter } from 'date-fns';

const CATEGORIES = [
  { key: 'total_catches', label: 'Total Catches', icon: Fish, unit: 'catches', desc: 'Most fish logged' },
  { key: 'largest_fish', label: 'Biggest Fish', icon: Zap, unit: 'cm', desc: 'Largest catch by size' },
  { key: 'species', label: 'Species Diversity', icon: Layers, unit: 'species', desc: 'Most unique species caught' },
  { key: 'sessions', label: 'Most Active', icon: Trophy, unit: 'sessions', desc: 'Most fishing sessions' },
];

const TIME_FILTERS = [
  { key: 'all', label: 'All Time' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '3m', label: '3 Months' },
];

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
const RANK_BG = ['bg-yellow-400/10 border-yellow-400/30', 'bg-gray-300/10 border-gray-300/20', 'bg-amber-600/10 border-amber-600/20'];
const RANK_MEDALS = ['🥇', '🥈', '🥉'];

function getRankLabel(rank) {
  if (rank < 3) return RANK_MEDALS[rank];
  return `#${rank + 1}`;
}

export default function Leaderboard() {
  const { goBack } = useNavigation();
  const [category, setCategory] = useState('total_catches');
  const [timePeriod, setTimePeriod] = useState('all');

  const { data: catches = [], isLoading: catchesLoading } = useQuery({
    queryKey: ['all-catches'],
    queryFn: () => base44.entities.Catch.list('-created_date', 500),
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['all-sessions'],
    queryFn: () => base44.entities.Session.list('-started_at', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const isLoading = catchesLoading || sessionsLoading;

  const cutoff = useMemo(() => {
    if (timePeriod === '7d') return subDays(new Date(), 7);
    if (timePeriod === '30d') return subDays(new Date(), 30);
    if (timePeriod === '3m') return subMonths(new Date(), 3);
    return null;
  }, [timePeriod]);

  const filteredCatches = useMemo(() =>
    cutoff ? catches.filter(c => c.timestamp && isAfter(new Date(c.timestamp), cutoff)) : catches,
    [catches, cutoff]
  );

  const filteredSessions = useMemo(() =>
    cutoff ? sessions.filter(s => s.started_at && isAfter(new Date(s.started_at), cutoff)) : sessions,
    [sessions, cutoff]
  );

  const leaderboard = useMemo(() => {
    // Group by user email (created_by)
    const userMap = {};

    const getUser = (email) => {
      if (!userMap[email]) {
        const u = users.find(u => u.email === email);
        userMap[email] = {
          email,
          name: u?.full_name || email?.split('@')[0] || 'Angler',
          catches: filteredCatches.filter(c => c.created_by === email),
          sessions: filteredSessions.filter(s => s.created_by === email && !s.is_active),
        };
      }
      return userMap[email];
    };

    // Collect all unique users from catches + sessions
    const emails = new Set([
      ...filteredCatches.map(c => c.created_by).filter(Boolean),
      ...filteredSessions.map(s => s.created_by).filter(Boolean),
    ]);

    const rows = [...emails].map(email => {
      const u = getUser(email);
      let value = 0;
      let detail = '';

      if (category === 'total_catches') {
        value = u.catches.length;
        detail = `${value} catch${value !== 1 ? 'es' : ''}`;
      } else if (category === 'largest_fish') {
        const sizes = u.catches.map(c => c.length).filter(Boolean);
        value = sizes.length ? Math.max(...sizes) : 0;
        detail = value ? `${value} cm` : 'No size logged';
      } else if (category === 'species') {
        const unique = new Set(u.catches.map(c => c.fish_type).filter(Boolean));
        value = unique.size;
        detail = `${value} species`;
      } else if (category === 'sessions') {
        value = u.sessions.length;
        detail = `${value} session${value !== 1 ? 's' : ''}`;
      }

      return { email, name: u.name, value, detail };
    });

    return rows.sort((a, b) => b.value - a.value).filter(r => r.value > 0);
  }, [filteredCatches, filteredSessions, users, category]);

  const activeCat = CATEGORIES.find(c => c.key === category);

  return (
    <div className="min-h-screen bg-[#121212] pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => goBack()}
            className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">LEADERBOARD</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Community Rankings</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-5 space-y-5">

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-[#CCFF00]'
                    : 'bg-[#1E1E1E] border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Filter */}
        <div className="flex gap-2">
          {TIME_FILTERS.map(tf => (
            <button
              key={tf.key}
              onClick={() => setTimePeriod(tf.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timePeriod === tf.key
                  ? 'bg-[#CCFF00] text-[#121212]'
                  : 'bg-[#1E1E1E] text-gray-500 border border-gray-800'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Category description */}
        <p className="text-gray-600 text-sm">{activeCat?.desc}</p>

        {/* Rankings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-12 text-center">
            <Trophy className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No data yet for this category</p>
            <p className="text-gray-700 text-xs mt-1">Log some catches to appear here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.email}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  i < 3 ? RANK_BG[i] : 'bg-[#1E1E1E] border-gray-800'
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center">
                  <span className={`text-xl font-black ${i < 3 ? RANK_COLORS[i] : 'text-gray-600'}`}>
                    {getRankLabel(i)}
                  </span>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center flex-shrink-0 border border-gray-700">
                  <span className="text-white font-bold text-sm">
                    {entry.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{entry.name}</p>
                  <p className="text-gray-500 text-xs truncate">{entry.email}</p>
                </div>

                {/* Value */}
                <div className="text-right flex-shrink-0">
                  <p className={`font-black text-lg ${i < 3 ? RANK_COLORS[i] : 'text-white'}`}>{entry.value}</p>
                  <p className="text-gray-600 text-xs">{activeCat?.unit}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
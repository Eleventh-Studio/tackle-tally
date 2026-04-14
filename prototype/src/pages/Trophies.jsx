import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@/components/NavigationContext';
import usePullToRefresh from '@/components/usePullToRefresh';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronUp, ChevronDown, ChevronsUpDown, MapPin, Calendar, Ruler, Zap, Fish, BarChart2, List, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SortIcon = ({ field, sortConfig }) => {
  if (sortConfig.field !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-600" />;
  return sortConfig.dir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-[#CCFF00]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#CCFF00]" />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1E1E1E] border border-gray-700 rounded-xl px-4 py-2">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-[#CCFF00] font-bold text-lg">{payload[0].value} catches</p>
      </div>
    );
  }
  return null;
};

export default function Trophies() {
  const { goBack } = useNavigation();
  const [view, setView] = useState('list');
  const [sortConfig, setSortConfig] = useState({ field: 'timestamp', dir: 'desc' });
  const [currentUser, setCurrentUser] = useState(null);
  const { refreshing, pullY, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh();

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: catches = [], isLoading } = useQuery({
    queryKey: ['catches', currentUser?.email],
    queryFn: () => base44.entities.Catch.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', currentUser?.email],
    queryFn: () => base44.entities.Session.filter({ created_by: currentUser.email }, '-started_at'),
    enabled: !!currentUser,
  });

  const toggleSort = (field) => {
    setSortConfig(prev =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'desc' }
    );
  };

  // Build species chart data
  const speciesData = (() => {
    const counts = {};
    catches.forEach(c => {
      const key = c.fish_type || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([species, count]) => ({ species, count }));
  })();

  // Build catches per session data
  const sessionData = sessions
    .filter(s => !s.is_active)
    .map(s => ({
      name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
      count: catches.filter(c => c.session_id === s.id).length,
    }))
    .filter(s => s.count > 0);

  // Build monthly chart data
  const monthlyData = (() => {
    const counts = {};
    catches.forEach(c => {
      if (!c.timestamp) return;
      const key = format(new Date(c.timestamp), 'MMM yy');
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => new Date('01 ' + a) - new Date('01 ' + b))
      .map(([month, count]) => ({ month, count }));
  })();

  const sorted = [...catches].sort((a, b) => {
    let valA, valB;
    if (sortConfig.field === 'timestamp') {
      valA = new Date(a.timestamp || 0).getTime();
      valB = new Date(b.timestamp || 0).getTime();
    } else if (sortConfig.field === 'length') {
      valA = a.length || 0;
      valB = b.length || 0;
    } else if (sortConfig.field === 'location_name') {
      valA = (a.location_name || '').toLowerCase();
      valB = (b.location_name || '').toLowerCase();
      return sortConfig.dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortConfig.dir === 'asc' ? valA - valB : valB - valA;
  });

  return (
    <div
      className="min-h-screen bg-[#121212]"
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-gray-800/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => goBack()}
            className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold tracking-tight">TROPHY LIST</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">{catches.length} Catches Logged</p>
          </div>

          {/* Toggle */}
          <div className="flex bg-[#1E1E1E] rounded-xl p-1 border border-gray-800">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'list' ? 'bg-[#CCFF00] text-[#121212]' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView('chart')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'chart' ? 'bg-[#CCFF00] text-[#121212]' : 'text-gray-400'}`}
            >
              <BarChart2 className="w-4 h-4" />
              Chart
            </button>
          </div>
        </div>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'chart' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Per-session chart */}
            {sessionData.length > 0 && (
              <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
                <h2 className="text-white font-bold text-base mb-1">Catches per Session</h2>
                <p className="text-gray-500 text-sm mb-6">How many fish per fishing session</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sessionData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {sessionData.map((_, i) => <Cell key={i} fill="#CCFF00" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly chart */}
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-white font-bold text-base mb-1">Catches per Month</h2>
              <p className="text-gray-500 text-sm mb-6">Your fishing activity over time</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} barSize={32}>
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {monthlyData.map((_, i) => (
                    <Cell key={i} fill="#CCFF00" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Species chart */}
            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-white font-bold text-base mb-1">Catches by Species</h2>
              <p className="text-gray-500 text-sm mb-6">Which fish you catch the most</p>
              <ResponsiveContainer width="100%" height={Math.max(180, speciesData.length * 48)}>
                <BarChart data={speciesData} layout="vertical" barSize={24}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="species" width={100} tick={{ fill: '#ccc', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {speciesData.map((_, i) => (
                     <Cell key={i} fill="#CCFF00" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#1A1A1A] border-b border-gray-800">
                  <th className="text-left px-4 py-4 text-gray-400 text-xs uppercase tracking-widest font-semibold w-14"></th>

                  <th className="text-left px-4 py-4 text-gray-400 text-xs uppercase tracking-widest font-semibold">
                    Species
                  </th>

                  <th
                    className="text-left px-4 py-4 text-xs uppercase tracking-widest font-semibold cursor-pointer select-none"
                    onClick={() => toggleSort('length')}
                  >
                    <div className={`flex items-center gap-1.5 ${sortConfig.field === 'length' ? 'text-[#CCFF00]' : 'text-gray-400'}`}>
                      <Ruler className="w-3.5 h-3.5" />
                      Size
                      <SortIcon field="length" sortConfig={sortConfig} />
                    </div>
                  </th>

                  <th
                    className="text-left px-4 py-4 text-xs uppercase tracking-widest font-semibold cursor-pointer select-none"
                    onClick={() => toggleSort('timestamp')}
                  >
                    <div className={`flex items-center gap-1.5 ${sortConfig.field === 'timestamp' ? 'text-[#CCFF00]' : 'text-gray-400'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Date
                      <SortIcon field="timestamp" sortConfig={sortConfig} />
                    </div>
                  </th>

                  <th
                    className="text-left px-4 py-4 text-xs uppercase tracking-widest font-semibold cursor-pointer select-none"
                    onClick={() => toggleSort('location_name')}
                  >
                    <div className={`flex items-center gap-1.5 ${sortConfig.field === 'location_name' ? 'text-[#CCFF00]' : 'text-gray-400'}`}>
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                      <SortIcon field="location_name" sortConfig={sortConfig} />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sorted.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/60 hover:bg-[#1E1E1E] transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#2A2A2A] flex-shrink-0">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt={c.fish_type} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Fish className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Species */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{c.fish_type || '—'}</span>
                        {c.has_exif_data && (
                          <div className="bg-[#CCFF00]/10 text-[#CCFF00] px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" fill="currentColor" />
                            <span className="text-[10px] font-bold">BB</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Length */}
                    <td className="px-4 py-3">
                      <span className={`font-bold ${c.length ? 'text-[#CCFF00]' : 'text-gray-600'}`}>
                        {c.length ? `${c.length} cm` : '—'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">
                      {c.timestamp ? format(new Date(c.timestamp), 'MMM d, yyyy') : '—'}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-gray-400 text-sm max-w-[180px] truncate">
                      {c.location_name || (c.location_lat ? `${c.location_lat?.toFixed(3)}, ${c.location_lng?.toFixed(3)}` : '—')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import BottomNav from '@/components/BottomNav';

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

export default function Charts() {
  const [currentUser, setCurrentUser] = useState(null);

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

  const sessionData = sessions
    .filter(s => !s.is_active)
    .map(s => ({
      name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
      count: catches.filter(c => c.session_id === s.id).length,
    }))
    .filter(s => s.count > 0);

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

  return (
    <div className="min-h-screen bg-[#121212]">
      <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-gray-800/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4">
          <h1 className="text-white text-lg font-bold tracking-tight">CHARTS</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest">Your Stats Visualised</p>
        </div>
      </header>

      <div className="p-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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

            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-white font-bold text-base mb-1">Catches per Month</h2>
              <p className="text-gray-500 text-sm mb-6">Your fishing activity over time</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} barSize={32}>
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {monthlyData.map((_, i) => <Cell key={i} fill="#CCFF00" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
              <h2 className="text-white font-bold text-base mb-1">Catches by Species</h2>
              <p className="text-gray-500 text-sm mb-6">Which fish you catch the most</p>
              <ResponsiveContainer width="100%" height={Math.max(180, speciesData.length * 48)}>
                <BarChart data={speciesData} layout="vertical" barSize={24}>
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="species" width={100} tick={{ fill: '#ccc', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {speciesData.map((_, i) => <Cell key={i} fill="#CCFF00" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav currentPage="Charts" />
    </div>
  );
}
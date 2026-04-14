import React from 'react';
import { Users } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Community() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <header className="bg-[#121212]/95 backdrop-blur-xl border-b border-gray-800/60 px-5 py-5 flex-shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.25rem)' }}>
        <h1 className="text-white text-xl font-black tracking-tight">COMMUNITY</h1>
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">Anglers Around You</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center pb-24">
        <div className="w-20 h-20 rounded-3xl bg-[#1E1E1E] border border-gray-800 flex items-center justify-center">
          <Users className="w-10 h-10 text-[#CCFF00]" />
        </div>
        <div>
          <p className="text-white font-bold text-lg">Coming Soon</p>
          <p className="text-gray-500 text-sm mt-1">Connect with other anglers, share catches, and compete on local leaderboards.</p>
        </div>
      </div>

      <BottomNav currentPage="Community" />
    </div>
  );
}
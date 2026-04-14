import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

export default function NewSessionModal({ isOpen, onClose, onStart }) {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (!name.trim()) return;
    onStart(name.trim());
    setName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed left-4 right-4 bottom-8 bg-[#1E1E1E] rounded-3xl p-6 z-50 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-xl font-bold">New Session</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <label className="text-gray-400 text-xs uppercase tracking-widest mb-2 block">Session Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="e.g. Morning Lake Run"
              className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-base border border-gray-700 focus:border-[#CCFF00] outline-none mb-5"
            />

            <button
              onClick={handleStart}
              disabled={!name.trim()}
              className="w-full bg-[#CCFF00] text-[#121212] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Start Session
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
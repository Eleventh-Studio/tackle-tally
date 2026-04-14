import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigation } from '@/components/NavigationContext';
import { useTheme } from '@/components/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sun, Moon, Trash2, AlertTriangle } from 'lucide-react';

export default function AccountSettings() {
  const { goBack } = useNavigation();
  const { isDark, toggle } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const bg = isDark ? '#121212' : '#F5F5F0';
  const card = isDark ? '#1E1E1E' : '#FFFFFF';
  const border = isDark ? '#2A2A2A' : '#E5E5E5';
  const text = isDark ? '#FFFFFF' : '#111111';
  const sub = isDark ? '#9CA3AF' : '#6B7280';

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const user = await base44.auth.me();
    const userCatches = await base44.entities.Catch.filter({ created_by: user.email });
    for (const c of userCatches) await base44.entities.Catch.delete(c.id);
    const userSessions = await base44.entities.Session.filter({ created_by: user.email });
    for (const s of userSessions) await base44.entities.Session.delete(s.id);
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: `${bg}CC`, borderColor: border, paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors"
            style={{ background: card, borderColor: border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: text }} />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: text }}>ACCOUNT SETTINGS</h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: sub }}>Preferences & Security</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 border"
          style={{ background: card, borderColor: border }}
        >
          <h3 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: text }}>Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark
                ? <Moon className="w-5 h-5 text-[#CCFF00]" />
                : <Sun className="w-5 h-5 text-amber-500" />
              }
              <div>
                <p className="font-semibold text-sm" style={{ color: text }}>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs" style={{ color: sub }}>{isDark ? 'Easy on the eyes at night' : 'Bright and clear'}</p>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={toggle}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none"
              style={{ background: isDark ? '#CCFF00' : '#D1D5DB' }}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-6 h-6 rounded-full shadow-md"
                style={{
                  background: isDark ? '#121212' : '#FFFFFF',
                  left: isDark ? '1.625rem' : '0.125rem',
                }}
              />
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 border border-red-900/30"
          style={{ background: card }}
        >
          <h3 className="font-bold text-sm uppercase tracking-widest mb-1" style={{ color: text }}>Danger Zone</h3>
          <p className="text-xs mb-4" style={{ color: sub }}>Permanently delete your account and all data. This cannot be undone.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 text-red-400 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-900/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </motion.div>
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Delete Account?</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">All your catches, sessions, and data will be permanently deleted. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-[#2A2A2A] text-gray-300 py-3 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
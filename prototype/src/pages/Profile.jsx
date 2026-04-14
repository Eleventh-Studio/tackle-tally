import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigation } from '@/components/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Fish, Ruler, Trophy, TrendingUp, Edit2, Check, X, User, Star, ChevronDown, Calendar, Settings, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  const { navigate, goBack } = useNavigation();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCatchPicker, setShowCatchPicker] = useState(false);
  const [featuredCatchId, setFeaturedCatchId] = useState(null);


  const { data: catches = [] } = useQuery({
    queryKey: ['catches', user?.email],
    queryFn: () => base44.entities.Catch.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setEditName(u?.full_name || '');
      setEditBio(u?.bio || '');
      setFeaturedCatchId(u?.featured_catch_id || null);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ bio: editBio });
    const updated = await base44.auth.me();
    setUser(updated);
    setEditing(false);
    setSaving(false);
  };



  const handleSelectFeatured = async (catchId) => {
    setFeaturedCatchId(catchId);
    setShowCatchPicker(false);
    await base44.auth.updateMe({ featured_catch_id: catchId });
  };

  const featuredCatch = catches.find(c => c.id === featuredCatchId) || null;

  // Stats
  const totalCatches = catches.length;
  const largestFish = catches.reduce((best, c) => {
    if (!c.length) return best;
    return (!best || c.length > best.length) ? c : best;
  }, null);
  const speciesCounts = catches.reduce((acc, c) => {
    const s = c.fish_type || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const topSpecies = Object.entries(speciesCounts).sort(([, a], [, b]) => b - a)[0];

  const stats = [
    { label: 'Total Catches', value: totalCatches, icon: Fish, color: 'text-[#CCFF00]' },
    { label: 'Favourite Catch', value: largestFish ? `${largestFish.length} cm` : '—', sub: largestFish?.fish_type, icon: Ruler, color: 'text-[#CCFF00]' },
    { label: 'Top Species', value: topSpecies ? topSpecies[0] : '—', sub: topSpecies ? `${topSpecies[1]}x caught` : null, icon: Trophy, color: 'text-[#CCFF00]' },
    { label: 'Species Caught', value: Object.keys(speciesCounts).length, icon: TrendingUp, color: 'text-[#CCFF00]' },
  ];

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-gray-800/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold tracking-tight">PROFILE</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">Your Angler Stats</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center border border-gray-700 hover:border-[#CCFF00] transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4 pb-12">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center">
              <User className="w-8 h-8 text-[#CCFF00]" />
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold">{user?.full_name || 'Angler'}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-widest mb-1.5 block">Bio</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#CCFF00] text-[#121212] px-4 py-2 rounded-xl font-bold text-sm"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditBio(user?.bio || ''); }}
                  className="flex items-center gap-2 bg-[#2A2A2A] text-gray-400 px-4 py-2 rounded-xl font-bold text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            user?.bio && <p className="text-gray-400 text-sm">{user.bio}</p>
          )}
        </motion.div>

        {/* Featured Catch */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#1E1E1E] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#CCFF00]" fill="#CCFF00" />
              <span className="text-white font-bold text-sm uppercase tracking-widest">Favourite Catch</span>
            </div>
            <button
              onClick={() => setShowCatchPicker(true)}
              className="text-xs text-gray-500 hover:text-[#CCFF00] transition-colors flex items-center gap-1 font-semibold"
            >
              {featuredCatch ? 'Change' : 'Select Catch'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {featuredCatch ? (
            <div className="flex items-center gap-4 p-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#2A2A2A] flex-shrink-0">
                {featuredCatch.photo_url
                  ? <img src={featuredCatch.photo_url} alt={featuredCatch.fish_type} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Fish className="w-8 h-8 text-gray-600" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-lg truncate">{featuredCatch.fish_type}</p>
                {featuredCatch.length && (
                  <p className="text-[#CCFF00] font-bold text-sm flex items-center gap-1 mt-0.5">
                    <Ruler className="w-3.5 h-3.5" />{featuredCatch.length} cm
                  </p>
                )}
                {featuredCatch.timestamp && (
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(featuredCatch.timestamp), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCatchPicker(true)}
              className="w-full p-8 flex flex-col items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors"
            >
              <Star className="w-8 h-8" />
              <span className="text-sm font-semibold">Link your favourite catch</span>
              <span className="text-xs text-gray-700">Showcase it on your profile</span>
            </button>
          )}
        </motion.div>

        {/* Catch Picker Modal */}
        <AnimatePresence>
          {showCatchPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 flex items-end"
              onClick={() => setShowCatchPicker(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full bg-[#1E1E1E] rounded-t-3xl border-t border-gray-800 max-h-[75vh] flex flex-col"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
                  <h3 className="text-white font-bold text-base">Select Favourite Catch</h3>
                  <button onClick={() => setShowCatchPicker(false)} className="w-8 h-8 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2">
                  {catches.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-8">No catches logged yet.</p>
                  )}
                  {catches.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectFeatured(c.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${featuredCatchId === c.id ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-gray-800 bg-[#2A2A2A] hover:border-gray-600'}`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#333] flex-shrink-0">
                        {c.photo_url
                          ? <img src={c.photo_url} alt={c.fish_type} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Fish className="w-5 h-5 text-gray-600" /></div>
                        }
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white font-semibold truncate">{c.fish_type || 'Unknown'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {c.length && <span className="text-[#CCFF00] text-xs font-bold">{c.length} cm</span>}
                          {c.timestamp && <span className="text-gray-500 text-xs">{format(new Date(c.timestamp), 'MMM d, yyyy')}</span>}
                        </div>
                      </div>
                      {featuredCatchId === c.id && <Check className="w-4 h-4 text-[#CCFF00] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#1E1E1E] rounded-2xl p-5 border border-gray-800"
            >
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center mb-3">
                <stat.icon className="w-4.5 h-4.5 text-[#CCFF00]" />
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-white font-bold text-xl leading-tight">{stat.value}</p>
              {stat.sub && <p className="text-gray-500 text-xs mt-0.5">{stat.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* Account Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <button
            onClick={() => navigate('AccountSettings')}
            className="w-full bg-[#1E1E1E] rounded-2xl p-5 border border-gray-800 flex items-center gap-4 hover:border-gray-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">Account Settings</p>
              <p className="text-gray-500 text-xs mt-0.5">Theme, privacy & account management</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </motion.div>

        {/* Recent Species Breakdown */}
        {Object.keys(speciesCounts).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Species Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(speciesCounts).sort(([, a], [, b]) => b - a).map(([species, count]) => {
                const pct = Math.round((count / totalCatches) * 100);
                return (
                  <div key={species}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-white text-sm font-medium">{species}</span>
                      <span className="text-[#CCFF00] text-sm font-bold">{count}x</span>
                    </div>
                    <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="h-full bg-[#CCFF00] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>



      <BottomNav currentPage="Profile" />
      <div className="h-20" />
    </div>
  );
}
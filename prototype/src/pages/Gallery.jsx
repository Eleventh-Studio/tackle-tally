import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigation } from '@/components/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Fish, X, Ruler, MapPin, Calendar, RefreshCw, Download } from 'lucide-react';

const handleDownload = async (url, filename = 'catch.jpg') => {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};
import { format } from 'date-fns';
import BottomNav from '@/components/BottomNav';

export default function Gallery() {
  const { navigate, goBack } = useNavigation();
  const [selected, setSelected] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(null);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 800);
  }, [queryClient]);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta, 80));
  };
  const handleTouchEnd = () => {
    if (pullY > 50) handleRefresh();
    setPullY(0);
    touchStartY.current = null;
  };

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: catches = [], isLoading } = useQuery({
    queryKey: ['catches', currentUser?.email],
    queryFn: () => base44.entities.Catch.filter({ created_by: currentUser.email }, '-created_date'),
    enabled: !!currentUser,
  });

  const photoCatches = catches.filter(c => c.photo_url);

  // Group by month
  const grouped = photoCatches.reduce((acc, c) => {
    const date = new Date(c.timestamp || c.created_date);
    const key = format(date, 'MMMM yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});
  const monthGroups = Object.entries(grouped).sort(([a], [b]) =>
    new Date(b) - new Date(a)
  );

  return (
    <div
      className="min-h-screen bg-[#121212]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
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
      <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-xl border-b border-gray-800/50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold tracking-tight">GALLERY</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest">{photoCatches.length} Photos</p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : photoCatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <Fish className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-white font-bold text-lg mb-2">No Photos Yet</p>
          <p className="text-gray-500 text-sm">Log catches with photos to fill your gallery.</p>
        </div>
      ) : (
        <div className="p-3 space-y-6">
          {monthGroups.map(([month, items]) => (
            <div key={month}>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2 px-1">
                {month} <span className="text-gray-600 font-normal">· {items.length}</span>
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
                {items.map((c, i) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelected(c)}
                    className="aspect-square rounded-xl overflow-hidden bg-[#1E1E1E] relative group"
                  >
                    <img src={c.photo_url} alt={c.fish_type} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between gap-1">
                      {c.fish_type && (
                        <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate">
                          {c.fish_type}
                        </div>
                      )}
                      {c.length && (
                        <div className="bg-black/60 backdrop-blur-sm text-[#CCFF00] text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0">
                          {c.length}cm
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav currentPage="Gallery" />
      <div className="h-20" />

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1E1E1E] rounded-2xl border border-gray-800 overflow-hidden max-w-sm w-full"
            >
              <div className="relative">
                <img src={selected.photo_url} alt={selected.fish_type} className="w-full aspect-[4/3] object-cover" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(selected.photo_url, `catch-${selected.fish_type || 'photo'}.jpg`); }}
                  className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur-sm flex items-center justify-center"
                  title="Download photo"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-white font-bold text-lg">{selected.fish_type || 'Unknown'}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {selected.length && (
                    <span className="text-[#CCFF00] font-bold flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />{selected.length} cm
                    </span>
                  )}
                  {selected.timestamp && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />{format(new Date(selected.timestamp), 'MMM d, yyyy')}
                    </span>
                  )}
                  {selected.location_name && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />{selected.location_name}
                    </span>
                  )}
                </div>
                {selected.session_id && (
                  <button
                    onClick={() => navigate('SessionDetail', { id: selected.session_id })}
                    className="w-full mt-2 bg-[#CCFF00] text-[#121212] py-2.5 rounded-xl font-bold text-sm"
                  >
                    View Session →
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigation } from '@/components/NavigationContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Fish, MapPin, Calendar, Ruler, Check, Edit2, ImagePlus, Loader2, X, Plus, Share2 } from 'lucide-react';
import { format, intervalToDuration, formatDuration } from 'date-fns';
import EditCatchModal from '@/components/session/EditCatchModal';
import WeatherBadges from '@/components/catch/WeatherBadges';
import ShareSheet from '@/components/ShareSheet';

const MOOD_EMOJIS = ['🔥', '😄', '😊', '😐', '😔', '🤦', '🎣', '🏆', '💀'];

export default function SessionDetail() {
  const { navigate, goBack, currentParams } = useNavigation();
  const sessionId = currentParams.id;
  const queryClient = useQueryClient();

  // Session editing state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const coverInputRef = useRef(null);

  // Catch editing
  const [editingCatch, setEditingCatch] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      const s = sessions[0];
      setDescValue(s?.description || '');
      setNameValue(s?.name || '');
      return s;
    },
    enabled: !!sessionId,
  });

  const { data: catches = [], refetch: refetchCatches } = useQuery({
    queryKey: ['catches-session', sessionId],
    queryFn: () => base44.entities.Catch.filter({ session_id: sessionId }),
    enabled: !!sessionId,
  });

  const updateSession = useMutation({
    mutationFn: (data) => base44.entities.Session.update(sessionId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await updateSession.mutateAsync({ cover_photo_url: file_url });
    setUploadingPhoto(false);
  };

  const duration = session?.started_at && session?.ended_at
    ? formatDuration(
        intervalToDuration({ start: new Date(session.started_at), end: new Date(session.ended_at) }),
        { format: ['hours', 'minutes'] }
      ) || '< 1 min'
    : session?.is_active ? 'Ongoing' : '—';

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-gray-500">
        Session not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] pb-10">
      {/* Hidden cover input */}
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

      {/* Cover Photo / Header */}
      <div className="relative">
        {session.cover_photo_url ? (
          <div className="relative h-52 w-full">
            <img src={session.cover_photo_url} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-600"
            >
              Change Photo
            </button>
          </div>
        ) : (
          <div className="h-32 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-center">
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 text-gray-500 hover:text-[#CCFF00] transition-colors"
            >
              {uploadingPhoto
                ? <Loader2 className="w-5 h-5 animate-spin text-[#CCFF00]" />
                : <ImagePlus className="w-5 h-5" />}
              <span className="text-sm font-semibold">Add Session Cover Photo</span>
            </button>
          </div>
        )}

        {/* Back button overlaid */}
        <button
          onClick={() => goBack()}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10"
        >
          <Share2 className="w-5 h-5 text-white" />
        </button>

        {uploadingPhoto && session.cover_photo_url && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin" />
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Session Name + Status */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  className="flex-1 bg-[#2A2A2A] text-white rounded-xl px-3 py-2 font-bold text-xl border border-[#CCFF00] outline-none"
                />
                <button
                  onClick={() => { updateSession.mutate({ name: nameValue }); setEditingName(false); }}
                  className="w-9 h-9 bg-[#CCFF00] rounded-xl flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-[#121212]" />
                </button>
                <button onClick={() => setEditingName(false)} className="w-9 h-9 bg-[#2A2A2A] rounded-xl flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {session.mood_emoji && <span className="text-2xl">{session.mood_emoji}</span>}
                <h1 className="text-white text-2xl font-bold tracking-tight">{session.name}</h1>
                <button onClick={() => setEditingName(true)} className="text-gray-600 hover:text-[#CCFF00] transition-colors ml-1">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">
              {session.is_active ? '🟢 Active Session' : 'Completed Session'}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
          <div className="bg-[#1E1E1E] rounded-2xl p-4 border border-gray-800 text-center">
            <Fish className="w-5 h-5 text-[#CCFF00] mx-auto mb-1" />
            <p className="text-white font-bold text-2xl">{catches.length}</p>
            <p className="text-gray-500 text-xs">Catches</p>
          </div>
          <div className="bg-[#1E1E1E] rounded-2xl p-4 border border-gray-800 text-center">
            <Clock className="w-5 h-5 text-[#CCFF00] mx-auto mb-1" />
            <p className="text-white font-bold text-base leading-tight mt-1">{duration}</p>
            <p className="text-gray-500 text-xs">Duration</p>
          </div>
          <div className="bg-[#1E1E1E] rounded-2xl p-4 border border-gray-800 text-center">
            <Calendar className="w-5 h-5 text-[#CCFF00] mx-auto mb-1" />
            <p className="text-white font-bold text-sm leading-tight mt-1">
              {session.started_at ? format(new Date(session.started_at), 'MMM d') : '—'}
            </p>
            <p className="text-gray-500 text-xs">
              {session.started_at ? format(new Date(session.started_at), 'h:mm a') : ''}
            </p>
          </div>
        </motion.div>

        {/* Mood */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-4">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">How was it?</p>
          <div className="flex gap-2 flex-wrap">
            {MOOD_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => updateSession.mutate({ mood_emoji: emoji })}
                className={`text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  session.mood_emoji === emoji ? 'bg-[#CCFF00]/20 ring-2 ring-[#CCFF00]' : 'bg-[#2A2A2A] hover:bg-[#333]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-xs uppercase tracking-widest">Notes</p>
            {!editingDesc && (
              <button onClick={() => { setEditingDesc(true); setDescValue(session.description || ''); }} className="text-gray-500 hover:text-[#CCFF00] transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {editingDesc ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={descValue}
                onChange={e => setDescValue(e.target.value)}
                placeholder="How did the session go? Weather, conditions, tips..."
                rows={4}
                className="w-full bg-[#2A2A2A] text-white rounded-xl px-3 py-2.5 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { updateSession.mutate({ description: descValue }); setEditingDesc(false); }}
                  className="flex items-center gap-1.5 bg-[#CCFF00] text-[#121212] px-4 py-2 rounded-xl font-bold text-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button onClick={() => setEditingDesc(false)} className="bg-[#2A2A2A] text-gray-400 px-4 py-2 rounded-xl font-bold text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`text-sm ${session.description ? 'text-gray-300' : 'text-gray-600 italic'}`}>
              {session.description || 'Tap edit to add notes about this session...'}
            </p>
          )}
        </motion.div>

        {/* Catches List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-xs uppercase tracking-widest">Catches ({catches.length})</p>
            <button
              onClick={() => navigate('LogCatch', { session_id: sessionId })}
              className="flex items-center gap-1.5 bg-[#CCFF00] text-[#121212] px-3 py-1.5 rounded-xl font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              Add Catch
            </button>
          </div>
          {catches.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-2xl border border-gray-800 p-8 text-center">
              <Fish className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No catches logged for this session</p>
            </div>
          ) : (
            <div className="space-y-2">
              {catches.map((c, i) => (
                <div key={c.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setEditingCatch(c)}
                    className="bg-[#1E1E1E] rounded-2xl border border-gray-800 flex items-center gap-4 p-3 cursor-pointer hover:border-gray-600 transition-colors active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#2A2A2A] flex-shrink-0">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={c.fish_type} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Fish className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{c.fish_type || 'Unknown'}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {c.length && (
                          <span className="text-[#CCFF00] text-sm font-semibold flex items-center gap-1">
                            <Ruler className="w-3 h-3" />
                            {c.length} cm
                          </span>
                        )}
                        {c.timestamp && (
                          <span className="text-gray-500 text-xs">{format(new Date(c.timestamp), 'h:mm a')}</span>
                        )}
                      </div>
                      {c.location_name && (
                        <p className="text-gray-600 text-xs flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />{c.location_name}
                        </p>
                      )}
                    </div>
                    <Edit2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  </motion.div>
                  <WeatherBadges catchData={c} compact />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <ShareSheet
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={session ? `${session.name} — Tackle Tally` : 'Fishing Session'}
        text={`Check out my fishing session "${session?.name}" on Tackle Tally! 🎣`}
        url={window.location.href}
      />

      {/* Edit Catch Modal */}
      {editingCatch && (
        <EditCatchModal
          catchData={editingCatch}
          onClose={() => setEditingCatch(null)}
          onSaved={() => { setEditingCatch(null); refetchCatches(); }}
          onDeleted={() => { setEditingCatch(null); refetchCatches(); }}
        />
      )}
    </div>
  );
}
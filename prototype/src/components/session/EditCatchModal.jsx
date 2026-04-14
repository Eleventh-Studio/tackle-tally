import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, ImagePlus, ChevronDown, Trash2 } from 'lucide-react';

const GOLD_COAST_FISH = [
  'Bream (Yellowfin)', 'Flathead (Dusky)', 'Whiting (Sand)', 'Trevally (Giant)',
  'Trevally (Golden)', 'Mangrove Jack', 'Snapper (Squire)', 'Barramundi',
  'Tailor', 'Tuna (Longtail)', 'Mackerel (Spanish)', 'Mackerel (Grey)',
  'Queenfish', 'Dart', 'Mulloway (Jewfish)', 'Tarpon', 'Flathead (Tiger)',
  'Cobia', 'Mahi-Mahi', 'Marlin', 'Wahoo', 'Reef Cod', 'Sweetlip',
  'Coral Trout', 'Parrotfish', 'Yellowtail Kingfish', 'Shark (Whaler)',
  'Ray (Bull)', 'Garfish', 'Luderick (Blackfish)', 'Other',
];

export default function EditCatchModal({ catchData, onClose, onSaved, onDeleted }) {
  const [fishType, setFishType] = useState(catchData.fish_type || '');
  const [length, setLength] = useState(catchData.length ? String(catchData.length) : '');
  const [photoPreview, setPhotoPreview] = useState(catchData.photo_url || null);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    let photo_url = catchData.photo_url;
    if (newPhotoFile) {
      const res = await base44.integrations.Core.UploadFile({ file: newPhotoFile });
      photo_url = res.file_url;
    }
    await base44.entities.Catch.update(catchData.id, {
      fish_type: fishType,
      length: length ? parseFloat(length) : null,
      photo_url,
    });
    setSaving(false);
    onSaved();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this catch?')) return;
    setDeleting(true);
    await base44.entities.Catch.delete(catchData.id);
    setDeleting(false);
    onDeleted();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-[#1A1A1A] rounded-t-3xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Handle + header */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Edit Catch</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Photo */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <div
            className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#2A2A2A] cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="catch" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded-xl font-semibold">
                  Change
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <ImagePlus className="w-8 h-8 text-gray-600" />
                <p className="text-gray-500 text-sm">Tap to add photo</p>
              </div>
            )}
          </div>

          {/* Species */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Species</p>
            <div className="relative">
              <input
                value={fishType}
                onChange={e => setFishType(e.target.value)}
                placeholder="Select or type species..."
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none pr-10"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              {showDropdown && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#2A2A2A] border border-gray-700 rounded-xl overflow-auto max-h-44 shadow-xl">
                  {GOLD_COAST_FISH.filter(f => f.toLowerCase().includes(fishType.toLowerCase())).map(fish => (
                    <button
                      key={fish}
                      onMouseDown={() => setFishType(fish)}
                      className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#333] transition-colors"
                    >
                      {fish}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Size (cm)</p>
            <input
              type="number"
              value={length}
              onChange={e => setLength(e.target.value)}
              placeholder="e.g. 48"
              className="w-full bg-[#2A2A2A] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-[#CCFF00] outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !fishType}
              className="flex-1 bg-[#CCFF00] text-[#121212] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
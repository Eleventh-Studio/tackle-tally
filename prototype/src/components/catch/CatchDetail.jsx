import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Ruler, Zap, Lock, Globe, Download } from 'lucide-react';

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

export default function CatchDetail({ catchData, isOpen, onClose }) {
  if (!catchData) return null;

  const formattedDate = catchData.timestamp
    ? format(new Date(catchData.timestamp), 'MMMM d, yyyy • h:mm a')
    : 'Unknown date';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[#1E1E1E] rounded-3xl overflow-hidden z-50 flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Download Button */}
            <button
              onClick={() => handleDownload(catchData.photo_url, `catch-${catchData.fish_type || 'photo'}.jpg`)}
              className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2"
              title="Download photo"
            >
              <Download className="w-6 h-6 text-white" />
            </button>

            {/* Photo */}
            <div className="relative aspect-square w-full flex-shrink-0">
              <img
                src={catchData.photo_url}
                alt={catchData.fish_type}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {catchData.has_exif_data && (
                  <div className="bg-[#FF5F1F] text-[#121212] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Zap className="w-4 h-4" fill="currentColor" />
                    <span className="text-xs font-bold uppercase">Big Brain</span>
                  </div>
                )}
                
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${catchData.is_private ? 'bg-gray-800 text-gray-300' : 'bg-blue-500 text-white'}`}>
                  {catchData.is_private ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span className="text-xs font-bold uppercase">{catchData.is_private ? 'Private' : 'Public'}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 overflow-y-auto">
              <h2 className="text-white text-2xl font-bold tracking-tight mb-4">
                {catchData.fish_type || 'Unknown Species'}
              </h2>

              <div className="space-y-4">
                {catchData.length && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5F1F]/10 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-[#FF5F1F]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Size</p>
                      <p className="text-white font-semibold">{catchData.length} cm</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#FF5F1F]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date & Time</p>
                    <p className="text-white font-semibold">{formattedDate}</p>
                  </div>
                </div>

                {(catchData.location_name || catchData.location_lat) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5F1F]/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#FF5F1F]" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Location</p>
                      <p className="text-white font-semibold">
                        {catchData.location_name || `${catchData.location_lat?.toFixed(4)}, ${catchData.location_lng?.toFixed(4)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
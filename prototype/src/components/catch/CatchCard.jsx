import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function CatchCard({ catchData, onClick }) {
  const formattedDate = catchData.timestamp 
    ? format(new Date(catchData.timestamp), 'MMM d, yyyy')
    : 'Unknown date';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-[#1E1E1E] rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Photo */}
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={catchData.photo_url}
          alt={catchData.fish_type}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />
      </div>

      {/* Big Brain Badge */}
      {catchData.has_exif_data && (
        <div className="absolute top-3 right-3 bg-[#FF5F1F] text-[#121212] px-3 py-1 rounded-full flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" fill="currentColor" />
          <span className="text-xs font-bold uppercase tracking-wide">Big Brain</span>
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-lg mb-2 tracking-tight">
          {catchData.fish_type || 'Unknown Species'}
        </h3>
        
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          {catchData.length && (
            <span className="text-[#FF5F1F] font-semibold">
              {catchData.length} cm
            </span>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {catchData.location_name && (
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{catchData.location_name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
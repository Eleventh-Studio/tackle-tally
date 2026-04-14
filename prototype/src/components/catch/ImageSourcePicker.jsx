import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, X } from 'lucide-react';

export default function ImageSourcePicker({ isOpen, onClose, onCameraSelect, onGallerySelect }) {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] rounded-t-3xl p-6 z-50 safe-area-bottom"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

            <h2 className="text-white text-xl font-bold text-center mb-6 tracking-tight">
              Select Source
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Camera Option */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onCameraSelect}
                className="bg-[#CCFF00] text-[#121212] rounded-2xl p-6 flex flex-col items-center gap-3"
              >
                <Camera className="w-10 h-10" strokeWidth={2.5} />
                <span className="font-bold text-lg">Camera</span>
              </motion.button>

              {/* Gallery Option */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onGallerySelect}
                className="bg-[#2A2A2A] text-white rounded-2xl p-6 flex flex-col items-center gap-3 border border-gray-700"
              >
                <Image className="w-10 h-10" strokeWidth={2.5} />
                <span className="font-bold text-lg">Gallery</span>
              </motion.button>
            </div>

            {/* Cancel */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full bg-[#2A2A2A] text-gray-400 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
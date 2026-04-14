import React from 'react';
import { motion } from 'framer-motion';
import { Fish, Plus } from 'lucide-react';

export default function EmptyVault({ onAddClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-[#1E1E1E] flex items-center justify-center mb-6">
        <Fish className="w-12 h-12 text-[#FF5F1F]" />
      </div>
      
      <h2 className="text-white text-2xl font-bold mb-3 tracking-tight">
        Your Vault is Empty
      </h2>
      
      <p className="text-gray-500 text-lg mb-8 max-w-xs">
        Time to log your first catch and start building your collection
      </p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAddClick}
        className="bg-[#FF5F1F] text-[#121212] px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
        Log First Catch
      </motion.button>
    </motion.div>
  );
}
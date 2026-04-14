import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Twitter, Facebook, Check } from 'lucide-react';

export default function ShareSheet({ isOpen, onClose, title, text, url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = text || title || 'Check this out on FLICK-META!';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, text: shareText, url: shareUrl });
      onClose();
    }
  };

  const hasNativeShare = !!navigator.share;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1E1E] rounded-t-3xl border-t border-gray-700 p-6 pb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white font-bold text-lg">Share</p>
                {title && <p className="text-gray-500 text-sm truncate max-w-[260px]">{title}</p>}
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-5">
              {hasNativeShare && (
                <button
                  onClick={nativeShare}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#121212]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span className="text-gray-400 text-xs">More</span>
                </button>
              )}
              <button onClick={shareTwitter} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-[#2A2A2A] border border-gray-700 flex items-center justify-center">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-400 text-xs">X / Twitter</span>
              </button>
              <button onClick={shareFacebook} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-[#2A2A2A] border border-gray-700 flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-[#1877F2]" />
                </div>
                <span className="text-gray-400 text-xs">Facebook</span>
              </button>
              <button onClick={copyLink} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors ${copied ? 'bg-[#CCFF00]/20 border-[#CCFF00]' : 'bg-[#2A2A2A] border-gray-700'}`}>
                  {copied ? <Check className="w-6 h-6 text-[#CCFF00]" /> : <Link className="w-6 h-6 text-gray-300" />}
                </div>
                <span className="text-gray-400 text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* URL preview */}
            <div className="bg-[#2A2A2A] rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-700">
              <Link className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-400 text-sm truncate flex-1">{shareUrl}</span>
              <button onClick={copyLink} className="text-[#CCFF00] text-xs font-bold flex-shrink-0">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
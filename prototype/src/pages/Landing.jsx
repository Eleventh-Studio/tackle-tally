import React from 'react';
import { base44 } from '@/api/base44Client';
import { Fish, Waves, MapPin, BarChart2, Images } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const handleLogin = () => {
    base44.auth.loginWithProvider('google', '/');
  };

  const handleEmail = () => {
    base44.auth.redirectToLogin('/');
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-between px-6 py-12">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-3xl bg-[#CCFF00] flex items-center justify-center mb-6 shadow-lg shadow-[#CCFF00]/20"
        >
          <Fish className="w-10 h-10 text-[#121212]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-white text-4xl font-black tracking-tight leading-none mb-2">TACKLE TALLY</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">Your Personal Fishing Log</p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {[
            { icon: Fish, label: 'Log Catches' },
            { icon: MapPin, label: 'GPS Map' },
            { icon: Images, label: 'Gallery' },
            { icon: BarChart2, label: 'Charts' },
            { icon: Waves, label: 'Conditions' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-[#1E1E1E] border border-gray-800 px-3 py-1.5 rounded-full">
              <Icon className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="text-gray-300 text-xs font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Auth buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full space-y-3"
        >
          {/* Google */}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#121212] font-bold py-4 rounded-2xl text-base hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Email / other */}
          <button
            onClick={handleEmail}
            className="w-full flex items-center justify-center gap-3 bg-[#1E1E1E] border border-gray-700 text-white font-bold py-4 rounded-2xl text-base hover:border-gray-500 transition-colors"
          >
            Sign in / Sign up with Email
          </button>
        </motion.div>

        <p className="text-gray-600 text-xs mt-6">
          By continuing, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
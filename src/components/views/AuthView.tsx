import React from 'react';
import { useAuth } from '../FirebaseProvider';
import { Target, Star, Coins } from 'lucide-react';
import { motion } from 'motion/react';

const AuthView: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative background shapes */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-game-yellow/10 blur-3xl"></div>
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-game-purple/5 blur-3xl"></div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-12 flex h-40 w-40 items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-[48px] border-4 border-dashed border-gray-200"
          ></motion.div>
          
          <div className="z-10 flex h-32 w-32 items-center justify-center rounded-[40px] bg-white shadow-2xl ring-8 ring-white p-6 border border-gray-100">
             <div className="flex h-full w-full items-center justify-center rounded-[24px] bg-gradient-to-br from-[#1a1a1a] to-black shadow-inner">
                <Target size={40} className="text-game-yellow" />
             </div>
          </div>
          
          <motion.div 
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -right-4 -top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-game-yellow text-gray-900 shadow-xl ring-4 ring-white"
          >
             <Coins size={28} fill="currentColor" className="drop-shadow-sm" />
          </motion.div>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 leading-[0.8] mb-2">
            COIN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-yellow-dark to-game-yellow italic">KING</span>
          </h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">The Master of Rewards</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-16 w-full max-w-sm"
      >
        <button
          onClick={login}
          className="premium-3d-button-yellow w-full rounded-[28px] py-7 flex items-center justify-center gap-4 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10">
            <Star className="text-black" fill="currentColor" size={18} />
          </div>
          <span className="text-xl font-black text-black tracking-widest uppercase italic">Start Earning</span>
        </button>

        <div className="flex items-center gap-4 py-8">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">Verified Access</span>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        <div className="premium-card p-6 bg-white/50 backdrop-blur-sm border-white text-center">
           <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
             Join <span className="text-black font-black underline decoration-game-yellow decoration-2 underline-offset-2">10,000+ Players</span> turning playtime into profit. 
             10,000 Coins = $1.00 USD. Fast Instant payouts.
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;

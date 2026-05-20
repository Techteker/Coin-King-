import React, { useState } from 'react';
import { useAuth } from '../FirebaseProvider';
import { Target, Star, Coins, Mail, Lock, User, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AuthView: React.FC = () => {
  const { login, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }
    if (isSignUp && !displayName) {
      setError("Please enter your name.");
      return;
    }
    
    setError(null);
    setLoadingState(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 overflow-y-auto relative bg-gray-50/30">
      {/* Decorative background shapes */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-game-yellow/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-game-purple/5 blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center w-full max-w-sm mb-6"
      >
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-[32px] border-4 border-dashed border-gray-200"
          ></motion.div>
          
          <div className="z-10 flex h-22 w-22 items-center justify-center rounded-[28px] bg-white shadow-xl ring-6 ring-white p-4 border border-gray-100">
             <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-gradient-to-br from-[#1a1a1a] to-black shadow-inner">
                <Target size={28} className="text-game-yellow" />
             </div>
          </div>
          
          <motion.div 
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-game-yellow text-gray-900 shadow-lg ring-3 ring-white"
          >
             <Coins size={20} fill="currentColor" className="drop-shadow-sm" />
          </motion.div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-[0.8] mb-1">
            COIN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-yellow-dark to-game-yellow italic">KING</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">The Master of Rewards</p>
        </div>
      </motion.div>

      {/* APK Friendly Helper Alert */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm mb-6 bg-blue-50/80 border border-blue-100 p-3.5 rounded-2xl flex items-start gap-2.5 shadow-sm"
      >
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-tight">App (APK) Users Signup Guide</h4>
          <p className="text-[10px] text-blue-700 font-bold mt-0.5 leading-snug uppercase">
            If sign-in via Google fails or shows storage errors in your phone app, please register or login using the <span className="underline font-black">Email & Password</span> option below instead.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {/* Sign In vs Sign Up Tab Switcher */}
          <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${!isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 ${isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AnimatePresence mode="popLayout">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="relative"
                >
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="ENTER YOUR FULL NAME"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-2xl bg-gray-50/70 p-4 pl-12 text-xs font-bold text-gray-900 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-300 uppercase tracking-wide"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50/70 p-4 pl-12 text-xs font-bold text-gray-900 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50/70 p-4 pl-12 text-xs font-bold text-gray-900 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            {/* Error Message Render */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-2xl text-[11px] font-bold flex items-center gap-2 border border-red-100 leading-tight"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Action Buttons */}
            <button
              type="submit"
              disabled={loadingState}
              className="premium-3d-button-yellow w-full rounded-2xl py-4.5 flex items-center justify-center gap-2 mt-4 transition-all duration-200 disabled:opacity-50"
            >
              <span className="text-sm font-black text-black tracking-wider uppercase italic">
                {loadingState ? 'Processing...' : isSignUp ? 'Create account' : 'Sign in to account'}
              </span>
            </button>
          </form>

          {/* Social login option */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100"></div>
            <span className="text-[9px] font-black text-gray-300 tracking-widest uppercase">Or Web Sign-In</span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <button
            type="button"
            onClick={login}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all text-xs font-black uppercase tracking-wider text-gray-700"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5">
              <Star className="text-gray-900" fill="currentColor" size={12} />
            </div>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="flex items-center gap-4 py-6">
          <div className="h-px flex-1 bg-gray-200"></div>
          <span className="text-[9px] font-black text-gray-300 tracking-widest uppercase">Safe & Encrypted</span>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        <div className="premium-card p-5 bg-white/50 backdrop-blur-sm border-white text-center">
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

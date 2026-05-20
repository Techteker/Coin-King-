import React, { useState, useRef } from 'react';
import { useAuth } from '../FirebaseProvider';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Target, Volume2, Users, Star, ShieldCheck, ChevronLeft, Coins, Gift, X, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { CustomGoldCoin } from '../CustomGoldCoin';

interface Segment {
  label: string;
  multiplier: number;
  color: string;
  weight: number;
  textColor: string;
}

const segments: Segment[] = [
  { label: '0×', multiplier: 0, color: '#1a1a1a', weight: 40, textColor: '#666666' },
  { label: '1×', multiplier: 1, color: '#3b82f6', weight: 40, textColor: '#ffffff' },
  { label: '2×', multiplier: 2, color: '#8b5cf6', weight: 10, textColor: '#ffffff' },
  { label: '3×', multiplier: 3, color: '#ec4899', weight: 5, textColor: '#ffffff' },
  { label: '4×', multiplier: 4, color: '#f97316', weight: 4, textColor: '#ffffff' },
  { label: '5×', multiplier: 5, color: '#eab308', weight: 1, textColor: '#000000' },
];

const SpinnerView: React.FC = () => {
  const { profile } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<Segment | null>(null);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  // Sound placeholders
  const playSpinSound = () => {
    if (!isMuted) {
      // Audio logic here
    }
  };

  const playWinSound = (multiplier: number) => {
    if (!isMuted) {
      // Audio logic here based on multiplier intensity
    }
  };

  const [betAmount, setBetAmount] = useState(10);
  const presets = [10, 50, 100, 500, 1000];

  const handleSpin = async () => {
    if (isSpinning || !profile) return;
    if (profile.balance < betAmount) {
      alert("Insufficient balance to spin!");
      return;
    }
    
    setIsSpinning(true);
    playSpinSound();

    // Deduct bet amount immediately
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        balance: increment(-betAmount)
      });
    } catch (error) {
      console.error("Failed to deduct bet:", error);
      setIsSpinning(false);
      return;
    }

    // 1. Determine winner based on probability weights
    const random = Math.floor(Math.random() * 100);
    let cumulativeWeight = 0;
    let winnerIndex = 0;

    for (let i = 0; i < segments.length; i++) {
       cumulativeWeight += segments[i].weight;
       if (random < cumulativeWeight) {
         winnerIndex = i;
         break;
       }
    }

    const winner = segments[winnerIndex];
    
    // 2. Calculate rotation
    const segmentAngle = 360 / segments.length;
    const extraSpins = 8 + Math.floor(Math.random() * 5); 
    
    // To land winner 'i' at top (0 deg):
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const newRotation = rotation + (extraSpins * 360) + (targetAngle - (rotation % 360));

    setRotation(newRotation);

    await controls.start({
      rotate: newRotation,
      transition: { 
        duration: 5, 
        ease: [0.2, 0.8, 0.2, 1]
      }
    });

    // 3. Handle result
    setWinningSegment(winner);
    const winAmount = betAmount * winner.multiplier;
    setRewardCoins(winAmount);

    if (winner.multiplier >= 3) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: [winner.color, '#ffffff', '#ffd700']
      });
    }

    if (winAmount > 0) {
      try {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          balance: increment(winAmount)
        });

        await addDoc(collection(db, 'transactions'), {
          userId: profile.uid,
          type: 'spin',
          amount: winAmount,
          createdAt: new Date().toISOString()
        });

        // Referral Commission (10% Lifetime)
        if (profile.referredBy) {
          const commission = Math.floor(winAmount * 0.1);
          if (commission > 0) {
            const referrerRef = doc(db, 'users', profile.referredBy);
            await updateDoc(referrerRef, {
              balance: increment(commission),
              totalReferralEarnings: increment(commission)
            });

            await addDoc(collection(db, 'transactions'), {
              userId: profile.referredBy,
              type: 'referral',
              amount: commission,
              createdAt: new Date().toISOString(),
              remark: `Commission from ${profile.displayName || 'Friend'}`
            });
          }
        }
      } catch (error) {
        console.error("Failed to update credits:", error);
      }
    }

    playWinSound(winner.multiplier);
    setTimeout(() => {
      setShowResult(true);
      setIsSpinning(false);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center pb-12 pt-4 px-6 min-h-full text-gray-900">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
           <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <ChevronLeft size={20} className="text-gray-500" />
           </div>
           <div>
              <h2 className="text-xl font-black italic tracking-tighter uppercase text-gray-900">Spin Wheel</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Rewards</p>
           </div>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm"
        >
          <Volume2 size={20} className={cn("transition-colors", isMuted ? "text-gray-300" : "text-game-yellow")} />
        </button>
      </div>

      {/* Main Wheel Container */}
      <div className="relative mb-16 flex flex-col items-center justify-center">
        {/* Glow Background */}
        <div className="absolute inset-0 bg-game-yellow/20 blur-[100px] rounded-full scale-150 pointer-events-none"></div>

        {/* Needle Indicator */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
           <motion.div 
             animate={isSpinning ? { rotate: [-5, 5, -5] } : { rotate: 0 }}
             transition={{ duration: 0.15, repeat: Infinity }}
             className="w-10 h-14 bg-gray-900" 
             style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
           ></motion.div>
           <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-700 rounded-full"></div>
        </div>

        {/* Outer Glowing Ring */}
        <div className="relative h-[320px] w-[320px] rounded-full p-4 bg-white border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
          <div className="h-full w-full rounded-full border-[10px] border-white shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden relative bg-gray-50">
            
            {/* Spinning Wheel */}
            <motion.div
              ref={wheelRef}
              animate={controls}
              initial={{ rotate: 0 }}
              className="relative h-full w-full rounded-full overflow-hidden"
              style={{ rotate: 0 }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {segments.map((seg, idx) => {
                  const startAngle = (idx * 360) / segments.length;
                  const endAngle = ((idx + 1) * 360) / segments.length;
                  const x1 = 50 + 50 * Math.cos((Math.PI / 180) * startAngle);
                  const y1 = 50 + 50 * Math.sin((Math.PI / 180) * startAngle);
                  const x2 = 50 + 50 * Math.cos((Math.PI / 180) * endAngle);
                  const y2 = 50 + 50 * Math.sin((Math.PI / 180) * endAngle);
                  
                  return (
                    <path
                      key={idx}
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      className="transition-colors duration-300"
                    />
                  );
                })}
              </svg>

              {/* Labels */}
              {segments.map((seg, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-start justify-center"
                  style={{ transform: `rotate(${idx * (360 / segments.length) + (360 / segments.length / 2)}deg)` }}
                >
                  <div className="pt-8 flex flex-col items-center">
                    <span 
                      className="text-2xl font-black italic tracking-tighter"
                      style={{ color: seg.textColor, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                    >
                      {seg.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Inner Ring Glow */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.1)] pointer-events-none"></div>
          </div>

          {/* Center Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
             <div className="h-14 w-14 rounded-full bg-white p-1 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] ring-4 ring-gray-50">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-100 to-white flex items-center justify-center shadow-inner">
                   <Target className="text-gray-900" size={24} />
                </div>
             </div>
             {/* Glowing Dot */}
             <div className="absolute -top-1 -right-1 h-3 w-3 bg-game-yellow rounded-full blur-[1px] animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Betting Box (Coin Box) */}
      <div className="w-full max-w-sm mb-10">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Betting Coin Box</span>
           <div className="flex items-center gap-1.5 bg-game-yellow/10 pl-1.5 pr-3 py-1 rounded-full border border-game-yellow/20">
              <CustomGoldCoin className="h-5 w-5 object-contain" />
              <span className="text-[10px] font-black text-game-yellow uppercase tracking-tight">{betAmount} Coins</span>
           </div>
        </div>
        <div className="premium-card p-4 space-y-4">
           <div className="grid grid-cols-5 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBetAmount(preset)}
                  className={cn(
                    "py-3 rounded-xl text-[10px] font-black transition-all border",
                    betAmount === preset 
                      ? "bg-game-yellow border-game-yellow text-black shadow-lg shadow-yellow-200" 
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                  )}
                >
                  {preset}
                </button>
              ))}
           </div>
           <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setBetAmount(Math.max(10, betAmount - 10))}
                className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                -
              </button>
              <div className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                 <span className="text-sm font-black italic tracking-tighter text-gray-900">{betAmount}</span>
              </div>
              <button 
                onClick={() => setBetAmount(betAmount + 10)}
                className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                +
              </button>
           </div>
        </div>
      </div>

      {/* Spin Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSpin}
        disabled={isSpinning}
        className={cn(
          "premium-3d-button-yellow relative w-full max-w-sm rounded-[32px] py-7 flex items-center justify-center gap-4 group overflow-hidden transition-all duration-300",
          isSpinning && "opacity-50 grayscale cursor-not-allowed"
        )}
      >
        <span className="text-2xl font-black tracking-[0.2em] text-black uppercase italic relative z-10">
          {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
        </span>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        
        {/* Shine Animation */}
        {!isSpinning && (
          <motion.div
            animate={{ x: [-200, 400] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 h-full w-12 skew-x-30 bg-white/40 blur-xl"
          />
        )}
      </motion.button>

      {/* Action Links */}
      <div className="mt-8 flex gap-8">
        <button className="flex flex-col items-center gap-2 group">
           <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-game-yellow group-hover:bg-game-yellow/5 group-hover:border-game-yellow/20 transition-all shadow-sm">
              <Users size={20} />
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invite</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
           <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-game-yellow group-hover:bg-game-yellow/5 group-hover:border-game-yellow/20 transition-all shadow-sm">
              <Star size={20} />
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
           <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-game-yellow group-hover:bg-game-yellow/5 group-hover:border-game-yellow/20 transition-all shadow-sm">
              <ShieldCheck size={20} />
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rules</span>
        </button>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && winningSegment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-white/80 backdrop-blur-md"
               onClick={() => setShowResult(false)}
             />
             
             <motion.div
               initial={{ scale: 0.5, opacity: 0, y: 100 }}
               animate={winningSegment.multiplier === 0 
                ? { scale: 1, opacity: 1, y: 0, x: [0, -10, 10, -10, 10, 0], transition: { x: { delay: 0.3, duration: 0.5 } } }
                : { scale: 1, opacity: 1, y: 0 }
               }
               exit={{ scale: 0.5, opacity: 0, y: 100 }}
               className="relative overflow-hidden w-full max-w-sm rounded-[48px] bg-white border border-gray-100 p-8 pt-16 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] text-center"
             >
                {/* Result Decoration */}
                <div 
                  className="absolute top-0 inset-x-0 h-40 opacity-10 pointer-events-none" 
                  style={{ background: `radial-gradient(circle at top, ${winningSegment.color}, transparent)` }}
                ></div>

                <button 
                  onClick={() => setShowResult(false)}
                  className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="relative mb-10 flex justify-center">
                   <motion.div
                     initial={{ scale: 0, rotate: -45 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                     className="h-36 w-36 rounded-[44px] flex items-center justify-center p-8 bg-gray-50 border border-gray-100 ring-12 ring-gray-50"
                   >
                     {winningSegment.multiplier > 0 ? (
                       <div className="relative">
                          <Gift size={72} style={{ color: winningSegment.color }} fill="currentColor" />
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-8 rounded-full blur-2xl"
                            style={{ backgroundColor: winningSegment.color }}
                          />
                       </div>
                     ) : (
                       <Trophy size={72} className="text-gray-200" />
                     )}
                   </motion.div>
                </div>

                <h3 className={cn(
                  "text-4xl font-black italic tracking-tighter leading-tight mb-3 uppercase drop-shadow-sm",
                  winningSegment.multiplier > 0 ? "text-gray-900" : "text-gray-300"
                )}>
                  {winningSegment.multiplier > 0 ? 'CONGRATS!' : 'OH NO!'}
                </h3>
                
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6">
                  {winningSegment.multiplier > 0 ? 'You Won A Reward' : 'Better Luck Next Spin'}
                </p>

                <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 mb-10 shadow-inner">
                    <div className="flex items-center justify-center gap-4">
                       <div className="h-12 w-12 rounded-full bg-game-yellow/20 flex items-center justify-center shadow-lg shadow-yellow-100">
                          <CustomGoldCoin className="h-7 w-7 object-contain" />
                       </div>
                       <span className="text-5xl font-black italic tracking-tighter text-gray-900">
                         {rewardCoins} <span className="text-xs text-gray-400 uppercase not-italic tracking-widest ml-2">Coins</span>
                       </span>
                    </div>
                   <div className="mt-4 inline-block px-4 py-1 rounded-full bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                     Multiplier: {winningSegment.label}
                   </div>
                </div>

                <button
                  onClick={() => setShowResult(false)}
                  className="premium-3d-button-yellow w-full rounded-[28px] py-6 flex items-center justify-center gap-3 shadow-xl"
                >
                  <span className="text-xl font-black uppercase italic tracking-widest text-black">
                     {winningSegment.multiplier > 0 ? 'Claim Reward' : 'Try Again'}
                  </span>
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinnerView;

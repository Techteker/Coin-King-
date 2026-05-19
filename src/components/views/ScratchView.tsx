import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Coins, Trophy, Sparkles, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../FirebaseProvider';
import { db } from '../../lib/firebase';
import { doc, updateDoc, increment, addDoc, collection, getDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { CustomGoldCoin } from '../CustomGoldCoin';

const SCRATCH_LIMIT = 10;

const ScratchView: React.FC = () => {
  const { profile } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [currentReward, setCurrentReward] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  
  const dailyCount = profile?.dailyScratchCount || 0;
  const isLimitReached = dailyCount >= SCRATCH_LIMIT;

  // Algorithm for reward calculation based on user request
  const getReward = useCallback((totalScratches: number) => {
    // New user phase: 180, 170, 160... down to 50
    if (totalScratches < 14) {
      const reward = 180 - (totalScratches * 10);
      return Math.max(50, reward);
    }
    
    // Existing user logic: 40, 30, 20, 10
    if (totalScratches < 18) {
      const subIndex = totalScratches - 14;
      const secondPhaseRewards = [40, 30, 20, 10];
      return secondPhaseRewards[subIndex] || 10;
    }
    
    // Post-18 logic: Cycles around 10-30 as requested
    const cycleIndex = (totalScratches - 18) % 4;
    const cycleRewards = [10, 20, 30, 20];
    return cycleRewards[cycleIndex];
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use dimensions from container to handle transitions better
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width === 0 || height === 0) return;

    // Set internal resolution
    canvas.width = width;
    canvas.height = height;

    // 1. CLEAR & FILL BASE GOLD (Solid and Opaque)
    ctx.globalCompositeOperation = 'source-over';
    
    // Multiple layers for extreme opacity
    ctx.fillStyle = '#D4AF37'; 
    ctx.fillRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);

    // 2. Shiny Metallic Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#B8860B'); 
    gradient.addColorStop(0.2, '#F9E29C'); 
    gradient.addColorStop(0.5, '#FFD700'); 
    gradient.addColorStop(0.8, '#F9E29C'); 
    gradient.addColorStop(1, '#8B4513'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 3. Texture Pattern (Denser)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    for (let i = -width; i < width + height; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // 4. Repeated Premium Marking
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.font = 'black 14px sans-serif';
    ctx.textAlign = 'center';
    for (let y = 40; y < height; y += 80) {
      for (let x = 60; x < width; x += 120) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 10);
        ctx.fillText('NEXVY GOLD', 0, 0);
        ctx.restore();
      }
    }

    // Centered Visuals
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    
    // Draw an emblem-like circle in center
    ctx.beginPath();
    ctx.arc(width/2, height/2 - 10, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = '900 32px sans-serif';
    ctx.fillText('LUCKY', width / 2, height / 2 - 15);
    ctx.fillText('SCRATCH', width / 2, height / 2 + 15);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '800 12px sans-serif';
    ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2 + 50);
    
    setIsScratched(false);
    setScratchPercentage(0);
    
    // Safety: ensure currentReward is set
    if (!currentReward) {
      const reward = getReward(profile?.totalScratches || 0);
      setCurrentReward(reward);
    }
  }, [getReward, profile?.totalScratches, currentReward]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });

    resizeObserver.observe(container);
    
    // Initial call or when currentReward is reset to null
    const timer = setTimeout(initCanvas, 150);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [initCanvas, currentReward]);

  const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLimitReached || isScratched || !currentReward) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    checkScratchProgress();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) {
        transparentCount++;
      }
    }

    const percentage = (transparentCount / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    if (percentage > 40 && !isScratched) {
      revealCard();
    }
  };

  const revealCard = () => {
    setIsScratched(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Play sound/vibrate
    if (navigator.vibrate) navigator.vibrate(50);
    
    setTimeout(() => {
      setShowWinPopup(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF']
      });
    }, 500);
  };

  const handleClaim = async () => {
    if (!profile || !currentReward || isClaiming) return;
    setIsClaiming(true);

    try {
      const userRef = doc(db, 'users', profile.uid);
      const today = new Date().toISOString().split('T')[0];
      
      // Update profile
      await updateDoc(userRef, {
        balance: increment(currentReward),
        totalScratches: increment(1),
        dailyScratchCount: (profile.lastScratchDate === today) ? increment(1) : 1,
        lastScratchDate: today
      });

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        type: 'scratch',
        amount: currentReward,
        createdAt: new Date().toISOString()
      });

      // Referral Commission (10% Lifetime)
      if (profile.referredBy) {
        const commission = Math.floor(currentReward * 0.1);
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

      // Add to scratch_rewards collection as requested
      await addDoc(collection(db, 'scratch_rewards'), {
        userId: profile.uid,
        reward: currentReward,
        scratchedAt: new Date().toISOString(),
        dayKey: today,
        scratchCount: (profile.lastScratchDate === today) ? (profile.dailyScratchCount || 0) + 1 : 1
      });

      setShowWinPopup(false);
      setIsScratched(false);
      setCurrentReward(null);
      
      // Random Lucky Day Bonus
      if (Math.random() < 0.1) {
         // Logic for random extra bonus could go here
      }

    } catch (error) {
      console.error("Claim failed:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20">
      {/* Header section like other views */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center pt-4">
        <div className="h-16 w-16 rounded-[24px] bg-white border border-purple-100 flex items-center justify-center shadow-sm mb-2">
          <Sparkles size={32} className="text-purple-600" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Scratch & Earn</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Premium Gold Cards</p>
      </div>

      {/* Progress Info */}
      <div className="flex items-center justify-between px-4">
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Limit</span>
            <span className={cn(
              "text-lg font-black italic tracking-tighter",
              isLimitReached ? "text-red-500" : "text-gray-900"
            )}>
              {dailyCount} / {SCRATCH_LIMIT} used
            </span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Reset</span>
            <span className="text-xs font-bold text-game-purple uppercase">In 24 Hours</span>
         </div>
      </div>

      {/* Scratch Card Container */}
      <div className="px-4">
        <div 
          ref={containerRef}
          className={cn(
            "relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl transition-all duration-500",
            isLimitReached ? "grayscale opacity-50 pointer-events-none" : "hover:scale-[1.02]"
          )}
        >
          {/* Background / Reward Layer - Now Gold as requested */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#D4AF37] flex flex-col items-center justify-center p-8">
            {currentReward && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="h-24 w-24 rounded-[32px] bg-white/20 border border-white/40 flex items-center justify-center mb-4 backdrop-blur-sm">
                  <CustomGoldCoin className="h-16 w-16 drop-shadow-[0_4px_10px_rgba(0,0,0,0.2)]" />
                </div>
                <span className="text-[12px] font-black text-black/40 uppercase tracking-[0.3em] mb-2 text-center">YOU REVEALED</span>
                <span className="text-6xl font-black text-black italic tracking-tighter">+{currentReward}</span>
                <span className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mt-2">Claim in the popup!</span>
              </motion.div>
            )}
          </div>

          {/* Canvas Scratch Layer */}
          <canvas
            ref={canvasRef}
            className={cn(
              "absolute inset-0 z-10 touch-none cursor-crosshair transition-opacity duration-300",
              isScratched ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            onMouseMove={(e) => e.buttons === 1 && handleScratch(e)}
            onMouseDown={handleScratch}
            onTouchMove={handleScratch}
            onTouchStart={handleScratch}
          />

          {/* Instruction Overlay */}
          {!isScratched && !isLimitReached && scratchPercentage === 0 && (
            <div className="absolute inset-x-0 bottom-8 z-20 pointer-events-none flex flex-col items-center animate-bounce">
               <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Rub surface to reveal</span>
               </div>
            </div>
          )}

          {/* Limit Reached Mask */}
          {isLimitReached && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center">
              <div className="h-16 w-16 rounded-3xl bg-red-500/20 flex items-center justify-center mb-4">
                <Info size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Limit Reached</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Come back tomorrow for more premium rewards!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats / Info Footer */}
      <div className="px-4">
        <div className="premium-card p-6 grid grid-cols-2 gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Trophy size={80} />
          </div>
          
          <div className="flex flex-col gap-1 relative z-10">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Earned</span>
             <div className="flex items-center gap-1.5">
                <CustomGoldCoin className="h-4.5 w-4.5 object-contain" />
                <span className="text-sm font-black italic text-gray-900">Premium Reward</span>
             </div>
          </div>

          <div className="flex flex-col gap-1 items-end relative z-10">
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">New User Bonus</span>
             <span className="text-xs font-black text-purple-600 uppercase">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Reward Popup */}
      <AnimatePresence>
        {showWinPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[44px] overflow-hidden shadow-2xl relative p-8 text-center"
            >
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-50 to-transparent"></div>
              
              <div className="relative z-10">
                 <div className="h-24 w-24 rounded-[36px] bg-white shadow-xl shadow-purple-100 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                    <img 
                      src="https://img.icons8.com/fluency/96/stack-of-coins.png" style={{ display: 'none' }} /> <CustomGoldCoin className="h-16 w-16" /> <span style={{ display: 'none' }}
                      alt="Reward" 
                      className="h-16 w-16"
                      referrerPolicy="no-referrer"
                    ></span>
                 </div>

                 <h2 className={cn(
                   "text-3xl font-black italic tracking-tighter text-gray-900 uppercase leading-none mb-1",
                   currentReward === 199 && "text-purple-600 animate-pulse"
                 )}>
                   {currentReward === 199 ? 'JACKPOT!' : 'AMAZING WIN!'}
                 </h2>
                 <div className="flex items-center justify-center gap-2 mb-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[.3em]">Premium Coins Rewarded</p>
                    <CustomGoldCoin className="h-4 w-4 object-contain inline-block" />
                 </div>

                 <div className="bg-gray-50 rounded-[32px] p-6 mb-8 border border-gray-100 italic">
                    <div className="flex items-baseline justify-center gap-1">
                       <span className="text-5xl font-black text-gray-900 tracking-tighter">+{currentReward}</span>
                       <span className="text-lg font-black text-gray-400">COINS</span>
                    </div>
                 </div>

                 <button
                   onClick={handleClaim}
                   disabled={isClaiming}
                   className="premium-3d-button-yellow w-full rounded-[28px] py-6 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                 >
                   <span className="text-lg font-black text-black uppercase italic tracking-widest">
                     {isClaiming ? 'REWARDING...' : 'CLAIM REWARD'}
                   </span>
                   {isClaiming ? (
                      <RotateCcw size={20} className="animate-spin text-black" />
                   ) : (
                      <Sparkles size={20} className="text-black" />
                   )}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScratchView;

import React from 'react';
import { useAuth } from '../FirebaseProvider';
import { Coins, CheckCircle2, ChevronLeft, Gift } from 'lucide-react';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const DailyBonusView: React.FC = () => {
  const { profile } = useAuth();
  
  const rewards = [
    { day: 1, coins: 100 },
    { day: 2, coins: 200 },
    { day: 3, coins: 300 },
    { day: 4, coins: 400 },
    { day: 5, coins: 500 },
    { day: 6, coins: 600 },
    { day: 7, coins: 1000 },
  ];

  const lastClaimDate = profile?.lastDailyClaim ? new Date(profile.lastDailyClaim).toDateString() : null;
  const today = new Date().toDateString();
  const isClaimedToday = lastClaimDate === today;
  const currentDay = (profile?.dailyStreak || 0) % 7 + 1;

  const handleClaim = async (dayNum: number) => {
    if (isClaimedToday || dayNum !== currentDay) return;

    const reward = rewards[dayNum - 1].coins;
    const userRef = doc(db, 'users', profile!.uid);
    
    await updateDoc(userRef, {
      balance: increment(reward),
      lastDailyClaim: new Date().toISOString(),
      dailyStreak: increment(1)
    });

    await addDoc(collection(db, 'transactions'), {
      userId: profile!.uid,
      type: 'daily',
      amount: reward,
      createdAt: new Date().toISOString()
    });

    // Referral Commission (10% Lifetime)
    if (profile?.referredBy) {
      const commission = Math.floor(reward * 0.1);
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
          remark: `Commission from ${profile.email || 'Friend'}`
        });
      }
    }
  };

  return (
    <div className="mx-auto max-w-lg pb-32">
      {/* Premium Header */}
      <div className="text-center space-y-2 mb-10 pt-4">
         <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Daily Reward</h2>
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Consistency is the key to gold</p>
      </div>

      <div className="px-4 space-y-4">
        {rewards.map((item, idx) => {
          const isPast = profile?.dailyStreak && (profile.dailyStreak % 7) >= item.day;
          const isCurrent = currentDay === item.day && !isClaimedToday;
          const isLocked = !isPast && !isCurrent;
          
          return (
            <motion.div 
              key={item.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => isCurrent && handleClaim(item.day)}
              className={cn(
                "group relative overflow-hidden rounded-[32px] p-1 shadow-sm transition-all border",
                isCurrent ? "bg-white border-blue-500 shadow-xl shadow-blue-100 scale-[1.02]" : "bg-white border-gray-50 opacity-100",
                isLocked && "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className="flex items-center p-2 pr-3">
                 {/* Day Icon */}
                 <div className={cn(
                    "flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[28px] transition-all",
                    isCurrent ? "bg-blue-50" : "bg-gray-50/50"
                 )}>
                    <div className="relative">
                       <Gift size={32} className={cn(isCurrent ? "text-blue-500" : "text-gray-300")} />
                       {isCurrent && <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-ping"></div>}
                    </div>
                 </div>

                 {/* Text Info */}
                 <div className="flex-1 px-5">
                    <h3 className="text-lg font-black text-gray-900 italic tracking-tighter uppercase leading-none">Day {item.day}</h3>
                    <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       {isCurrent ? 'Ready to Claim' : isPast ? 'Reward Collected' : 'Coming Soon'}
                    </p>
                 </div>

                 {/* Reward Badge */}
                 <div className={cn(
                    "shine-effect flex h-16 w-24 flex-shrink-0 items-center justify-center gap-1 rounded-2xl text-xl font-black italic tracking-tighter shadow-lg transition-all",
                    isPast 
                      ? "bg-emerald-500 text-white shadow-emerald-100" 
                      : isCurrent 
                        ? "dark-premium-gradient text-white shadow-indigo-200" 
                        : "bg-gray-100 text-gray-300 shadow-none border border-gray-200"
                 )}>
                    {isPast ? (
                      <CheckCircle2 size={28} strokeWidth={3} />
                    ) : (
                      <>
                        <img src="https://img.icons8.com/fluency/48/coin.png" className="h-4 w-4" alt="coin" referrerPolicy="no-referrer" />
                        <span>{item.coins}</span>
                      </>
                    )}
                 </div>
              </div>
              
              {isCurrent && (
                 <div className="absolute inset-0 border-2 border-blue-500/20 rounded-[32px] pointer-events-none"></div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyBonusView;

import React from 'react';
import { Target, Gift, ShoppingBag, Grid3x3, ImageIcon, Wallet, Zap, Highlighter, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface DashboardViewProps {
  onNavigate: (tab: 'dashboard' | 'shop' | 'spinner' | 'daily' | 'withdraw' | 'scratch' | 'referral') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const activities = [
    { id: 'daily', icon: Gift, label: 'Gift Bonus', color: 'bg-orange-50 text-orange-500 border-orange-100', tab: 'daily', desc: 'Claim Daily Coins' },
    { id: 'shop', icon: ShoppingBag, label: 'Luck Offer', color: 'bg-emerald-50 text-emerald-500 border-emerald-100', tab: 'shop', desc: 'Limited Deals' },
    { id: 'scratch', icon: Highlighter, label: 'Scratch', color: 'bg-rose-50 text-rose-500 border-rose-100', tab: 'scratch', desc: 'Reveal Rewards' },
    { id: 'referral', icon: Users, label: 'Refer', color: 'bg-indigo-50 text-indigo-500 border-indigo-100', tab: 'referral', desc: '10% Commission' },
  ] as const;

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-32 pt-2">
      {/* Premium Hero Banner */}
      <div className="px-4">
        <motion.button
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('spinner')}
          className="shine-effect dark-premium-gradient relative h-56 w-full overflow-hidden rounded-[40px] p-8 text-left shadow-2xl shadow-indigo-200"
        >
          {/* Background shapes */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10 mb-4">
                <Target size={12} className="text-blue-400" />
                Featured Game
              </div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter leading-[0.9] uppercase">
                Spin the<br />
                <span className="text-blue-400">Fortune</span>
              </h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-tight max-w-[140px]">
                  Win up to 5000 premium coins in one spin!
                </p>
                <div className="flex items-center gap-1 mt-1 opacity-70">
                   <img src="https://img.icons8.com/fluency/48/coin.png" className="h-3 w-3" alt="coin" referrerPolicy="no-referrer" />
                   <span className="text-[8px] font-black text-white italic">HUGE JACKPOT</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-900 shadow-xl transition-transform group-hover:scale-110">
                <Target size={24} />
              </div>
            </div>
          </div>
          
          {/* Animated decorative ring */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-40 w-40 opacity-10 pointer-events-none">
             <div className="h-full w-full rounded-full border-[2px] border-dashed border-white animate-[spin_20s_linear_infinite]"></div>
          </div>
        </motion.button>
      </div>

      {/* Main activities - Bento Grid */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic">All Activities</h3>
           <div className="h-1 flex-1 bg-gray-100 mx-4 rounded-full opacity-50"></div>
           <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200"></div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {activities.map((activity, idx) => (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate(activity.tab as any)}
              className="premium-card relative flex flex-col p-6 text-left group overflow-hidden"
            >
              <div className={cn(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm border transition-all group-hover:scale-110 group-hover:shadow-lg", 
                activity.color
              )}>
                <activity.icon size={26} strokeWidth={2.5} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter italic leading-none">{activity.label}</h4>
              <p className="mt-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">{activity.desc}</p>
              
              <div className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full border border-gray-50 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all"></div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Exclusive Promotions */}
      <div className="px-4 space-y-4">
         <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic px-2">Premium Offers</h3>
         
         <div className="grid grid-cols-1 gap-3">
            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => onNavigate('shop')}
              className="flex w-full items-center justify-between rounded-3xl bg-white p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-100">
                  <Zap size={24} fill="currentColor" strokeWidth={0} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase leading-none">Flash</span>
                    <h3 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">Coin Booster</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Earn double coins for 24h</p>
                    <img src="https://img.icons8.com/fluency/48/coin.png" className="h-3 w-3" alt="coin" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                 <Target size={20} />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => onNavigate('withdraw')}
              className="group flex w-full items-center justify-between rounded-3xl bg-gray-900 p-5 shadow-xl transition-all hover:bg-black"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/10 transition-transform group-hover:rotate-12">
                   <Wallet size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Instant Payout</h3>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Withdraw your gold now</p>
                </div>
              </div>
              <div className="rounded-xl bg-blue-500 px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest italic group-hover:px-6 transition-all shadow-lg shadow-blue-500/20">
                 CASH OUT
              </div>
            </motion.button>
         </div>
      </div>
    </div>
  );
};

export default DashboardView;

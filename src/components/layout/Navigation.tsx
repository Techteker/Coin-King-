import React from 'react';
import { cn } from '../../lib/utils';
import { Home, ShoppingBag, Target, Gift, Wallet, Users } from 'lucide-react';

import { motion } from 'motion/react';

interface NavigationProps {
  activeTab: 'dashboard' | 'shop' | 'spinner' | 'daily' | 'withdraw' | 'scratch' | 'referral';
  onTabChange: (tab: 'dashboard' | 'shop' | 'spinner' | 'daily' | 'withdraw' | 'scratch' | 'referral') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'spinner', icon: Target, label: 'Spin' },
    { id: 'referral', icon: Users, label: 'Refer' },
    { id: 'daily', icon: Gift, label: 'Gift' },
    { id: 'withdraw', icon: Wallet, label: 'Wallet' },
  ] as const;

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 w-[94%] max-w-md -translate-x-1/2">
      <div className="glass-card flex items-center justify-around rounded-[32px] px-2 py-2.5 shadow-2xl shadow-blue-900/10 border border-white/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-300 outline-none",
                isActive ? "scale-110" : "hover:scale-105 active:scale-95"
              )}
            >
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-[18px] transition-all duration-500",
                isActive ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200" : "text-gray-400"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[9px] font-black uppercase tracking-widest text-blue-600 italic"
                >
                  {tab.label}
                </motion.span>
              )}
              
              {isActive && (
                <motion.div 
                  layoutId="active-tab-nav"
                  className="absolute -bottom-1.5 h-1 w-4 rounded-full bg-blue-500/30"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;

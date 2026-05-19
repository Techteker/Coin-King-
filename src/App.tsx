/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import Navigation from './components/layout/Navigation';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import SpinnerView from './components/views/SpinnerView';
import ShopAndEarnView from './components/views/ShopAndEarnView';
import DailyBonusView from './components/views/DailyBonusView';
import WithdrawView from './components/views/WithdrawView';
import ScratchView from './components/views/ScratchView';
import ReferralView from './components/views/ReferralView';
import AuthView from './components/views/AuthView';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shop' | 'spinner' | 'daily' | 'withdraw' | 'scratch' | 'referral'>('dashboard');

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-gray-900">
        <div className="relative mb-32 flex flex-col items-center">
          {/* Bouncing Ball */}
          <div className="loading-bounce z-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#1a1a1a] shadow-lg">
             <div className="absolute right-4 top-4 h-4 w-6 rounded-full bg-white/20"></div>
          </div>
          
          {/* The Hole / Shadow */}
          <div className="absolute -bottom-8 h-8 w-32 rounded-full bg-black/20 blur-sm"></div>
          <div className="loading-shadow absolute -bottom-12 h-12 w-48 rounded-full bg-[#1a1a1a]"></div>
        </div>

        {/* Loading Bar */}
        <div className="relative h-2.5 w-64 overflow-hidden rounded-full border-2 border-black/80 bg-black/10 p-0.5">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "60%" }}
             transition={{ duration: 2, ease: "easeInOut" }}
             className="h-full rounded-full bg-black"
           ></motion.div>
        </div>
        
        <div className="mt-4 font-black tracking-widest text-black uppercase text-sm">
           Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden font-sans selection:bg-game-purple selection:text-white">
      <Header />
      
      <main className="relative flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
            </motion.div>
          )}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShopAndEarnView />
            </motion.div>
          )}
          {activeTab === 'spinner' && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <SpinnerView />
            </motion.div>
          )}
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyBonusView />
            </motion.div>
          )}
          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WithdrawView />
            </motion.div>
          )}
          {activeTab === 'referral' && (
            <motion.div
              key="referral"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <ReferralView />
            </motion.div>
          )}
          {activeTab === 'scratch' && (
            <motion.div
              key="scratch"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <ScratchView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}


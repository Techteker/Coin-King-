import React, { useState } from 'react';
import { ShoppingBag, ChevronLeft, ExternalLink, ShieldCheck, ArrowRight, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../FirebaseProvider';

interface Partner {
  id: string;
  name: string;
  logo: string;
  coins: number;
  description: string;
  process: string[];
  url: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    coins: 5000,
    description: 'Shop for over 100 million products and earn rewards on every purchase.',
    process: [
      'Click on "Earn Rewards" button below',
      'You will be redirected to Amazon',
      'Complete your shopping normally',
      'Rewards will be tracked within 48 hours',
      'Coins will be added after return period ends'
    ],
    url: 'https://amazon.in'
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
    coins: 4500,
    description: 'Biggest online store for electronics, fashion and more.',
    process: [
      'Click on "Earn Rewards" button',
      'Shop on Flipkart App or Web',
      'Do not close the browser during shopping',
      'Coins added to wallet after order completion'
    ],
    url: 'https://flipkart.com'
  },
  {
    id: 'myntra',
    name: 'Myntra',
    logo: 'https://w7.pngtree.com/png-external-free-icon/png/free-fashion-clothing-85/free-fashion-clothing-85.png',
    coins: 6000,
    description: 'Fashion & Lifestyle destination in India.',
    process: [
      'Click "Earn Rewards"',
      'Order your favorite outfits',
      'Wait for delivery and return window close',
      'Get 6,000 coins directly'
    ],
    url: 'https://myntra.com'
  },
  {
    id: 'ajio',
    name: 'Ajio',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Ajio_Logo.svg',
    coins: 3000,
    description: 'Trending fashion at best prices.',
    process: [
      'Click "Earn Rewards"',
      'Shop on Ajio',
      'Rewards credited after confirmation'
    ],
    url: 'https://ajio.com'
  },
  {
    id: 'amazon_prime',
    name: 'Amazon Prime',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
    coins: 1000,
    description: 'Get free one-day delivery, Prime Video, Prime Music and more.',
    process: [
      'Click on "Earn Rewards" button',
      'Register as a new user',
      'Complete the subscription process',
      'Coins will be added after successful registration'
    ],
    url: 'https://amzn.to/4nyBzJk'
  },
  {
    id: 'amazon_kindle',
    name: 'Amazon Kindle',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Amazon_Kindle_logo.svg',
    coins: 1090,
    description: 'Unlimited reading from over 2 million titles. Read anytime, anywhere.',
    process: [
      'Click on "Earn Rewards" button',
      'Register as a new user',
      'Start your Kindle subscription',
      'Rewards tracked after registration is verified'
    ],
    url: 'https://amzn.to/3RkD8i4'
  }
];

const ShopAndEarnView: React.FC = () => {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  return (
    <div className="mx-auto max-w-lg">
      <AnimatePresence mode="wait">
        {!selectedPartner ? (
           <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
             <div className="flex flex-col items-center gap-2 mb-8 text-center pt-4">
                <div className="h-16 w-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center shadow-sm mb-2">
                  <ShoppingBag size={32} className="text-game-yellow" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Shop & Earn</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Premium Brand Partners</p>
             </div>

             <div className="grid gap-6">
                {PARTNERS.map((partner) => (
                   <motion.div
                      key={partner.id}
                      whileHover={{ y: -5 }}
                      className="premium-card p-6 flex flex-col gap-6 relative overflow-hidden group"
                   >
                      {/* Decorative Background Icon */}
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 duration-500">
                         <ShoppingBag size={120} />
                      </div>

                      <div className="flex items-center gap-5 relative z-10">
                         <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[28px] bg-gray-50 border border-gray-100 p-4 flex items-center justify-center shadow-inner group-hover:bg-white transition-colors">
                            <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                         </div>
                         <div className="flex-1">
                            <h3 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase leading-none mb-2">{partner.name}</h3>
                            <div className="flex flex-wrap gap-2">
                               <div className="bg-game-yellow/10 pl-1.5 pr-3 py-1.5 rounded-full border border-game-yellow/20 flex items-center gap-2">
                                  <img 
                                    src="https://img.icons8.com/fluency/48/coin.png" 
                                    alt="Coin"
                                    className="h-5 w-5 object-contain"
                                  />
                                  <span className="text-[12px] font-black text-game-yellow uppercase tracking-tight">{partner.coins.toLocaleString()} Coins</span>
                               </div>
                               <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-1.5">
                                  <ShieldCheck size={12} className="text-green-500" />
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedPartner(partner)}
                        className="premium-3d-button-yellow w-full rounded-[24px] py-5 flex items-center justify-center gap-3 relative z-10"
                      >
                         <span className="text-sm font-black uppercase italic tracking-[0.1em] text-black">View Offer</span>
                         <ArrowRight size={18} className="text-black" />
                      </button>
                   </motion.div>
                ))}
             </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <button
               onClick={() => setSelectedPartner(null)}
               className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-600 transition-colors"
             >
                <ChevronLeft size={16} />
                BACK TO LIST
             </button>

             <div className="premium-card p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-40 opacity-10 pointer-events-none bg-gradient-to-b from-game-yellow to-transparent"></div>

                <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[36px] border border-gray-100 bg-white p-5 shadow-xl relative z-10">
                   <img src={selectedPartner.logo} alt={selectedPartner.name} className="max-h-full max-w-full object-contain" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase leading-none relative z-10">{selectedPartner.name}</h2>
                
                <div className="mt-4 flex items-center justify-center gap-2 bg-game-yellow/10 pl-2 pr-5 py-2.5 rounded-full border border-game-yellow/20 mx-auto w-fit relative z-10">
                   <img 
                      src="https://img.icons8.com/fluency/48/coin.png" 
                      alt="Coin"
                      className="h-8 w-8 object-contain"
                   />
                   <span className="text-sm font-black text-game-yellow uppercase tracking-tight">Earn {selectedPartner.coins.toLocaleString()} Coins</span>
                </div>
                
                <p className="mt-6 text-xs font-bold text-gray-400 leading-relaxed px-2 uppercase tracking-widest relative z-10">
                   {selectedPartner.description}
                </p>

                <button
                  onClick={() => window.open(selectedPartner.url, '_blank')}
                  className="premium-3d-button-yellow mt-10 w-full rounded-[28px] py-6 flex items-center justify-center gap-3 relative z-10"
                >
                   <span className="text-lg font-black text-black uppercase italic tracking-widest">EARN REWARDS NOW</span>
                   <ExternalLink size={20} className="text-black" />
                </button>
             </div>

             <div className="premium-card p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-[0.03] p-8">
                   <ShieldCheck size={140} />
                </div>
                <h3 className="text-sm font-black text-gray-400 mb-6 flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                   <span className="h-1.5 w-1.5 rounded-full bg-game-yellow"></span>
                   Process to Earn
                </h3>
                
                <div className="space-y-5 relative z-10">
                   {selectedPartner.process.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                         <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-game-yellow/10 text-[12px] font-black text-game-yellow border border-game-yellow/20">
                            {idx + 1}
                         </div>
                         <p className="text-[13px] font-black text-gray-600 leading-snug pt-1 uppercase tracking-tight italic">{step}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4 flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-white shadow-sm shadow-yellow-200">
                   <ArrowRight size={20} />
                </div>
                <p className="text-[10px] font-bold text-yellow-700 leading-relaxed">
                   Important: Ensure cookies are enabled and do not use any ad-blockers to ensure your rewards are tracked correctly.
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopAndEarnView;

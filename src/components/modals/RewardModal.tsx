import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Video } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const RewardModal: React.FC<RewardModalProps> = ({ isOpen, onClose, amount }) => {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#facc15']
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          ></motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[40px] bg-white p-8 shadow-2xl text-center"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Treasure Chest Placeholder */}
            <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
               <motion.div
                 animate={{ y: [-5, 5, -5] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="relative z-10"
               >
                  <div className="flex h-32 w-32 items-center justify-center rounded-[40px] bg-game-gradient shadow-2xl shadow-purple-200 ring-8 ring-purple-50">
                     <Gift size={64} className="text-white" fill="currentColor" />
                  </div>
                  
                  {/* Decorative coins floating */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [-20, -100], 
                        x: [0, (i % 2 === 0 ? 30 : -30)],
                        opacity: [1, 0],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                      className="absolute left-1/2 top-1/2 -ml-3 -mt-3 h-6 w-6 rounded-full bg-game-yellow shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-800"
                    >
                      $
                    </motion.div>
                  ))}
               </motion.div>
               
               <div className="absolute inset-0 rounded-full bg-purple-50 blur-3xl opacity-50"></div>
            </div>

            <h2 className="text-3xl font-black italic tracking-tighter text-game-purple leading-tight">
               Congratulations!
            </h2>
            <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
               You Win : <span className="text-game-purple">{amount} Coins</span>
            </p>

            <div className="mt-10 flex gap-3">
               <button
                 onClick={onClose}
                 className="glossy-button-purple flex-1 rounded-2xl py-4 flex items-center justify-center gap-2"
               >
                  <span className="text-sm font-black text-white uppercase tracking-wider">Claim!</span>
               </button>
               
               <button
                 onClick={() => {
                    alert("Ad integration coming soon! Watch ad to double your reward.");
                 }}
                 className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 py-4 shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2 group"
               >
                  <div className="absolute -left-2 top-0 bg-white/20 px-2 py-0.5 text-[8px] font-black text-white">AD</div>
                  <Video size={16} className="text-white" fill="currentColor" />
                  <span className="text-sm font-black text-white uppercase tracking-wider">Get 2x!</span>
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RewardModal;

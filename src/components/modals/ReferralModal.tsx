import React, { useState } from 'react';
import { useAuth } from '../FirebaseProvider';
import { Share2, Users, CheckCircle2, X } from 'lucide-react';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [friendCode, setFriendCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCode = async () => {
    if (!friendCode || isSubmitting) return;
    if (profile?.referredBy) {
      setError('You have already used a referral code.');
      return;
    }
    if (friendCode === profile?.referralCode) {
      setError('You cannot use your own code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', friendCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid referral code.');
        setIsSubmitting(false);
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const REWARD = 1000;

      await updateDoc(doc(db, 'users', profile!.uid), {
        balance: increment(REWARD),
        referredBy: friendDoc.id
      });

      await updateDoc(doc(db, 'users', friendDoc.id), {
        balance: increment(REWARD)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: profile!.uid,
        type: 'referral',
        amount: REWARD,
        createdAt: new Date().toISOString()
      });
      await addDoc(collection(db, 'transactions'), {
        userId: friendDoc.id,
        type: 'referral',
        amount: REWARD,
        createdAt: new Date().toISOString()
      });

      alert('Referral code applied! 1,000 coins added to your balance.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to apply code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const text = `Join Coin King and earn real money! Use my referral code: ${profile?.referralCode}. 10,000 Coins = 1 USD!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Coin King',
          text: text,
          url: window.location.origin
        });
      } catch (err: any) {
        // If the user cancelled the share, we don't want to show an error
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          // Fallback to clipboard if share fails
          navigator.clipboard.writeText(text);
          alert('Referral link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Referral link copied to clipboard!');
    }
  };

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
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl border border-purple-50"
          >
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-purple-100 text-purple-600">
                <Users size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-800">Refer & Earn</h2>
              <p className="mt-1 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                Share your code and you both get <span className="text-game-purple">1,000 Coins</span>
              </p>

              <div className="mt-8 w-full space-y-6">
                <div className="rounded-2xl bg-purple-50 p-4 text-center border border-purple-100">
                  <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">YOUR REFERRAL CODE</span>
                  <div className="mt-1 flex items-center justify-center gap-3">
                    <span className="text-2xl font-black tracking-widest text-game-purple">{profile?.referralCode}</span>
                    <button onClick={handleShare} className="text-game-pink">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {!profile?.referredBy && (
                  <div className="space-y-3">
                     <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-1">HAVE A FRIEND'S CODE?</div>
                     <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="ENTER CODE"
                          value={friendCode}
                          onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                          className="flex-1 rounded-xl bg-gray-50 p-3 text-sm font-bold text-gray-800 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-game-purple/20 focus:border-game-purple"
                        />
                        <button
                          onClick={handleApplyCode}
                          disabled={isSubmitting || !friendCode}
                          className="rounded-xl bg-game-purple px-4 text-xs font-black text-white transition-colors disabled:opacity-50"
                        >
                          APPLY
                        </button>
                     </div>
                     {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
                  </div>
                )}

                {profile?.referredBy && (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 p-3 text-green-600 border border-green-100">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-black uppercase tracking-wider">CODE APPLIED</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReferralModal;

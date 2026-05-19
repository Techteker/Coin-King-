import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Copy, Check, Info, Calendar, Mail, User, Wallet, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../FirebaseProvider';
import { db } from '../../lib/firebase';
import { doc, updateDoc, getDoc, arrayUnion, increment, addDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { CustomGoldCoin } from '../CustomGoldCoin';

const ReferralView: React.FC = () => {
  const { profile } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referrerCode, setReferrerCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const referralCode = profile?.referralCode || profile?.uid.slice(0, 6).toUpperCase() || '';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleClaimReferrer = async () => {
    if (!profile || !referrerCode || isClaiming) return;
    
    const cleanCode = referrerCode.trim().toUpperCase();

    if (profile.referredBy) {
      setError('You have already claimed a referral bonus.');
      return;
    }
    
    if (cleanCode === profile.referralCode.toUpperCase() || cleanCode === profile.uid.toUpperCase()) {
        setError('You cannot refer yourself.');
        return;
    }

    setIsClaiming(true);
    setError(null);

    try {
      // 1. Search for referrer by referralCode (6-digit)
      const q = query(collection(db, 'users'), where('referralCode', '==', cleanCode));
      const querySnapshot = await getDocs(q);
      
      let referrerId = '';
      let referrerName = 'Friend';

      if (!querySnapshot.empty) {
        referrerId = querySnapshot.docs[0].id;
        referrerName = querySnapshot.docs[0].data().displayName || 'Friend';
      } else {
        // 2. Search by prefix if it's a 6-character code (like slice of UID)
        if (cleanCode.length === 6) {
          const qPrefix = query(
            collection(db, 'users'),
            where('__name__', '>=', cleanCode),
            where('__name__', '<=', cleanCode + '\uf8ff'),
            limit(1)
          );
          const prefixSnapshot = await getDocs(qPrefix);
          if (!prefixSnapshot.empty) {
            referrerId = prefixSnapshot.docs[0].id;
            referrerName = prefixSnapshot.docs[0].data().displayName || 'Friend';
          }
        }
        
        // 3. Fallback: Check if it's a direct UID
        if (!referrerId) {
          const directRef = doc(db, 'users', referrerCode);
          try {
            const directSnap = await getDoc(directRef);
            if (directSnap.exists()) {
              referrerId = directSnap.id;
              referrerName = directSnap.data().displayName || 'Friend';
            }
          } catch (e) {
            console.warn("Direct document check skipped or rejected:", e);
          }
        }
      }

      if (!referrerId) {
        setError('Invalid referral code.');
        setIsClaiming(false);
        return;
      }

      const userRef = doc(db, 'users', profile.uid);
      const referrerRef = doc(db, 'users', referrerId);
      
      // Update referee (current user)
      await updateDoc(userRef, {
        referredBy: referrerId,
        balance: increment(1000)
      });

      // Update referrer
      await updateDoc(referrerRef, {
        balance: increment(1000),
        totalReferralEarnings: increment(1000)
      });

      // Transactions
      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        type: 'referral',
        amount: 1000,
        createdAt: new Date().toISOString(),
        remark: `Referral Bonus (from ${referrerName})`
      });

      await addDoc(collection(db, 'transactions'), {
        userId: referrerId,
        type: 'referral',
        amount: 1000,
        createdAt: new Date().toISOString(),
        remark: `Referral Bonus (referring ${profile.displayName || 'Friend'})`
      });

      setSuccess('Referral bonus claimed successfully!');
      setReferrerCode('');
    } catch (err) {
      console.error('Referral claim error:', err);
      setError('Failed to claim referral bonus.');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center pt-4">
        <div className="h-16 w-16 rounded-[24px] bg-white border border-blue-100 flex items-center justify-center shadow-sm mb-2">
          <Users size={32} className="text-blue-500" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Refer & Earn</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Lifetime 10% Commission</p>
      </div>

      {/* User Stats Dashboard */}
      <div className="px-4">
         <div className="premium-card p-6 relative overflow-hidden bg-white">
            <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
               <User size={120} />
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <User size={28} className="text-blue-500" />
               </div>
               <div>
                  <h3 className="text-xl font-black italic tracking-tighter text-gray-900 leading-tight uppercase">
                    {profile?.displayName || 'Nexvy User'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Mail size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{profile?.email || 'No Gmail'}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 relative z-10">
               <div className="space-y-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={10} /> Join Date
                  </span>
                  <p className="text-xs font-black text-gray-900 uppercase italic">
                    {formatDate(profile?.createdAt)}
                  </p>
               </div>
               <div className="space-y-1 text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                    <Wallet size={10} /> Total Earning
                  </span>
                  <div className="flex items-center justify-end gap-1">
                     <CustomGoldCoin className="h-4.5 w-4.5 object-contain" />
                     <p className="text-sm font-black text-blue-600 uppercase italic">
                       {profile?.balance.toLocaleString() || '0'}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* NEW Combined Premium Referral Banner */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl shadow-blue-200">
           {/* Decorative elements */}
           <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
           <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
           
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Share & Win Coins</h3>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Premium Rewards Program</p>
                 </div>
                 <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Sparkles className="text-white" size={24} />
                 </div>
              </div>

              {/* Code Selection */}
              <div className="space-y-2">
                 <span className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Your Referral Code</span>
                 <div className="group relative flex h-16 items-center justify-between rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 px-6 transition-all hover:bg-white/15">
                    <span className="text-2xl font-black text-white tracking-[0.2em] italic">
                      {referralCode}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(referralCode, 'code')}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-lg transition-transform active:scale-90"
                    >
                      {copiedCode ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
                    </button>
                 </div>
              </div>

              {/* Link Selection */}
              <div className="space-y-2">
                 <span className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Referral Link</span>
                 <div className="group relative flex h-14 items-center justify-between rounded-2xl bg-black/20 border border-white/10 px-6 transition-all">
                    <span className="text-[10px] font-bold text-white/50 truncate pr-4">{referralLink}</span>
                    <button 
                      onClick={() => copyToClipboard(referralLink, 'link')}
                      className="flex h-9 px-4 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                    >
                      {copiedLink ? 'COPIED' : 'COPY'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Claim Box (One Time) */}
      <div className="px-4">
        {!profile?.referredBy ? (
          <div className="premium-card p-6 bg-white space-y-4 shadow-sm border border-gray-50">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                       <AlertCircle size={20} className="text-blue-500" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black italic tracking-tighter uppercase leading-none text-gray-900">Claim Code</h3>
                          <CustomGoldCoin className="h-4 w-4 object-contain" />
                       </div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Instant 1000 Coins Reward</p>
                    </div>
                 </div>
             
             <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={referrerCode}
                  onChange={(e) => setReferrerCode(e.target.value)}
                  placeholder="Enter UID Code"
                  className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-100 px-4 text-xs font-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={handleClaimReferrer}
                  disabled={isClaiming || !referrerCode}
                  className="h-12 px-6 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-100"
                >
                  {isClaiming ? 'LOADING...' : 'CLAIM'}
                </button>
             </div>
             {error && <p className="text-[9px] font-bold text-red-500 uppercase">{error}</p>}
             {success && <p className="text-[9px] font-bold text-green-500 uppercase">{success}</p>}
          </div>
        ) : (
          <div className="premium-card p-5 bg-green-50 border border-green-100 flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <Check size={20} strokeWidth={3} />
             </div>
             <div>
                <h4 className="text-sm font-black text-green-800 italic uppercase">Referral Claimed</h4>
                <p className="text-[9px] font-bold text-green-600/70 uppercase tracking-wide">You've successfully claimed your 1000 Coins bonus!</p>
             </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="px-4 pb-12">
        <div className="premium-card p-6 relative overflow-hidden bg-gray-900 text-white">
           <div className="absolute -right-8 -top-8 p-4 opacity-10 pointer-events-none rotate-12">
              <Sparkles size={120} />
           </div>
           
           <h3 className="text-sm font-black text-blue-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
             <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
             Promotion Program
           </h3>
           
           <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-[12px] font-black text-white border border-white/10">
                    1
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black uppercase tracking-tight italic">Share Your Code</h4>
                    <p className="text-[10px] font-medium text-gray-400 leading-snug pt-0.5">Invite your friends to Nexvy using your unique code or link.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-[12px] font-black text-white border border-white/10">
                    2
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5">
                       <h4 className="text-[11px] font-black uppercase tracking-tight italic">Both Get 1000 Coins</h4>
                       <CustomGoldCoin className="h-3 w-3 object-contain" />
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 leading-snug pt-0.5">When they claim your code, both of you receive 1000 rewarding coins instantly.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-[12px] font-black text-white border border-white/10">
                    3
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5">
                       <h4 className="text-[11px] font-black uppercase tracking-tight italic">10% Lifetime Earning</h4>
                       <CustomGoldCoin className="h-3 w-3 object-contain" />
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 leading-snug pt-0.5">Earn 10% commission on every activity your friend completes. Forever!</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralView;

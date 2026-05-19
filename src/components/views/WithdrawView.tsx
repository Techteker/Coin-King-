import React, { useState } from 'react';
import { useAuth } from '../FirebaseProvider';
import { Wallet, Smartphone, Landmark, Mail, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { doc, updateDoc, increment, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';

const WithdrawView: React.FC = () => {
  const { profile } = useAuth();
  const [method, setMethod] = useState<'paytm' | 'phonepe' | 'paypal'>('paytm');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('100000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || profile.balance < 100000) {
      alert("Minimum withdrawal is 100,000 coins.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: profile.uid,
        amount: parseInt(amount),
        method,
        accountDetails: account,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', profile.uid), {
        balance: increment(-parseInt(amount))
      });

      await addDoc(collection(db, 'transactions'), {
        userId: profile.uid,
        type: 'withdraw',
        amount: -parseInt(amount),
        createdAt: new Date().toISOString()
      });

      alert("Withdrawal request submitted successfully!");
      setAccount('');
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const methods = [
    { id: 'paytm', icon: Smartphone, label: 'Paytm', color: 'from-blue-500 to-indigo-600' },
    { id: 'phonepe', icon: Landmark, label: 'PhonePe', color: 'from-purple-500 to-indigo-700' },
    { id: 'paypal', icon: Mail, label: 'PayPal', color: 'from-blue-400 to-blue-600' },
  ] as const;

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-32 pt-4">
      <div className="text-center space-y-2 mb-8">
         <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900 leading-none">Wallet Cashout</h2>
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Redeem your coins for real cash</p>
      </div>

      {/* Payment Methods */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          {methods.map((item) => {
            const isActive = method === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ y: -4 }}
                onClick={() => setMethod(item.id)}
                className={cn(
                  "relative flex flex-col items-center gap-3 overflow-hidden rounded-[32px] p-5 transition-all outline-none border-2",
                  isActive 
                    ? `bg-white border-blue-500 shadow-xl shadow-blue-100` 
                    : "border-transparent bg-white shadow-sm"
                )}
              >
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-md",
                  isActive ? `bg-gradient-to-br ${item.color} text-white` : "bg-gray-50 text-gray-300"
                )}>
                  <item.icon size={26} strokeWidth={2.5} />
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", isActive ? "text-gray-900" : "text-gray-300")}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Withdraw Form */}
      <div className="px-4">
        <form onSubmit={handleSubmit} className="premium-card p-8 space-y-8 bg-white border border-gray-100 shadow-2xl shadow-blue-900/5 transition-all">
          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Details</label>
                   <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified
                   </span>
                </div>
                <input
                  type="text"
                  placeholder={`Enter ${method === 'paypal' ? 'PayPal Email' : 'Mobile Number'}...`}
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50/50 p-5 text-sm font-black text-gray-900 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-300"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redeem Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Amount"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50/50 p-5 pr-24 text-sm font-black text-gray-900 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-gray-300"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-[10px] font-black text-white italic tracking-tighter">
                    <img src="https://img.icons8.com/fluency/48/coin.png" className="h-3.5 w-3.5" alt="coin" referrerPolicy="no-referrer" />
                    Coins
                  </div>
                </div>
                <p className="ml-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                   Equivalent: <span className="text-gray-900 font-black italic">≈ ${ (parseInt(amount || '0') / 10000).toFixed(2) }</span>
                </p>
             </div>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100 flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-500 mt-0.5">
               <span className="text-[10px] font-black italic">i</span>
            </div>
            <p className="text-[10px] font-black text-blue-800 uppercase tracking-tight leading-tight flex items-center gap-1 flex-wrap">
               Minimum payout 
               <img src="https://img.icons8.com/fluency/48/coin.png" className="h-2.5 w-2.5" alt="coin" referrerPolicy="no-referrer" />
               <span className="underline decoration-blue-300 decoration-2 underline-offset-2">100,000 Coins ($10.00)</span>. Processing time: 24-48 Hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (profile?.balance || 0) < 100000}
            className="group shine-effect dark-premium-gradient w-full rounded-2xl py-6 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
          >
            <span className="text-lg font-black tracking-[0.2em] text-white uppercase italic flex items-center justify-center gap-3">
              {isSubmitting ? 'PROCESSING...' : (
                <>
                  CASHOUT NOW
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>

      {/* History Button */}
      <div className="px-4">
        <button className="flex w-full items-center justify-between rounded-3xl bg-white p-6 border border-gray-100 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.99]">
           <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                 <Wallet size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                 <h3 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">Withdrawal Logs</h3>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Check your request status</p>
              </div>
           </div>
           <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-300">
              <ArrowRight size={20} />
           </div>
        </button>
      </div>
    </div>
  );
};

export default WithdrawView;

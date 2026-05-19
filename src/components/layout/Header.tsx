import React from 'react';
import { useAuth } from '../FirebaseProvider';
import { LogOut, Coins } from 'lucide-react';
import { CustomGoldCoin } from '../CustomGoldCoin';

const Header: React.FC = () => {
  const { profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-gray-100">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 p-0.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
            <div className="h-full w-full overflow-hidden rounded-xl bg-white">
              <img 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} 
                alt="Avatar" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Nexvy Premium</p>
            <h1 className="max-w-[120px] truncate text-sm font-black text-gray-900 leading-none italic uppercase tracking-tighter">
              {profile?.displayName || 'User Member'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="group relative flex items-center gap-2 rounded-2xl bg-gray-50 pl-2 pr-4 py-1.5 border border-gray-100 transition-all hover:bg-gray-100">
            <div className="shine-effect relative h-7 w-7 flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gold-start/20">
              <CustomGoldCoin className="h-6 w-6 object-contain" />
            </div>
            <span className="text-sm font-black tracking-tighter text-gray-900 italic">
              {profile?.balance.toLocaleString() || '0'}
            </span>
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 animate-pulse border-2 border-white"></div>
          </div>
          
          <button 
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 active:scale-90"
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

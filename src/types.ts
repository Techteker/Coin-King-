export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balance: number;
  referralCode: string;
  lastDailyClaim: string | null;
  dailyStreak: number;
  createdAt: string;
  totalScratches?: number;
  lastScratchDate?: string | null;
  dailyScratchCount?: number;
  referredBy?: string | null;
  totalReferralEarnings?: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'paytm' | 'phonepe' | 'paypal';
  accountDetails: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface GameTransaction {
  id: string;
  userId: string;
  type: 'spin' | 'daily' | 'referral' | 'withdraw' | 'scratch';
  amount: number;
  createdAt: string;
}

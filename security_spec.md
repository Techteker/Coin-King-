# Security Specification - Coin King

## Data Invariants
1. A User profile must have a unique `uid`, a `balance` >= 0, and a `referralCode`.
2. A Transaction must be linked to a valid User.
3. A Withdrawal must be linked to a valid User and have a minimum amount of 100,000 coins.
4. Users cannot modify their own `balance` directly without a corresponding transaction (in theory, but for this simple app we allow increment).
5. Users cannot modify other users' profiles (except for automated referral rewards, which should ideally be handled by a secure backend, but here we must allow User A to update User B's balance).

## The Dirty Dozen Payloads (Invalid Attempts)
1. Creating a user with `balance: 1000000`.
2. Updating another user's `balance` without being an admin.
3. Creating a withdrawal for another user.
4. Changing a withdrawal `status` from `pending` to `completed`.
5. Creating a transaction with an invalid type.
6. Updating `createdAt` on any document.
7. Injecting 1MB string into `referralCode`.
8. Listing all users' private data (email).
9. Updating `uid` field in user profile.
10. Creating a user profile for a different UID.
11. Withdrawing more coins than the current balance (logic check in app, but rules should ideally check too).
12. Referral code spoofing (claiming referral for self).

## Test Cases (Conceptual)
- [FAIL] `setDoc(users/attacker, { balance: 999999, ... })`
- [FAIL] `updateDoc(users/victim, { balance: 0 })`
- [FAIL] `addDoc(withdrawals, { userId: 'victim', ... })`
- [FAIL] `updateDoc(withdrawals/123, { status: 'completed' })`
- [FAIL] `addDoc(transactions, { type: 'cheat', ... })`

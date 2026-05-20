import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer, collection, query, where, getDocs, increment, updateDoc, addDoc, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('permission-denied')) {
       // This is expected if the test collection denies access
       return;
    }
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Handle profile sync
        const userDocPath = `users/${firebaseUser.uid}`;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes
        const unsubProfile = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (!data.referralCode) {
              const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
              try {
                await updateDoc(userDocRef, { referralCode: generatedCode });
                data.referralCode = generatedCode;
              } catch (err) {
                console.error("Failed to backfill referralCode:", err);
              }
            }
            setProfile(data);
          } else {
            // New user initialization
            const referralCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Referral Logic
            let referredByUid: string | null = null;
            const refCode = localStorage.getItem('referredByCode');
            
            if (refCode) {
              try {
                const cleanRefCode = refCode.trim().toUpperCase();
                const q = query(collection(db, 'users'), where('referralCode', '==', cleanRefCode));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  referredByUid = querySnapshot.docs[0].id;
                } else if (cleanRefCode.length === 6) {
                  // Fallback: Check if it's a 6-character UID prefix
                  const qPrefix = query(
                    collection(db, 'users'),
                    where('__name__', '>=', cleanRefCode),
                    where('__name__', '<=', cleanRefCode + '\uf8ff'),
                    limit(1)
                  );
                  const prefixSnapshot = await getDocs(qPrefix);
                  if (!prefixSnapshot.empty) {
                    referredByUid = prefixSnapshot.docs[0].id;
                  }
                }
              } catch (err) {
                console.error("Referral lookup failed:", err);
              }
            }

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              balance: referredByUid ? 1000 : 0,
              referralCode,
              lastDailyClaim: null,
              dailyStreak: 0,
              createdAt: new Date().toISOString(),
              referredBy: referredByUid,
              totalReferralEarnings: 0
            };

            try {
              await setDoc(userDocRef, newProfile);
              
              // Record referee transaction
              if (referredByUid) {
                await addDoc(collection(db, 'transactions'), {
                  userId: firebaseUser.uid,
                  type: 'referral',
                  amount: 1000,
                  createdAt: new Date().toISOString(),
                  remark: 'Welcome Bonus (Referral)'
                });

                // Update and record referrer bonus
                const referrerRef = doc(db, 'users', referredByUid);
                await updateDoc(referrerRef, {
                  balance: increment(1000),
                  totalReferralEarnings: increment(1000)
                });

                await addDoc(collection(db, 'transactions'), {
                  userId: referredByUid,
                  type: 'referral',
                  amount: 1000,
                  createdAt: new Date().toISOString(),
                  remark: `Bonus for referring ${firebaseUser.displayName || 'Friend'}`
                });
              }

              // Clear the code after successful claim
              localStorage.removeItem('referredByCode');
              
              setProfile(newProfile);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, userDocPath);
            }
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, userDocPath);
          setLoading(false);
        });
        
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain Unauthorized: Please add your Vercel domain (e.g., your-app.vercel.app) to Authorized Domains in Firebase Console > Authentication > Settings.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Popup Blocked: Please allow popups for this site to sign in.");
      } else if (error.code === 'auth/operation-not-allowed') {
        alert("Google Sign-In not enabled: Please enable Google Provider in Firebase Console > Authentication > Sign-in method.");
      } else {
        alert("Login failed: " + error.message);
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      console.error("Email Login Error:", error);
      let message = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Incorrect email or password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      }
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
      }
    } catch (error: any) {
      console.error("Email Signup Error:", error);
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') {
        message = "This email is already registered. Please login instead.";
      } else if (error.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters long.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      }
      throw new Error(message);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, signInWithEmail, signUpWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};

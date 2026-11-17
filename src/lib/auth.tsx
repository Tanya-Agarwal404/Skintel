import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  /** True only right after a brand-new account is created, never after signing in. */
  tourPending: boolean;
  finishTour: () => void;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'That email already has an account. Try signing in instead.',
  'auth/invalid-email': 'That email address does not look right.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/network-request-failed': 'Could not reach the sign-in service. Check your connection.',
  'auth/popup-closed-by-user': 'The Google window was closed before finishing.',
  'auth/cancelled-popup-request': 'The Google window was closed before finishing.',
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not turned on yet.',
  'auth/expired-action-code': 'This reset link has expired. Ask for a new one from the sign-in page.',
  'auth/invalid-action-code': 'This reset link is not valid or has already been used. Ask for a new one from the sign-in page.',
  'auth/unauthorized-domain': 'This website address is not authorised for sign-in yet.',
};

export function authMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  return MESSAGES[code] ?? 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [tourPending, setTourPending] = useState(false);

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (next) => {
        setUser(next);
        setReady(true);
      });
    } catch (error) {
      console.error(error);
      setReady(true);
      return undefined;
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(credential.user, { displayName: name }).catch(() => undefined);
    setTourPending(true);
  }, []);
  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);
  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    if (getAdditionalUserInfo(result)?.isNewUser) setTourPending(true);
  }, []);
  const resetPassword = useCallback((email: string) => sendPasswordResetEmail(getFirebaseAuth(), email), []);
  const signOut = useCallback(async () => {
    setTourPending(false);
    await firebaseSignOut(getFirebaseAuth());
  }, []);
  const finishTour = useCallback(() => setTourPending(false), []);

  const value = useMemo(
    () => ({ user, ready, tourPending, finishTour, signUp, signIn, signInWithGoogle, resetPassword, signOut }),
    [user, ready, tourPending, finishTour, signUp, signIn, signInWithGoogle, resetPassword, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

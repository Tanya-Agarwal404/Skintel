import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const env = import.meta.env;
const read = (name: string) => (env[name] as string | undefined) ?? "";

/** Created lazily so pages still render (and server rendering still works) when the config is missing. */
export function getFirebaseApp(): FirebaseApp {
  const apiKey = read("VITE_FIREBASE_API_KEY");
  const projectId = read("VITE_FIREBASE_PROJECT_ID");
  const appId = read("VITE_FIREBASE_APP_ID");
  if (!apiKey || !projectId || !appId) {
    throw new Error("Missing VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_APP_ID");
  }
  if (getApps().length) return getApp();
  // Browser-safe web config; access is governed by firestore.rules.
  return initializeApp({
    apiKey,
    projectId,
    appId,
    authDomain: read("VITE_FIREBASE_AUTH_DOMAIN"),
    storageBucket: read("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: read("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  });
}

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());
export const getDb = (): Firestore => getFirestore(getFirebaseApp());

/** A fresh ID token for the signed-in user, sent with every AI request so the server can confirm who is asking. */
export async function getIdToken(): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Please sign in again.');
  return user.getIdToken();
}

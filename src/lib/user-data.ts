import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { profileSchema, type Consent, type SkinProfile } from '@/lib/skin-profile';

export type HistoryKind = 'skin' | 'label' | 'routine';
export type HistoryDraft = { kind: HistoryKind; title: string; summary: string; details: string[] };
export type HistoryItem = HistoryDraft & { id: string; createdAt: number };

// users/{uid}                -> { profile, consent, updatedAt }
// users/{uid}/history/{id}   -> saved results (text only; photos are never stored)
const userRef = (uid: string) => doc(getDb(), 'users', uid);
const historyRef = (uid: string) => collection(getDb(), 'users', uid, 'history');

export async function loadUserData(uid: string): Promise<{ profile: SkinProfile | null; consent: Consent | null }> {
  const snap = await getDoc(userRef(uid));
  const data = snap.data();
  const profile = profileSchema.safeParse(data?.['profile']);
  const consent = data?.['consent'] as Consent | undefined;
  return { profile: profile.success ? profile.data : null, consent: consent ?? null };
}

export function saveUserData(uid: string, patch: { profile?: SkinProfile; consent?: Consent }) {
  return setDoc(userRef(uid), { ...patch, updatedAt: Date.now() }, { merge: true });
}

export async function listHistory(uid: string): Promise<HistoryItem[]> {
  const snap = await getDocs(query(historyRef(uid), orderBy('createdAt', 'desc'), limit(50)));
  return snap.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<HistoryItem, 'id'>) }));
}

export async function addHistory(uid: string, draft: HistoryDraft) {
  const safe: HistoryDraft = {
    kind: draft.kind,
    title: draft.title.slice(0, 120),
    summary: draft.summary.slice(0, 1500),
    details: draft.details.slice(0, 40).map((line) => line.slice(0, 400)),
  };
  await addDoc(historyRef(uid), { ...safe, createdAt: Date.now() });
}

export const deleteHistory = (uid: string, id: string) => deleteDoc(doc(getDb(), 'users', uid, 'history', id));

/** Removes the profile, consent and every saved result for this account. */
export async function eraseUserData(uid: string) {
  const entries = await getDocs(historyRef(uid));
  const batch = writeBatch(getDb());
  entries.forEach((entry) => batch.delete(entry.ref));
  batch.delete(userRef(uid));
  await batch.commit();
}

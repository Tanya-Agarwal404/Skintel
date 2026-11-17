import { useCallback, useEffect, useState } from 'react';
import type { Consent, SkinProfile } from '@/lib/skin-profile';
import { eraseUserData, loadUserData, saveUserData } from '@/lib/user-data';

/** Profile and consent are saved to this account's Firestore document and sent per request, never kept anywhere else. */
export function useSkinStore(uid: string | undefined) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<SkinProfile | null>(null);
  const [consent, setConsentState] = useState<Consent | null>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setReady(false);
    loadUserData(uid)
      .then((data) => {
        if (cancelled) return;
        setProfileState(data.profile);
        setConsentState(data.consent);
      })
      .catch(() => !cancelled && setSaveError('Could not load your saved profile. Check your connection and refresh.'))
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const persist = useCallback((patch: { profile?: SkinProfile; consent?: Consent }) => {
    if (!uid) return;
    setSaveError('');
    saveUserData(uid, patch).catch(() => setSaveError('Could not save to your account. Your changes may be lost if you leave.'));
  }, [uid]);

  const setProfile = useCallback((next: SkinProfile) => {
    setProfileState(next);
    persist({ profile: next });
  }, [persist]);
  const saveAll = useCallback((nextProfile: SkinProfile, nextConsent: Consent) => {
    setProfileState(nextProfile);
    setConsentState(nextConsent);
    persist({ profile: nextProfile, consent: nextConsent });
  }, [persist]);
  const eraseAll = useCallback(async () => {
    if (!uid) return;
    try {
      await eraseUserData(uid);
      setProfileState(null);
      setConsentState(null);
      setSaveError('');
    } catch {
      setSaveError('Could not erase your data. Please try again.');
    }
  }, [uid]);

  return { ready, profile, consent, saveError, setProfile, saveAll, eraseAll };
}

import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { authMessage } from '@/lib/auth';
import { getFirebaseAuth } from '@/lib/firebase';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    oobCode: typeof search['oobCode'] === 'string' ? search['oobCode'] : '',
  }),
  head: () => ({ meta: [
    { title: 'Choose a new password — Skintel' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: ResetPasswordPage,
});

type Phase = 'checking' | 'ready' | 'done' | 'invalid';

function ResetPasswordPage() {
  const { oobCode } = Route.useSearch();
  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!oobCode) { setError('This page needs the link from your reset email. Ask for a new one from the sign-in page.'); setPhase('invalid'); return; }
    verifyPasswordResetCode(getFirebaseAuth(), oobCode)
      .then((address) => { setEmail(address); setPhase('ready'); })
      .catch((failure) => { setError(authMessage(failure)); setPhase('invalid'); });
  }, [oobCode]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) return setError('Use a password with at least 6 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    setBusy(true);
    setError('');
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      setPhase('done');
    } catch (failure) {
      setError(authMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  return <div className="page-wrap">
    <header className="site-header"><Link className="wordmark" to="/" aria-label="Skintel home">skintel<span>✳</span></Link><Link className="text-link" to="/"><ArrowLeft size={14} /> Back to site</Link></header>
    <main className="studio auth-page">
      <div className="eyebrow"><span>✳</span> Your Skintel account</div>
      <h1 className="editorial-title">{phase === 'done' ? <>Password <em>updated.</em></> : <>Choose a <em>new password.</em></>}</h1>
      {phase === 'checking' && <p className="panel-help" role="status">Checking your link…</p>}
      {phase === 'invalid' && <>
        <p className="form-error" role="alert">{error}</p>
        <Button variant="hero" asChild><Link to="/auth">Back to sign in</Link></Button>
      </>}
      {phase === 'ready' && <form className="studio-form" onSubmit={(event) => void submit(event)}>
        <p className="panel-help">Setting a new password for {email}.</p>
        <label className="field">New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={6} required /></label>
        <label className="field">Confirm new password<input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={6} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button variant="hero" type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : 'Save new password'}</Button>
      </form>}
      {phase === 'done' && <>
        <p className="panel-help" role="status">You can now sign in with your new password.</p>
        <Button variant="hero" asChild><Link to="/auth">Sign in</Link></Button>
      </>}
    </main>
  </div>;
}

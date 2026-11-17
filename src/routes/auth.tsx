import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authMessage, useAuth } from '@/lib/auth';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Sign in or create an account — Skintel' },
    { name: 'description', content: 'Create a Skintel account to save your skin profile and results, or sign in to pick up where you left off.' },
  ] }),
  component: AuthPage,
});

type Mode = 'signup' | 'signin';

function AuthPage() {
  const { user, ready, signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageOk, setAgeOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (ready && user) void navigate({ to: '/studio' });
  }, [ready, user, navigate]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await action();
    } catch (failure) {
      setError(authMessage(failure));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'signup') {
      if (!name.trim()) return setError('Please add your first name.');
      if (!ageOk) return setError('Please confirm the age statement to create an account.');
      return void run(() => signUp(name.trim(), email.trim(), password));
    }
    void run(() => signIn(email.trim(), password));
  };

  const forgot = () => {
    if (!email.trim()) return setError('Type your email above first, then tap “Forgot password”.');
    void run(async () => {
      await resetPassword(email.trim());
      setInfo('If that email has an account, a reset link is on its way.');
    });
  };

  return <div className="page-wrap">
    <header className="site-header"><Link className="wordmark" to="/" aria-label="Skintel home">skintel<span>✳</span></Link><Link className="text-link" to="/"><ArrowLeft size={14} /> Back to site</Link></header>
    <main className="studio auth-page">
      <div className="eyebrow"><span>✳</span> Your Skintel account</div>
      <h1 className="editorial-title">{mode === 'signup' ? <>Create your <em>account.</em></> : <>Welcome <em>back.</em></>}</h1>
      <div className="studio-tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'signup'} className="studio-tab" onClick={() => { setMode('signup'); setError(''); setInfo(''); }}>Sign up</button>
        <button role="tab" aria-selected={mode === 'signin'} className="studio-tab" onClick={() => { setMode('signin'); setError(''); setInfo(''); }}>Sign in</button>
      </div>
      <form className="studio-form" onSubmit={submit}>
        {mode === 'signup' && <label className="field">First name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" /></label>}
        <label className="field">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label className="field">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required /></label>
        {mode === 'signup' && <label className="check"><input type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} /> I am 13 or older, or a parent or guardian is helping me create this account.</label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {info && <p className="panel-help" role="status">{info}</p>}
        <Button variant="hero" type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : mode === 'signup' ? 'Create account' : 'Sign in'}</Button>
        <Button variant="outline" type="button" disabled={busy} onClick={() => void run(signInWithGoogle)}>Continue with Google</Button>
        {mode === 'signin' && <button type="button" className="link-button" onClick={forgot}>Forgot password?</button>}
      </form>
      <p className="disclaimer">Your profile and any results you choose to save are stored in your Skintel account so they follow you across devices. Photos are never stored. You can erase everything from the Studio at any time.</p>
    </main>
  </div>;
}

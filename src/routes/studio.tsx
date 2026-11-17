import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, History, ListChecks, LogOut, ScanLine, ScanFace, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsentAndProfile } from '@/components/skintel/consent-and-profile';
import { RoutinePanel } from '@/components/skintel/routine-panel';
import { LabelReader, SkinAnalyser } from '@/components/skintel/analysis-panels';
import { HistoryPanel } from '@/components/skintel/history-panel';
import { SiteTour } from '@/components/skintel/site-tour';
import { useAuth } from '@/lib/auth';
import { photoAllowed } from '@/lib/skin-profile';
import { useSkinStore } from '@/lib/use-skin-store';

export const Route = createFileRoute('/studio')({
  head: () => ({ meta: [
    { title: 'Skintel Studio — your profile, skin check, label reader and routine' },
    { name: 'description', content: 'Set up your skin profile, check your skin with a photo, and read product labels to see what suits you.' },
  ] }),
  component: Studio,
});

type Tab = 'profile' | 'skin' | 'label' | 'routine' | 'history';

function Studio() {
  const { user, ready: authReady, tourPending, finishTour, signOut } = useAuth();
  const navigate = useNavigate();
  const { ready, profile, consent, saveError, setProfile, saveAll, eraseAll } = useSkinStore(user?.uid);
  const [tab, setTab] = useState<Tab | null>(null);

  useEffect(() => {
    if (authReady && !user) void navigate({ to: '/auth' });
  }, [authReady, user, navigate]);

  const unlocked = photoAllowed(profile, consent);
  const active: Tab = tab ?? (unlocked ? 'skin' : 'profile');
  const addProduct = (name: string) => {
    if (profile && !profile.products.includes(name) && profile.products.length < 20) setProfile({ ...profile, products: [...profile.products, name] });
  };
  const tabs: [Tab, string, typeof UserRound][] = [['profile', 'Your profile', UserRound], ['skin', 'Skin check', ScanFace], ['label', 'Label reader', ScanLine], ['routine', 'My routine', ListChecks], ['history', 'My history', History]];
  const uid = user?.uid;

  return <div className="page-wrap">
    <header className="site-header"><Link className="wordmark" to="/" aria-label="Skintel home">skintel<span>✳</span></Link><div className="header-actions"><Link className="text-link" to="/" data-tour="back-to-site"><ArrowLeft size={14} /> Back to site</Link><Button variant="ghost" data-tour="sign-out" onClick={() => void signOut().then(() => navigate({ to: '/' }))}><LogOut size={14} /> Sign out</Button></div></header>
    <main className="studio">
      <div className="eyebrow"><span>✳</span> Skintel Studio</div>
      <h1 className="editorial-title">{profile ? <>Hi {profile.name}, <em>let’s look.</em></> : <>Tell us about <em>your skin.</em></>}</h1>
      {!authReady || !user || !ready ? <p className="panel-help">Loading…</p> : <>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        <div className="studio-tabs" role="tablist">{tabs.map(([id, label, Icon]) => <button key={id} role="tab" aria-selected={active === id} className="studio-tab" data-tour={`tab-${id}`} disabled={id !== 'profile' && id !== 'history' && !unlocked} onClick={() => setTab(id)}><Icon size={15} /> {label}</button>)}</div>
        {active === 'profile' && <section className="studio-panel">
          <ConsentAndProfile initial={profile} consent={consent} defaultName={user.displayName ?? ''} onSave={(nextProfile, nextConsent) => { saveAll(nextProfile, nextConsent); setTab('skin'); }} />
          {profile && <Button variant="outline" onClick={() => { void eraseAll().then(() => setTab('profile')); }}>Erase my profile, consent and saved history</Button>}
        </section>}
        {active === 'skin' && profile && unlocked && uid && <SkinAnalyser profile={profile} uid={uid} />}
        {active === 'label' && profile && unlocked && uid && <LabelReader profile={profile} uid={uid} onAddProduct={addProduct} />}
        {active === 'routine' && profile && unlocked && uid && <RoutinePanel profile={profile} uid={uid} onProductsChange={(products) => setProfile({ ...profile, products })} onEditProfile={() => setTab('profile')} />}
        {active === 'history' && uid && <HistoryPanel uid={uid} />}
      </>}
    </main>
    <SiteTour open={tourPending && ready} onClose={finishTour} />
  </div>;
}

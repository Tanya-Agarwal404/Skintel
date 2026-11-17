import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getIdToken } from '@/lib/firebase';
import { buildRoutine, type RoutinePlan, type RoutineStep } from '@/lib/skintel-ai.functions';
import { SaveButton } from '@/components/skintel/history-panel';
import { currentCycle, withoutCycleDates, type SkinProfile } from '@/lib/skin-profile';

const removeCopy: Record<RoutinePlan['remove'][number]['action'], string> = {
  stop: 'Stop using',
  pause: 'Pause',
  swap: 'Swap out',
  use_less: 'Use less often',
};

const Steps = ({ title, steps }: { title: string; steps: RoutineStep[] }) => steps.length === 0 ? null : <div className="routine-block">
  <h3>{title}</h3>
  <ol className="routine-steps">{steps.map((item) => <li className="routine-step" key={item.step + item.product}>
    <strong>{item.step}</strong> · {item.product} {item.owned && <span className="tag tag-owned">you have it</span>}
    <small>{item.note}</small>
  </li>)}</ol>
</div>;

export function RoutinePanel({ profile, uid, onProductsChange, onEditProfile }: {
  profile: SkinProfile;
  uid: string;
  onProductsChange: (products: string[]) => void;
  onEditProfile: () => void;
}) {
  const call = useServerFn(buildRoutine);
  const [draft, setDraft] = useState('');
  const [plan, setPlan] = useState<RoutinePlan | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cycle = currentCycle(profile.cycle);

  const addProduct = (event: React.FormEvent) => {
    event.preventDefault();
    const name = draft.trim().slice(0, 80);
    if (!name || profile.products.includes(name) || profile.products.length >= 20) return;
    onProductsChange([...profile.products, name]);
    setDraft('');
  };

  const build = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await call({ data: { idToken: await getIdToken(), profile: withoutCycleDates(profile), cycle } });
      if (response.ok) setPlan(response.data);
      else setError(response.error);
    } catch {
      setError('Could not reach the routine service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="studio-panel" aria-labelledby="routine-heading">
    <h2 id="routine-heading" className="demo-title">My routine</h2>
    <p className="panel-help">List what you already use. Skintel builds a routine around it and tells you what to keep, add or drop.</p>
    <form className="product-add" onSubmit={addProduct}>
      <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={80} placeholder="e.g. Cetaphil gentle cleanser" aria-label="Add a product you use" />
      <Button type="submit" variant="outline" disabled={!draft.trim()}>Add</Button>
    </form>
    {profile.products.length > 0 ? <div className="chip-row">{profile.products.map((product) => <button type="button" key={product} className="chip" aria-label={`Remove ${product}`} onClick={() => onProductsChange(profile.products.filter((item) => item !== product))}>{product} <X size={12} /></button>)}</div>
      : <p className="panel-help">No products yet. You can still build a starter routine, or add products from the Label reader.</p>}
    {cycle ? <p className="demo-label">Cycle day {cycle.day} of {cycle.length} · {cycle.phase} phase</p>
      : <p className="panel-help">Want a routine that follows your cycle? <button type="button" className="text-link" onClick={onEditProfile}>Add it in your profile</button>.</p>}
    <Button variant="hero" disabled={busy} onClick={build}>{busy ? <><Loader2 className="animate-spin" /> Building your routine…</> : plan ? 'Rebuild my routine' : 'Build my routine'}</Button>
    {error && <p className="form-error" role="alert">{error}</p>}
    {plan && <div className="result" aria-live="polite">
      <p>{plan.summary}</p>
      <div className="routine-columns"><Steps title="Morning" steps={plan.am} /><Steps title="Night" steps={plan.pm} /></div>
      <Steps title="Some days of the week" steps={plan.weekly} />
      {plan.keep.length > 0 && <><h3>Keep</h3><ul className="result-list">{plan.keep.map((item) => <li key={item.product}><strong>{item.product}</strong> · {item.reason}</li>)}</ul></>}
      {plan.add.length > 0 && <><h3>Worth adding</h3><ul className="result-list">{plan.add.map((item) => <li key={item.product}><strong>{item.product}</strong> <span className="tag">{item.approx_price_inr}</span><br />{item.why}</li>)}</ul></>}
      {plan.remove.length > 0 && <><h3>Consider changing</h3><ul className="result-list">{plan.remove.map((item) => <li key={item.product}><strong>{item.product}</strong> <span className="tag tag-caution">{removeCopy[item.action]}</span><br />{item.reason}</li>)}</ul></>}
      {plan.cycle_plan.length > 0 && <><h3>Through your cycle</h3>
        <div className="routine-steps">{plan.cycle_plan.map((item) => <div className="phase-card" key={item.phase} data-current={cycle?.phase === item.phase}>
          <h4>{item.phase} · days {item.days}{cycle?.phase === item.phase && ' · you are here'}</h4>
          <p>{item.skin_tendency}</p>
          <ul className="result-list">{item.tweaks.map((tweak) => <li key={tweak}>{tweak}</li>)}</ul>
        </div>)}</div></>}
      {plan.see_a_professional && <p className="result-note"><AlertTriangle size={14} /> {plan.see_a_professional}</p>}
      <SaveButton uid={uid} build={() => ({ kind: 'routine', title: 'My routine', summary: plan.summary, details: [...plan.am.map((item) => `Morning · ${item.step}: ${item.product}`), ...plan.pm.map((item) => `Night · ${item.step}: ${item.product}`), ...plan.weekly.map((item) => `Weekly · ${item.step}: ${item.product}`)] })} />
    </div>}
    <p className="disclaimer">Routines are educational suggestions based on product names you typed, not medical advice. Patch-test anything new, and check labels with the Label reader.</p>
  </section>;
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SkinTypeQuiz } from '@/components/skintel/skin-type-quiz';
import { CONCERNS, SKIN_TYPES, profileSchema, type Consent, type SkinProfile } from '@/lib/skin-profile';

const BUDGETS = ['under ₹300', '₹300–₹800', '₹800+'] as const;

export function ConsentAndProfile({ initial, consent, defaultName = '', onSave }: {
  initial: SkinProfile | null;
  defaultName?: string;
  consent: Consent | null;
  onSave: (profile: SkinProfile, consent: Consent) => void;
}) {
  const [name, setName] = useState(initial?.name ?? defaultName);
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [skinType, setSkinType] = useState<SkinProfile['skinType']>(initial?.skinType ?? 'not sure');
  const [concerns, setConcerns] = useState<SkinProfile['concerns']>(initial?.concerns ?? []);
  const [allergies, setAllergies] = useState(initial?.allergies ?? '');
  const [budget, setBudget] = useState<SkinProfile['budget']>(initial?.budget ?? '₹300–₹800');
  const [tracksCycle, setTracksCycle] = useState(Boolean(initial?.cycle));
  const [lastPeriod, setLastPeriod] = useState(initial?.cycle?.lastPeriodStart ?? '');
  const [cycleLength, setCycleLength] = useState(String(initial?.cycle?.cycleLength ?? 28));
  const [agreed, setAgreed] = useState(Boolean(consent));
  const [guardian, setGuardian] = useState(consent?.guardianConfirmed ?? false);
  const [error, setError] = useState('');

  const numericAge = Number(age);
  const minor = age !== '' && numericAge < 18;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const cycle = tracksCycle ? { lastPeriodStart: lastPeriod, cycleLength: Number(cycleLength) } : null;
    const parsed = profileSchema.safeParse({ name, age: numericAge, skinType, concerns, allergies, budget, products: initial?.products ?? [], cycle });
    if (!parsed.success) return setError(tracksCycle ? 'Please check your name, age, last period date and a cycle length between 21 and 40 days.' : 'Please add your name and an age between 10 and 100.');
    if (!agreed) return setError('Please accept how your information is used to continue.');
    if (parsed.data.age < 18 && !guardian) return setError('A parent or guardian needs to confirm for users under 18.');
    setError('');
    onSave(parsed.data, { acceptedAt: consent?.acceptedAt ?? new Date().toISOString(), guardianConfirmed: guardian });
  };

  const toggleConcern = (concern: SkinProfile['concerns'][number]) =>
    setConcerns((current) => current.includes(concern) ? current.filter((item) => item !== concern) : [...current, concern]);

  return <form className="studio-form" onSubmit={submit}>
    <div className="field-row" data-tour="profile-basics">
      <label className="field">Your name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" /></label>
      <label className="field">Age<input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" /></label>
    </div>
    <fieldset className="field" data-tour="skin-type"><legend>Skin type</legend><div className="chip-row">{SKIN_TYPES.filter((type) => type !== 'not sure').map((type) => <button type="button" key={type} className="chip" aria-pressed={skinType === type} onClick={() => setSkinType(type)}>{type}</button>)}</div><SkinTypeQuiz onResult={setSkinType} /></fieldset>
    <fieldset className="field" data-tour="concerns"><legend>What bothers you? (pick any)</legend><div className="chip-row">{CONCERNS.map((concern) => <button type="button" key={concern} className="chip" aria-pressed={concerns.includes(concern)} onClick={() => toggleConcern(concern)}>{concern}</button>)}</div></fieldset>
    <label className="field" data-tour="allergies">Known allergies or ingredients that irritate you<input value={allergies} onChange={(e) => setAllergies(e.target.value)} maxLength={200} placeholder="e.g. fragrance, salicylic acid" /></label>
    <fieldset className="field" data-tour="budget"><legend>Monthly skincare budget per product</legend><div className="chip-row">{BUDGETS.map((option) => <button type="button" key={option} className="chip" aria-pressed={budget === option} onClick={() => setBudget(option)}>{option}</button>)}</div></fieldset>
    <fieldset className="field" data-tour="cycle"><legend>Cycle-aware routine (optional)</legend>
      <label className="check"><input type="checkbox" checked={tracksCycle} onChange={(e) => setTracksCycle(e.target.checked)} /> I get periods and want my routine to follow my cycle.</label>
      {tracksCycle && <div className="field-row">
        <label className="field">First day of your last period<input type="date" value={lastPeriod} max={new Date().toLocaleDateString('en-CA')} onChange={(e) => setLastPeriod(e.target.value)} /></label>
        <label className="field">Usual cycle length (days)<input value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} inputMode="numeric" /></label>
      </div>}
      {tracksCycle && <p className="panel-help">Saved to your account. Only your current phase, never the dates, is sent to the AI when you build a routine.</p>}
    </fieldset>
    <div className="consent-box" data-tour="consent">
      <p><strong>How your information is used.</strong> Your profile is saved to your Skintel account so it is there when you sign in. When you analyse a photo, the photo and your profile (without cycle dates) are sent securely to our AI service to produce the result. Photos are never saved by Skintel, and results are saved only if you tap Save. You can erase everything at any time. Skintel is educational and is not medical advice.</p>
      <label className="check"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> I understand and agree.</label>
      {minor && <label className="check"><input type="checkbox" checked={guardian} onChange={(e) => setGuardian(e.target.checked)} /> My parent or guardian has read this and agrees to my using Skintel.</label>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <Button variant="hero" type="submit" data-tour="save-profile">{initial ? 'Update my profile' : 'Save and continue'}</Button>
  </form>;
}

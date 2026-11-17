import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Step = { target?: string; title: string; text: string };

/** Each step points at a real control in the Studio (found through its data-tour attribute). */
const STEPS: Step[] = [
  { title: 'Welcome to Skintel', text: 'A quick walk around the Studio, pointing at each control and what it does. You can skip it any time.' },
  { target: 'profile-basics', title: 'Your name and age', text: 'Type your first name and age. Age decides the advice we give, and if you are under 18 we will ask a parent or guardian to confirm before you continue.' },
  { target: 'skin-type', title: 'Skin type', text: 'Tap the one that sounds most like your skin. Not sure? Use “Find out in 4 quick questions” underneath and Skintel will pick one for you. It decides how products and routines are matched to you.' },
  { target: 'concerns', title: 'What bothers you', text: 'Tap every concern you have, such as acne or dark spots. Results and routines are tuned to these.' },
  { target: 'allergies', title: 'Allergies and irritants', text: 'List anything that has ever stung or caused a rash. Skintel will flag these ingredients on labels and keep them out of your routine.' },
  { target: 'budget', title: 'Budget', text: 'Pick what you are happy to spend per product each month, so suggestions stay realistic.' },
  { target: 'cycle', title: 'Cycle-aware routine (optional)', text: 'Tick this only if you want your routine to shift through the month. Your dates stay in your account. Only the current phase, never the dates, is ever shared with the AI.' },
  { target: 'consent', title: 'How your information is used', text: 'Read this, then tick “I understand and agree”. It explains what is saved, what is sent for analysis, and that photos are never stored.' },
  { target: 'save-profile', title: 'Save and continue', text: 'Tap this to save your profile. It unlocks the Skin check, Label reader and My routine tabs.' },
  { target: 'tab-skin', title: 'Skin check tab', text: 'Upload or take a photo in soft light, then tap Analyse. Skintel describes what it can see and what may help. The photo is sent only when you tap Analyse and is never stored.' },
  { target: 'tab-label', title: 'Label reader tab', text: 'Photograph the ingredient list on a product and tap Analyse. Each ingredient is explained in plain words, with a verdict on whether it suits your skin.' },
  { target: 'tab-routine', title: 'My routine tab', text: 'Add the products you already use. Skintel builds a simple morning and night routine around them and says what to keep, add or drop.' },
  { target: 'tab-history', title: 'My history tab', text: 'Results you save with “Save to my history” appear here on any device. Only text is kept, and you can delete any item.' },
  { target: 'sign-out', title: 'Sign out', text: 'Tap here when you are done, especially on a shared device. Your profile and saved results stay in your account. You can erase them from the Your profile tab.' },
];

const PAD = 8;
const GAP = 14;

type Placement = { spot: { top: number; left: number; width: number; height: number } | null; card: { top: number; left: number } | null };

/** Shown once, straight after a new account is created, never after signing in. */
export function SiteTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<Placement>({ spot: null, card: null });
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const { target, title, text } = STEPS[step]!;
  const last = step === STEPS.length - 1;
  const close = useCallback(() => { onClose(); setStep(0); }, [onClose]);

  const measure = useCallback(() => {
    const card = cardRef.current;
    const el = target ? document.querySelector<HTMLElement>(`[data-tour="${target}"]`) : null;
    if (!card || !el) { setPlace({ spot: null, card: null }); return; }
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const spot = { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
    const below = spot.top + spot.height + GAP;
    const above = spot.top - GAP - ch;
    const top = below + ch <= vh - 12 ? below : above >= 12 ? above : Math.max(12, vh - ch - 12);
    const left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), vw - cw - 12);
    setPlace({ spot, card: { top, left } });
  }, [target]);

  useLayoutEffect(() => {
    if (!open) return;
    const el = target ? document.querySelector<HTMLElement>(`[data-tour="${target}"]`) : null;
    el?.scrollIntoView({ block: 'center', behavior: 'auto' });
    measure();
  }, [open, step, target, measure]);

  useEffect(() => {
    if (!open) return;
    nextRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); window.removeEventListener('keydown', onKey); };
  }, [open, step, measure, close]);

  if (!open) return null;
  const centered = !place.card;
  return <div className="tour-layer">
    <div className="tour-blocker" onClick={close} aria-hidden />
    {place.spot ? <div className="tour-spot" style={place.spot} aria-hidden /> : <div className="tour-dim" aria-hidden />}
    <div ref={cardRef} className="tour-card" data-centered={centered} role="dialog" aria-modal="true" aria-labelledby="tour-title"
      style={place.card ? { top: place.card.top, left: place.card.left } : undefined}>
      <span className="demo-label">Tour · {step + 1} of {STEPS.length}</span>
      <h2 id="tour-title" className="tour-title">{title}</h2>
      <p className="panel-help">{text}</p>
      <div className="image-actions">
        {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
        {last ? <Button ref={nextRef} variant="hero" onClick={close}>Start with my profile</Button> : <Button ref={nextRef} variant="hero" onClick={() => setStep(step + 1)}>Next</Button>}
        {!last && <Button variant="ghost" onClick={close}>Skip tour</Button>}
      </div>
    </div>
  </div>;
}

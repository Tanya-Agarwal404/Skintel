import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SkinProfile } from '@/lib/skin-profile';

type Type = Exclude<SkinProfile['skinType'], 'not sure'>;
type Question = { id: string; prompt: string; options: [string, Type][] };

const QUESTIONS: Question[] = [
  { id: 'after-wash', prompt: 'An hour after washing your face, with nothing applied, how does it feel?', options: [['Tight, rough or flaky', 'dry'], ['Comfortable and balanced', 'normal'], ['Shiny on forehead and nose only', 'combination'], ['Shiny or greasy all over', 'oily']] },
  { id: 'afternoon', prompt: 'By the afternoon, how does your skin usually look?', options: [['Dull or papery', 'dry'], ['Pretty much the same as the morning', 'normal'], ['Oily in the T-zone, fine on the cheeks', 'combination'], ['Shiny everywhere', 'oily']] },
  { id: 'pores', prompt: 'How do your pores look?', options: [['Barely visible', 'dry'], ['Small and not noticeable', 'normal'], ['Visible on nose and chin only', 'combination'], ['Large and visible on most of my face', 'oily']] },
  { id: 'reaction', prompt: 'How does your skin react to new products?', options: [['It often stings, burns or turns red', 'sensitive'], ['Rarely or never', 'normal']] },
];

const EXPLAIN: Record<Type, string> = {
  dry: 'Your skin makes less oil than average, so it can feel tight. Gentle, hydrating products and a good moisturiser tend to help.',
  normal: 'Your skin looks fairly balanced. A simple routine of cleanser, moisturiser and sunscreen is usually enough.',
  combination: 'Your T-zone is oilier than your cheeks. Light, balanced products usually suit you best.',
  oily: 'Your skin makes extra oil. Light, non-greasy products tend to work well, and you still need a moisturiser.',
  sensitive: 'Your skin reacts easily, so fragrance-free, simple formulas and patch-testing new products are the safest approach.',
};

/** Works out a skin type from four quick questions, for people who don't know theirs. */
export function skinTypeFromAnswers(answers: (Type | undefined)[]): Type | null {
  if (answers.some((a) => !a)) return null;
  if (answers[3] === 'sensitive') return 'sensitive';
  const tally: Record<string, number> = {};
  for (const a of answers.slice(0, 3)) tally[a!] = (tally[a!] ?? 0) + 1;
  const top = Math.max(...Object.values(tally));
  const leaders = Object.keys(tally).filter((k) => tally[k] === top);
  // On a tie, trust the first question (how skin feels after washing) over the others.
  return (leaders.includes(answers[0]!) ? answers[0]! : leaders[0]!) as Type;
}

export function SkinTypeQuiz({ onResult }: { onResult: (type: Type) => void }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<(Type | undefined)[]>([]);
  const [result, setResult] = useState<Type | null>(null);

  if (!open) return <Button type="button" variant="outline" className="quiz-open" onClick={() => setOpen(true)}>Not sure? Find out in 4 quick questions</Button>;

  const finish = () => {
    const type = skinTypeFromAnswers(answers);
    if (!type) return;
    setResult(type);
    onResult(type);
  };
  const answered = QUESTIONS.every((_, i) => answers[i]);

  return <div className="quiz-box" role="group" aria-label="Skin type questions">
    {result ? <>
      <p className="demo-label">Your result</p>
      <h3 className="quiz-result">Your skin looks {result}.</h3>
      <p className="panel-help">{EXPLAIN[result]} We have selected it above. It is a helpful guide, not a diagnosis, and you can change it any time.</p>
      <div className="image-actions">
        <Button type="button" variant="outline" onClick={() => { setResult(null); setAnswers([]); }}>Retake</Button>
        <Button type="button" variant="ghost" onClick={() => { setOpen(false); setResult(null); setAnswers([]); }}>Close</Button>
      </div>
    </> : <>
      {QUESTIONS.map((q, qi) => <fieldset className="field" key={q.id}>
        <legend>{qi + 1}. {q.prompt}</legend>
        <div className="chip-row">{q.options.map(([label, type]) => <button type="button" key={label} className="chip" aria-pressed={answers[qi] === type} onClick={() => setAnswers((cur) => { const next = [...cur]; next[qi] = type; return next; })}>{label}</button>)}</div>
      </fieldset>)}
      <div className="image-actions">
        <Button type="button" variant="hero" disabled={!answered} onClick={finish}>See my skin type</Button>
        <Button type="button" variant="ghost" onClick={() => { setOpen(false); setAnswers([]); }}>Cancel</Button>
      </div>
    </>}
  </div>;
}

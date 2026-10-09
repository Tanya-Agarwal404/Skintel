import { useState } from 'react';
import { CheckCircle2, Sun, Moon, Sparkles, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export type PreviewMode = 'scan' | 'routine' | 'learn' | null;

export function ExperiencePreview({ mode, onClose }: { mode: PreviewMode; onClose: () => void }) {
  const [scanned, setScanned] = useState(false);
  const [time, setTime] = useState<'am' | 'pm'>('am');
  const [question, setQuestion] = useState(0);
  const answers = [
    { question: 'Do I really need a 10-step routine?', answer: 'More isn’t always better. A gentle cleanser, moisturiser, and daytime sunscreen are a simple foundation. Adding lots of products can increase the chance of irritation. Persistent concerns deserve advice from a dermatologist.' },
    { question: 'What does a moisturiser actually do?', answer: 'Ingredients such as glycerin draw water into the skin. Emollients help soften it, while ingredients such as ceramides support the skin’s barrier. The right texture depends on how your skin feels.' },
    { question: 'Why is sunscreen a morning essential?', answer: 'Sun exposure happens even on cloudy days. A broad-spectrum SPF 30 or higher helps protect against UVA and UVB. Follow the label for application and reapplication, alongside shade and protective clothing.' },
  ];
  const answer = answers[question];
  return <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) { onClose(); setScanned(false); } }}>
    <DialogContent className="demo-dialog">
      <span className="demo-label">The Skintel experience · sample preview</span>
      <DialogTitle className="demo-title">{mode === 'scan' ? 'Meet your ingredients.' : mode === 'routine' ? 'Less guesswork. More care.' : 'A little skin wisdom.'}</DialogTitle>
      <DialogDescription>{mode === 'scan' ? 'Explore a sample moisturiser label — no photo or personal information needed.' : mode === 'routine' ? 'A simple example routine, not a personalised recommendation.' : 'Plain-language answers to the questions behind your shelf.'}</DialogDescription>
      {mode === 'scan' && <>
        <div className="demo-preview"><h3>Everyday gentle moisturiser</h3><p>Sample label: Aqua, Glycerin, Squalane, Ceramide NP, Panthenol.</p>
          {!scanned && <Button variant="hero" onClick={() => setScanned(true)}><ScanLine /> Decode sample label</Button>}
          {scanned && <div aria-live="polite">{[
            ['Glycerin', 'A humectant that helps skin hold on to water.'],
            ['Squalane', 'An emollient that helps soften the skin.'],
            ['Ceramide NP', 'Supports the skin’s protective barrier.'],
            ['Panthenol', 'Helps hydrate and soothe the skin.'],
          ].map(([name, description]) => <div className="ingredient-row" key={name}><div>{name}<small>{description}</small></div><CheckCircle2 /></div>)}</div>}
        </div>
        <p className="demo-disclaimer">Ingredient roles alone don’t establish product suitability. Concentration, formulation, allergies, and your skin all matter. Live camera scanning is not available on this website.</p>
      </>}
      {mode === 'routine' && <div className="demo-preview">
        <div className="demo-tabs"><Button variant={time === 'am' ? 'editorial' : 'outline'} onClick={() => setTime('am')}><Sun /> Morning</Button><Button variant={time === 'pm' ? 'editorial' : 'outline'} onClick={() => setTime('pm')}><Moon /> Evening</Button></div>
        {(time === 'am' ? [['Gentle cleanse', 'Start fresh without stripping your skin.'], ['Moisturise', 'Support your skin’s barrier.'], ['Broad-spectrum sunscreen', 'SPF 30+; follow the label and reapply.']] : [['Gentle cleanse', 'Wash away the day and sunscreen.'], ['Moisturise', 'Keep the evening simple and barrier-friendly.']]).map(([title, description], i) => <div className="demo-step" key={title}><span>0{i + 1}</span><div><h4>{title}</h4><p>{description}</p></div></div>)}
        <p className="demo-disclaimer">Your routine should reflect your own needs. For acne, irritation, or other persistent concerns, consult a dermatologist before adding treatments.</p>
      </div>}
      {mode === 'learn' && <>{answers.map((item, i) => <Button key={item.question} variant={i === question ? 'secondary' : 'outline'} className="justify-start whitespace-normal h-auto py-3 text-left" onClick={() => setQuestion(i)}><Sparkles />{item.question}</Button>)}{answer && <div className="demo-preview" aria-live="polite"><h3>{answer.question}</h3><p>{answer.answer}</p></div>}</>}
      <p className="demo-disclaimer">Skintel is pre-launch. Educational information only; not medical advice, a diagnosis, or a substitute for professional care.</p>
    </DialogContent>
  </Dialog>;
}
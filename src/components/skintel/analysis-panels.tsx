import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageInput, type CapturedImage } from '@/components/skintel/image-input';
import { getIdToken } from '@/lib/firebase';
import { analyzeLabel, analyzeSkin, type AiResult, type LabelAnalysis, type SkinAnalysis } from '@/lib/skintel-ai.functions';
import { withoutCycleDates, type SkinProfile } from '@/lib/skin-profile';
import { SaveButton } from '@/components/skintel/history-panel';

function useAnalysis<T>(run: (image: CapturedImage) => Promise<AiResult<T>>) {
  const [image, setImage] = useState<CapturedImage | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const analyse = async () => {
    if (!image) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await run(image);
      if (response.ok) setResult(response.data);
      else setError(response.error);
    } catch {
      setError('Could not reach the analysis service. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };
  return { image, setImage, result, error, busy, analyse };
}

const Note = ({ text }: { text: string }) => text ? <p className="result-note"><AlertTriangle size={14} /> {text}</p> : null;

export function SkinAnalyser({ profile, uid }: { profile: SkinProfile; uid: string }) {
  const call = useServerFn(analyzeSkin);
  const state = useAnalysis<SkinAnalysis>(async (image) => call({ data: { idToken: await getIdToken(), profile: withoutCycleDates(profile), image: { mediaType: image.mediaType, data: image.data } } }));
  const { result } = state;
  return <section className="studio-panel" aria-labelledby="skin-heading">
    <h2 id="skin-heading" className="demo-title">Live skin check</h2>
    <p className="panel-help">Face a window or soft light, no filters. Take a photo and Skintel describes what it can see.</p>
    <ImageInput facing="user" captureLabel="Capture" image={state.image} onChange={state.setImage} />
    <Button variant="hero" disabled={!state.image || state.busy} onClick={state.analyse}>{state.busy ? <><Loader2 className="animate-spin" /> Looking closely…</> : 'Analyse my skin'}</Button>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    {result && (result.image_usable ? <div className="result" aria-live="polite">
      <p className="demo-label">Confidence: {result.confidence} · Likely skin type: {result.likely_skin_type}</p>
      <p>{result.summary}</p>
      {result.observations.length > 0 && <ul className="result-list">{result.observations.map((item) => <li key={item.issue + item.where}><strong>{item.issue}</strong> <span className="tag">{item.severity}</span> · {item.where}<br />{item.explanation}</li>)}</ul>}
      {result.tips.length > 0 && <><h3>What may help</h3><ul className="result-list">{result.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul></>}
      <Note text={result.see_a_professional} />
      <SaveButton uid={uid} build={() => ({ kind: 'skin', title: `Skin check · ${result.likely_skin_type}`, summary: result.summary, details: [...result.observations.map((item) => `${item.issue} (${item.severity}, ${item.where}): ${item.explanation}`), ...result.tips.map((tip) => `Tip: ${tip}`)] })} />
    </div> : <p className="result-note"><AlertTriangle size={14} /> {result.image_note}</p>)}
    <p className="disclaimer">AI observations from one photo are not a diagnosis. See a dermatologist for persistent or painful skin problems.</p>
  </section>;
}

const verdictCopy: Record<LabelAnalysis['verdict'], string> = {
  good_fit: 'Good fit for you',
  maybe: 'Maybe — read the notes',
  not_needed: 'You may not need this',
  avoid: 'Better to avoid',
};

export function LabelReader({ profile, uid, onAddProduct }: { profile: SkinProfile; uid: string; onAddProduct?: (name: string) => void }) {
  const call = useServerFn(analyzeLabel);
  const state = useAnalysis<LabelAnalysis>(async (image) => call({ data: { idToken: await getIdToken(), profile: withoutCycleDates(profile), image: { mediaType: image.mediaType, data: image.data } } }));
  const { result } = state;
  return <section className="studio-panel" aria-labelledby="label-heading">
    <h2 id="label-heading" className="demo-title">Label reader</h2>
    <p className="panel-help">Photograph the ingredient list on the back of the product. Hold steady and fill the frame with the text.</p>
    <ImageInput facing="environment" captureLabel="Capture label" image={state.image} onChange={state.setImage} />
    <Button variant="hero" disabled={!state.image || state.busy} onClick={state.analyse}>{state.busy ? <><Loader2 className="animate-spin" /> Reading the label…</> : 'Read this label'}</Button>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    {result && (result.image_usable ? <div className="result" aria-live="polite">
      <p className="demo-label">{result.product_name} · {result.product_type}</p>
      <p className={`verdict verdict-${result.verdict}`}>{verdictCopy[result.verdict]}</p>
      <p>{result.verdict_reason}</p>
      {result.good_for_you.length > 0 && <><h3>Why it could work for you</h3><ul className="result-list">{result.good_for_you.map((line) => <li key={line}>{line}</li>)}</ul></>}
      {result.watch_out.length > 0 && <><h3>Watch out for</h3><ul className="result-list">{result.watch_out.map((line) => <li key={line}>{line}</li>)}</ul></>}
      <h3>What’s on the label</h3>
      <ul className="result-list">{result.ingredients.map((item) => <li key={item.name}><strong>{item.name}</strong> <span className={`tag tag-${item.fit}`}>{item.fit}</span><br />{item.what_it_does}</li>)}</ul>
      <p><strong>How to use:</strong> {result.how_to_use}</p>
      {onAddProduct && result.product_name && (profile.products.includes(result.product_name)
        ? <p className="panel-help">Saved in your products.</p>
        : <Button variant="outline" onClick={() => onAddProduct(result.product_name)}>Add to my products</Button>)}
      <Note text={result.see_a_professional} />
      <SaveButton uid={uid} build={() => ({ kind: 'label', title: result.product_name || 'Product label', summary: `${verdictCopy[result.verdict]}. ${result.verdict_reason}`, details: result.ingredients.map((item) => `${item.name} (${item.fit}): ${item.what_it_does}`) })} />
    </div> : <p className="result-note"><AlertTriangle size={14} /> {result.image_note}</p>)}
    <p className="disclaimer">Ingredient reading from a photo can miss or misread text. Check the pack, and patch-test new products.</p>
  </section>;
}

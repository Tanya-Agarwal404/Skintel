import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addHistory, deleteHistory, listHistory, type HistoryDraft, type HistoryItem } from '@/lib/user-data';

const KIND_LABEL: Record<HistoryItem['kind'], string> = { skin: 'Skin check', label: 'Label reader', routine: 'Routine' };

/** Saves one result to the account's history, only when the person taps it. */
export function SaveButton({ uid, build }: { uid: string; build: () => HistoryDraft }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const save = async () => {
    setState('saving');
    try {
      await addHistory(uid, build());
      setState('saved');
    } catch {
      setState('error');
    }
  };
  if (state === 'saved') return <p className="panel-help"><Check size={13} className="inline" /> Saved to your history.</p>;
  return <div>
    <Button variant="outline" disabled={state === 'saving'} onClick={save}>{state === 'saving' ? <><Loader2 className="animate-spin" /> Saving…</> : 'Save to my history'}</Button>
    {state === 'error' && <p className="form-error" role="alert">Could not save. Please try again.</p>}
  </div>;
}

export function HistoryPanel({ uid }: { uid: string }) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    listHistory(uid).then(setItems).catch(() => setError('Could not load your history. Check your connection and try again.'));
  }, [uid]);
  useEffect(load, [load]);

  const remove = async (id: string) => {
    try {
      await deleteHistory(uid, id);
      setItems((current) => current?.filter((item) => item.id !== id) ?? null);
    } catch {
      setError('Could not delete that item. Please try again.');
    }
  };

  return <section className="studio-panel" aria-labelledby="history-heading">
    <h2 id="history-heading" className="demo-title">My history</h2>
    <p className="panel-help">Results you chose to save. Only text is kept, never photos.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    {items === null && !error && <p className="panel-help">Loading…</p>}
    {items?.length === 0 && <p className="panel-help">Nothing saved yet. After a skin check, label read or routine, tap “Save to my history”.</p>}
    {items?.map((item) => <article className="history-item" key={item.id}>
      <p className="demo-label">{KIND_LABEL[item.kind]} · {new Date(item.createdAt).toLocaleDateString()}</p>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      {item.details.length > 0 && <details><summary>Details</summary><ul className="result-list">{item.details.map((line, index) => <li key={index}>{line}</li>)}</ul></details>}
      <Button variant="ghost" onClick={() => remove(item.id)}><Trash2 size={14} /> Delete</Button>
    </article>)}
  </section>;
}

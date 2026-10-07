import { useState } from 'react';
import { IcoRetour } from './Icones';

interface Props { onFermer: () => void; onTerminer: () => void; }
const layers = [
  ['litho', 'Lithosphère', '0–120 km', 'rigide'],
  ['upper', 'Manteau supérieur / asthénosphère', '120–700 km', 'solide déformable'],
  ['lower', 'Manteau inférieur', '700–2900 km', 'solide'],
  ['outer', 'Noyau externe', '2900–5100 km', 'liquide'],
  ['inner', 'Noyau interne', '5100–6375 km', 'solide'],
];
const questions = [
  ['Pourquoi le noyau externe est-il considéré comme liquide ?', 'Les ondes S ne le traversent pas, ce qui indique un milieu liquide.'],
  ['Que révèle une discontinuité sismique ?', 'Un changement de vitesse ou de trajectoire des ondes entre deux enveloppes.'],
  ['Quelle différence entre classification chimique et physique ?', 'La chimique distingue croûte, manteau et noyau ; la physique distingue lithosphère, manteau et noyau selon leur comportement.'],
];
export default function AtelierStructureTerre({ onFermer, onTerminer }: Props) {
  const [placed, setPlaced] = useState<string[]>([]); const [selected, setSelected] = useState<string | null>(null); const [error, setError] = useState(''); const [answers, setAnswers] = useState<boolean[]>([]);
  const expected = layers[placed.length]?.[0]; const complete = placed.length === layers.length;
  function validate() { if (!selected) return; if (selected !== expected) { setError(`Cette enveloppe n'est pas la suivante. Repère : ${layers[Number(expected === 'litho' ? 0 : layers.findIndex((l) => l[0] === expected))][2]}.`); return; } setPlaced((old) => [...old, selected]); setSelected(null); setError(''); }
  return <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl"><header className="mx-auto flex max-w-3xl items-center gap-3"><button onClick={onFermer} className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute"><span className="block h-5 w-5"><IcoRetour /></span></button><div className="min-w-0 flex-1"><p className="eyebrow">ورشة موجهة · بنية الأرض</p><h1 className="font-naskh truncate text-xl font-bold">بناء مقطع الكرة الأرضية</h1></div></header><main className="card mx-auto mt-5 max-w-3xl p-5"><p className="text-sm leading-relaxed text-mute">رتّب الأغلفة حسب العمق، ثم اربط كل غلاف بحالته الفيزيائية والدليل الزلزالي المناسب.</p><div className="mt-5 space-y-2">{layers.map(([id, title, depth, state], i) => <div key={id} className={`rounded-2xl border p-3 ${placed.includes(id) ? 'border-sage bg-sage-soft' : 'border-dashed border-line bg-paper'}`}><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-bold text-paper">{i + 1}</span><div><p className="text-sm font-bold">{placed.includes(id) ? title : 'غلاف مخفي'}</p>{placed.includes(id) && <p className="text-xs text-mute">{depth} · {state}</p>}</div></div></div>)}</div>{!complete && <><p className="mt-5 text-xs font-bold text-ink-soft">اختر الغلاف التالي حسب العمق</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{layers.filter(([id]) => !placed.includes(id)).map(([id, title, depth]) => <button key={id} onClick={() => { setSelected(id); setError(''); }} className={`rounded-2xl border p-3 text-right text-sm font-bold ${selected === id ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{title}<span className="mt-1 block text-xs font-normal text-mute">{depth}</span></button>)}</div>{error && <p className="mt-3 rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">{error}</p>}<button onClick={validate} disabled={!selected} className="btn btn-primary mt-4 w-full">تثبيت الغلاف</button></>}{complete && <section className="mt-5 border-t border-line pt-5"><p className="eyebrow">الاسترجاع النشط</p>{questions.map(([q, a], i) => <button key={q} onClick={() => setAnswers((old) => { const next = [...old]; next[i] = true; return next; })} className="mt-2 w-full rounded-2xl border border-line bg-paper p-3 text-right text-sm font-bold">{q}<span className="mt-1 block text-xs text-forest">{answers[i] ? a : 'حاول ثم أظهر الجواب'}</span></button>)}<button onClick={onTerminer} disabled={answers.length !== 3 || !answers.every(Boolean)} className="btn btn-primary mt-5 w-full">أنهيت الورشة ✓</button></section>}</main></div>;
}

import { useState } from 'react';
import { IcoRetour } from './Icones';

interface Props { onFermer: () => void; onTerminer: () => void; }
const stages = [
  ['1', 'استقرار القشرة القارية', 'قشرة قارية مستقرة فوق البرنس الليتوسفيري.'],
  ['2', 'التباعد والتمدد', 'تؤدي قوى التباعد إلى تشققات وهبوط القشرة وتكوّن حوض أولي.'],
  ['3', 'اتساع الحوض المحيطي', 'يتشكل قاع محيطي وتترسب الصخور الرسوبية على الحافتين.'],
  ['4', 'التقارب والضغط', 'تتقارب الصفائح؛ يحدث الغوص وتتراكم الرواسب وتتضاغط القشرة.'],
  ['5', 'التصادم وتكوّن السلسلة الجبلية', 'يتشكل معقد أفيوليتي وطيات وفوالق وسلسلة جبلية: الأوروجينيز.'],
];
const questions = [
  ['ماذا تفعل قوى التباعد في المرحلة 2؟', 'تمدد القشرة وتفتح حوضًا أوليًا.'],
  ['ماذا يحدث عند التقارب؟', 'تتقارب الصفائح ويحدث الضغط والغوص.'],
  ['ما نتيجة التصادم القاري؟', 'تكوّن سلسلة جبلية وبنيات انضغاطية.'],
];
export default function AtelierOrogenese({ onFermer, onTerminer }: Props) {
  const [placed, setPlaced] = useState<string[]>([]); const [selected, setSelected] = useState<string | null>(null); const [error, setError] = useState(''); const [answers, setAnswers] = useState<boolean[]>([]);
  const expected = stages[placed.length]?.[0];
  function validate() { if (!selected) return; if (selected !== expected) { setError(`هذه ليست المرحلة التالية. ${stages[Number(expected) - 1]?.[2]}`); return; } setPlaced((old) => [...old, selected]); setSelected(null); setError(''); }
  const complete = placed.length === stages.length;
  return <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl"><header className="mx-auto flex max-w-3xl items-center gap-3"><button onClick={onFermer} className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute"><span className="block h-5 w-5"><IcoRetour /></span></button><div className="min-w-0 flex-1"><p className="eyebrow">ورشة موجهة · التكتونية</p><h1 className="font-naskh truncate text-xl font-bold">من التباعد إلى تشكّل السلسلة الجبلية</h1></div></header><main className="card mx-auto mt-5 max-w-3xl p-5"><p className="text-sm leading-relaxed text-mute">حوّل المخطط التحصيلي إلى تسلسل سببي: لا تحفظ الرسومات فقط، بل فسّر القوة التكتونية والنتيجة في كل مرحلة.</p><div className="mt-5 space-y-2">{stages.map(([id, title, detail]) => <div key={id} className={`rounded-2xl border p-3 ${placed.includes(id) ? 'border-sage bg-sage-soft' : 'border-dashed border-line bg-paper'}`}><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-bold text-paper">{id}</span><p className="text-sm font-bold">{placed.includes(id) ? title : 'مرحلة مخفية'}</p></div>{placed.includes(id) && <p className="mt-1 text-xs leading-relaxed text-mute">{detail}</p>}</div>)}</div>{!complete && <><p className="mt-5 text-xs font-bold text-ink-soft">اختر المرحلة التالية</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{stages.filter(([id]) => !placed.includes(id)).map(([id, title]) => <button key={id} onClick={() => { setSelected(id); setError(''); }} className={`rounded-2xl border p-3 text-right text-sm font-bold ${selected === id ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{id}. {title}</button>)}</div>{error && <p className="mt-3 rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">{error}</p>}<button onClick={validate} disabled={!selected} className="btn btn-primary mt-4 w-full">تثبيت المرحلة</button></>}{complete && <section className="mt-5 border-t border-line pt-5"><p className="eyebrow">الاسترجاع النشط</p>{questions.map(([question, answer], i) => <button key={question} onClick={() => setAnswers((old) => { const next = [...old]; next[i] = true; return next; })} className="mt-2 w-full rounded-2xl border border-line bg-paper p-3 text-right text-sm font-bold">{question}<span className="mt-1 block text-xs text-forest">{answers[i] ? answer : 'حاول ثم أظهر الجواب'}</span></button>)}<button onClick={onTerminer} disabled={answers.length !== 3 || !answers.every(Boolean)} className="btn btn-primary mt-5 w-full">أنهيت الورشة ✓</button></section>}</main></div>;
}

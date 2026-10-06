import { useState } from 'react';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  fait: boolean;
  onTerminer: () => void;
  onFermer: () => void;
}

type Etape = 1 | 2 | 3 | 4;
type Carte = { id: string; texte: string; aide: string };

const TRANSCRIPTION: Carte[] = [
  { id: 'gene', texte: 'المورثة على ADN', aide: 'هي مصدر المعلومة الوراثية.' },
  { id: 'polym', texte: 'إنزيم ARN بوليمراز', aide: 'يتعرف على منطقة البداية ويقرأ السلسلة المستنسخة.' },
  { id: 'arnp', texte: 'ARNm طليعي', aide: 'نسخة أولية تحتوي على معلومات المورثة.' },
  { id: 'maturation', texte: 'معالجة / نضج ARNm', aide: 'تتم معالجة ARNm الطليعي في حقيقيات النوى.' },
  { id: 'arnm', texte: 'ARNm ناضج', aide: 'يغادر النواة نحو الهيولى عند حقيقيات النوى.' },
];

const TRADUCTION: Carte[] = [
  { id: 'init', texte: 'مرحلة الانطلاق', aide: 'يثبت الريبوزوم على رامزة البداية AUG.' },
  { id: 'elong', texte: 'مرحلة الاستطالة', aide: 'تدخل ARNt وتتكون الروابط الببتيدية.' },
  { id: 'stop', texte: 'مرحلة النهاية', aide: 'تصل رامزة توقف وتنطلق السلسلة البيبتيدية.' },
  { id: 'protein', texte: 'سلسلة بيبتيدية / بروتين', aide: 'تكتسب بنيتها ووظيفتها بعد الترجمة.' },
];

const LINKS = [
  { id: 'l1', phrase: 'المورثة على ADN', answer: 'تُنسخ إلى', target: 'ARNm طليعي', options: ['تُنسخ إلى', 'تُترجم مباشرة إلى', 'تُهضم إلى'] },
  { id: 'l2', phrase: 'ARNm ناضج', answer: 'يُقرأ من طرف', target: 'الريبوزوم', options: ['يُقرأ من طرف', 'يُصنع داخل', 'يُفكك بواسطة'] },
  { id: 'l3', phrase: 'ARNt', answer: 'ينقل', target: 'حمضًا أمينيًا', options: ['ينقل', 'ينسخ', 'يحلل'] },
  { id: 'l4', phrase: 'رامزة التوقف', answer: 'تنهي', target: 'الترجمة', options: ['تنهي', 'تبدأ', 'تضاعف'] },
];

const RECALL = [
  { id: 'r1', text: 'ما المرحلة التي تحول المعلومة الموجودة في ADN إلى ARNm؟', answer: 'الاستنساخ' },
  { id: 'r2', text: 'ما المرحلة التي تحول رسالة ARNm إلى سلسلة أحماض أمينية؟', answer: 'الترجمة' },
  { id: 'r3', text: 'ما العناصر التي تنقل الأحماض الأمينية إلى الريبوزوم؟', answer: 'ARNt' },
];

function Progress({ etape }: { etape: Etape }) {
  return <div className="mb-5 flex gap-2" aria-label="مراحل الورشة">{[1, 2, 3, 4].map((number) => <span key={number} className={`h-2 flex-1 rounded-full ${number <= etape ? 'bg-forest' : 'bg-line'}`} />)}</div>;
}

export default function AtelierDomaine1({ fait, onTerminer, onFermer }: Props) {
  const [etape, setEtape] = useState<Etape>(fait ? 4 : 1);
  const [transcription, setTranscription] = useState<string[]>(fait ? TRANSCRIPTION.map((c) => c.id) : []);
  const [traduction, setTraduction] = useState<string[]>(fait ? TRADUCTION.map((c) => c.id) : []);
  const [choisie, setChoisie] = useState<string | null>(null);
  const [linkIndex, setLinkIndex] = useState(0);
  const [linkChoice, setLinkChoice] = useState<string | null>(null);
  const [recall, setRecall] = useState<Record<string, boolean>>(fait ? Object.fromEntries(RECALL.map((q) => [q.id, true])) : {});
  const [message, setMessage] = useState<string | null>(null);
  const [aide, setAide] = useState<string | null>(null);

  const sequence = etape === 1 ? TRANSCRIPTION : TRADUCTION;
  const currentSequence = etape === 1 ? transcription : traduction;
  const currentLink = LINKS[linkIndex];
  const placementComplete = currentSequence.length === sequence.length;

  function choisirCarte(id: string) {
    setChoisie(id);
    setMessage(null);
    setAide(null);
  }

  function placerCarte() {
    if (!choisie) return;
    const expected = sequence[currentSequence.length];
    if (choisie !== expected.id) {
      setMessage(`ليست هذه المرحلة. ${expected.aide}`);
      setAide(expected.aide);
      return;
    }
    if (etape === 1) setTranscription((items) => [...items, choisie]);
    else setTraduction((items) => [...items, choisie]);
    setChoisie(null);
    setMessage('صحيح — واصل بناء التسلسل.');
    setAide(null);
  }

  function continuerPlacement() {
    setMessage(null);
    setChoisie(null);
    if (etape === 1) setEtape(2);
    else setEtape(3);
  }

  function validerLien() {
    if (linkChoice !== currentLink.answer) {
      setMessage(`راجع العلاقة بين «${currentLink.phrase}» و«${currentLink.target}».`);
      return;
    }
    setMessage('رابط علمي صحيح.');
    setLinkChoice(null);
    if (linkIndex === LINKS.length - 1) setEtape(4);
    else setLinkIndex((index) => index + 1);
  }

  function terminer() {
    if (Object.keys(recall).length < RECALL.length) return;
    onTerminer();
  }

  return (
    <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl">
      <header className="mx-auto flex max-w-3xl items-center gap-3">
        <button onClick={onFermer} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-mute" aria-label="رجوع"><span className="block h-5 w-5"><IcoRetour /></span></button>
        <div className="min-w-0 flex-1"><p className="eyebrow">ورشة موجهة · المجال الأول</p><h1 className="font-naskh truncate text-xl font-bold">من ADN إلى بروتين وظيفي</h1></div>
        <span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">مراجعة</span>
      </header>

      <div className="mx-auto mt-5 max-w-3xl"><Progress etape={etape} />
        <main className="card animate-pop-in p-5">
          {etape === 1 && <section>
            <p className="eyebrow">المرحلة ١ · الاستنساخ</p><h2 className="font-naskh mt-2 text-2xl font-bold">رتّب مراحل الاستنساخ</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">اضغط بطاقة ثم «ضع البطاقة». اتبع انتقال المعلومة من المورثة إلى ARNm الناضج.</p>
            <Sequence items={transcription} all={TRANSCRIPTION} />
            <Cards cards={TRANSCRIPTION} used={transcription} selected={choisie} onSelect={choisirCarte} onHelp={(text) => setAide(text)} />
            {message && <Feedback message={message} help={aide} />}
            {!placementComplete ? <button onClick={placerCarte} disabled={!choisie} className="btn btn-primary mt-5 w-full">ضع البطاقة</button> : <button onClick={continuerPlacement} className="btn btn-primary mt-5 w-full">انتقل إلى الترجمة ←</button>}
          </section>}

          {etape === 2 && <section>
            <p className="eyebrow">المرحلة ٢ · الترجمة</p><h2 className="font-naskh mt-2 text-2xl font-bold">رتّب مراحل الترجمة</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">يقرأ الريبوزوم ARNm ويحوّل ترتيب الرامزات إلى ترتيب أحماض أمينية.</p>
            <Sequence items={traduction} all={TRADUCTION} />
            <Cards cards={TRADUCTION} used={traduction} selected={choisie} onSelect={choisirCarte} onHelp={(text) => setAide(text)} />
            {message && <Feedback message={message} help={aide} />}
            {!placementComplete ? <button onClick={placerCarte} disabled={!choisie} className="btn btn-primary mt-5 w-full">ضع البطاقة</button> : <button onClick={continuerPlacement} className="btn btn-primary mt-5 w-full">انتقل إلى الروابط العلمية ←</button>}
          </section>}

          {etape === 3 && <section>
            <p className="eyebrow">المرحلة ٣ · العلاقات العلمية {linkIndex + 1} / {LINKS.length}</p><h2 className="font-naskh mt-2 text-2xl font-bold">اختر الرابط الصحيح</h2>
            <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4 text-center text-base font-bold"><span>{currentLink.phrase}</span><span className="mx-2 text-gold">{currentLink.answer === linkChoice ? currentLink.answer : '؟'}</span><span>{currentLink.target}</span></div>
            <div className="mt-4 grid gap-2">{currentLink.options.map((option) => <button key={option} onClick={() => { setLinkChoice(option); setMessage(null); }} className={`rounded-2xl border px-4 py-3 text-right text-sm font-bold ${linkChoice === option ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{option}</button>)}</div>
            {message && <Feedback message={message} />}
            <button onClick={validerLien} disabled={!linkChoice} className="btn btn-primary mt-5 w-full">تحقق</button>
          </section>}

          {etape === 4 && <section>
            <p className="eyebrow">المرحلة ٤ · الاسترجاع النشط</p><h2 className="font-naskh mt-2 text-2xl font-bold">أعد بناء الدرس من الذاكرة</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">أجب عن الأسئلة ثم اكشف الجواب. لا توجد عقوبة: الهدف هو اكتشاف الثغرة.</p>
            <div className="mt-5 space-y-3">{RECALL.map((question) => <div key={question.id} className="rounded-2xl border border-line bg-paper p-4"><p className="text-sm font-bold leading-relaxed">{question.text}</p><button onClick={() => setRecall((old) => ({ ...old, [question.id]: true }))} className="btn btn-gold mt-3 w-full">{recall[question.id] ? `الجواب: ${question.answer}` : 'حاولتُ — أظهر الجواب'}</button></div>)}</div>
            <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4"><p className="text-[11px] font-bold text-forest">جملة من نوع البكالوريا</p><p className="mt-1.5 text-sm font-bold leading-relaxed">تنتقل المعلومة الوراثية من ADN إلى ARNm بالاستنساخ، ثم تتحول رسالة ARNm إلى سلسلة بيبتيدية بالترجمة.</p></div>
            <button onClick={terminer} disabled={Object.keys(recall).length < RECALL.length} className="btn btn-primary mt-5 w-full">أنهيت الورشة ✓</button>
          </section>}
        </main>
      </div>
    </div>
  );
}

function Sequence({ items, all }: { items: string[]; all: Carte[] }) {
  return <div className="mt-5 rounded-2xl border border-line bg-paper p-4"><p className="text-[11px] font-bold text-forest">التسلسل الذي بنيته</p><div className="mt-3 space-y-2">{all.map((card, index) => <div key={card.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${items[index] === card.id ? 'border-sage bg-sage-soft' : 'border-dashed border-line bg-cream/50'}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-paper">{index + 1}</span><span className="text-sm font-bold">{items[index] === card.id ? card.texte : '••••••••'}</span></div>)}</div></div>;
}

function Cards({ cards, used, selected, onSelect, onHelp }: { cards: Carte[]; used: string[]; selected: string | null; onSelect: (id: string) => void; onHelp: (text: string) => void }) {
  return <><p className="mt-5 text-xs font-bold text-ink-soft">البطاقات — اختر البطاقة التالية</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{cards.map((card) => <button key={card.id} disabled={used.includes(card.id)} onClick={() => { onSelect(card.id); onHelp(card.aide); }} className={`rounded-2xl border p-3 text-right text-sm font-bold transition-colors ${used.includes(card.id) ? 'border-line bg-cream text-mute opacity-50' : selected === card.id ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper hover:border-forest'}`}>{card.texte}</button>)}</div></>;
}

function Feedback({ message, help }: { message: string; help?: string | null }) {
  return <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/50 p-3 text-sm leading-relaxed"><p className="font-bold text-[#6b5320]">{message}</p>{help && <p className="mt-1 text-mute">تلميح: {help}</p>}</div>;
}

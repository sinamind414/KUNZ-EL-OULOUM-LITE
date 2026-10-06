import { useMemo, useState } from 'react';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  fait: boolean;
  onTerminer: () => void;
  onFermer: () => void;
}

type Etape = 1 | 2 | 3;

const SLOTS = [
  { id: 'expression', label: 'إنتاج البروتين', answer: 'ADN → ARNm → بروتين' },
  { id: 'structure', label: 'البنية الفراغية', answer: 'سلسلة الأحماض الأمينية → طيّ' },
  { id: 'fonction', label: 'الوظيفة البيولوجية', answer: 'البنية → وظيفة متخصصة' },
  { id: 'exemples', label: 'أمثلة وظيفية', answer: 'إنزيمات · مناعة · اتصال عصبي' },
];

const CARDS = [
  { id: 'expression', text: 'ADN → ARNm → بروتين' },
  { id: 'structure', text: 'سلسلة الأحماض الأمينية → طيّ' },
  { id: 'fonction', text: 'البنية → وظيفة متخصصة' },
  { id: 'exemples', text: 'إنزيمات · مناعة · اتصال عصبي' },
  { id: 'intrus', text: 'تضاعف ADN فقط' },
];

const RELATIONS = [
  { from: 'ADN', to: 'ARNm', answer: 'يُنسخ إلى', options: ['يُنسخ إلى', 'يُهضم إلى', 'يُفرَز من'] },
  { from: 'البنية الفراغية', to: 'الوظيفة', answer: 'تحدد', options: ['تحدد', 'تلغي', 'تستبدل'] },
  { from: 'الإنزيم', to: 'الركيزة', answer: 'يتعرف على', options: ['يتعرف على', 'ينتج من', 'ينقسم إلى'] },
];

export default function AtelierDomaine1({ fait, onTerminer, onFermer }: Props) {
  const [etape, setEtape] = useState<Etape>(fait ? 3 : 1);
  const [placees, setPlacees] = useState<Record<string, string>>({});
  const [selection, setSelection] = useState<string | null>(null);
  const [relationIndex, setRelationIndex] = useState(0);
  const [relationChoice, setRelationChoice] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);
  const [revelees, setRevelees] = useState<string[]>(fait ? SLOTS.map((s) => s.id) : []);

  const completePlacement = useMemo(() => SLOTS.every((slot) => placees[slot.id] === slot.answer), [placees]);
  const relation = RELATIONS[relationIndex];
  const completeRappel = SLOTS.every((slot) => revelees.includes(slot.id));

  function placer(slotId: string) {
    if (!selection) return;
    const card = CARDS.find((item) => item.id === selection);
    if (!card) return;
    if (card.id !== slotId) {
      setErreur(true);
      return;
    }
    setPlacees((previous) => ({ ...previous, [slotId]: card.text }));
    setSelection(null);
    setErreur(false);
  }

  function validerRelation() {
    if (relationChoice !== relation.answer) {
      setErreur(true);
      return;
    }
    setErreur(false);
    setRelationChoice(null);
    if (relationIndex === RELATIONS.length - 1) setEtape(3);
    else setRelationIndex((index) => index + 1);
  }

  return (
    <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl">
      <header className="mx-auto flex max-w-3xl items-center gap-3">
        <button onClick={onFermer} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-mute" aria-label="رجوع">
          <span className="block h-5 w-5"><IcoRetour /></span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">ورشة تركيب المجال الأول</p>
          <h1 className="font-naskh truncate text-xl font-bold">من المعلومة الوراثية إلى الوظيفة</h1>
        </div>
        <span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">خلاصة</span>
      </header>

      <div className="mx-auto mt-5 max-w-3xl">
        <div className="mb-4 flex items-center gap-2" aria-label="مراحل الورشة">
          {[1, 2, 3].map((number) => (
            <div key={number} className={`h-2 flex-1 rounded-full ${number <= etape ? 'bg-forest' : 'bg-line'}`} />
          ))}
        </div>

        <main className="card animate-pop-in p-5">
          {etape === 1 && (
            <section>
              <p className="eyebrow">المرحلة ١ · بناء الخريطة</p>
              <h2 className="font-naskh mt-2 text-2xl font-bold">رتّب خيط المجال الأول</h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">اختر بطاقة ثم اضغط مكانها. نبدأ من إنتاج البروتين، ثم بنيته، ثم وظيفته.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {SLOTS.map((slot, index) => (
                  <button key={slot.id} onClick={() => placer(slot.id)} className={`rounded-2xl border p-4 text-right transition-colors ${placees[slot.id] ? 'border-sage bg-sage-soft' : 'border-dashed border-line bg-paper hover:border-forest'}`}>
                    <span className="text-[11px] font-bold text-forest">{index + 1}. {slot.label}</span>
                    <span className="mt-2 block text-sm font-bold leading-relaxed">{placees[slot.id] ?? 'اضغط هنا لوضع البطاقة'}</span>
                  </button>
                ))}
              </div>

              <p className="mt-5 text-xs font-bold text-ink-soft">البطاقات المتاحة — اختر واحدة</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CARDS.map((card) => (
                  <button key={card.id} onClick={() => { setSelection(card.id); setErreur(false); }} className={`chip text-xs font-bold ${selection === card.id ? 'border-forest bg-sage text-forest-deep ring-2 ring-forest/20' : ''}`}>
                    {card.text}
                  </button>
                ))}
              </div>
              {erreur && <p className="mt-3 rounded-xl bg-clay-soft p-3 text-sm font-bold text-clay">هذه البطاقة لا تنتمي إلى هذا الموضع. ابحث عن المرحلة التي تأتي بعدها مباشرة.</p>}
              {completePlacement && <button onClick={() => setEtape(2)} className="btn btn-primary mt-5 w-full">التالي: اربط الأفكار</button>}
            </section>
          )}

          {etape === 2 && (
            <section>
              <p className="eyebrow">المرحلة ٢ · الروابط العلمية {relationIndex + 1} / {RELATIONS.length}</p>
              <h2 className="font-naskh mt-2 text-2xl font-bold">اختر الرابط الذي يشرح العلاقة</h2>
              <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4 text-center text-base font-bold">
                <span>{relation.from}</span><span className="mx-3 text-gold">← ؟ →</span><span>{relation.to}</span>
              </div>
              <div className="mt-4 grid gap-2">
                {relation.options.map((option) => <button key={option} onClick={() => { setRelationChoice(option); setErreur(false); }} className={`rounded-2xl border px-4 py-3 text-right text-sm font-bold ${relationChoice === option ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{option}</button>)}
              </div>
              {erreur && <p className="mt-3 rounded-xl bg-clay-soft p-3 text-sm font-bold text-clay">هذا الرابط لا يصف العلاقة العلمية. حاول من جديد.</p>}
              <button onClick={validerRelation} disabled={!relationChoice} className="btn btn-primary mt-5 w-full">تحقق</button>
            </section>
          )}

          {etape === 3 && (
            <section>
              <p className="eyebrow">المرحلة ٣ · الاسترجاع النشط</p>
              <h2 className="font-naskh mt-2 text-2xl font-bold">أكمل الخريطة من الذاكرة</h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">أخفينا عناصر الخريطة. اضغط على كل خانة عندما تستطيع استرجاعها.</p>
              <div className="mt-5 space-y-2">
                {SLOTS.map((slot) => <button key={slot.id} onClick={() => setRevelees((old) => old.includes(slot.id) ? old : [...old, slot.id])} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-right ${revelees.includes(slot.id) ? 'border-sage bg-sage-soft' : 'border-line bg-paper'}`}><span className="text-sm font-bold">{revelees.includes(slot.id) ? slot.answer : '؟؟؟'}</span><span className="text-[11px] font-bold text-forest">{revelees.includes(slot.id) ? 'تم الاسترجاع' : 'أظهر'}</span></button>)}
              </div>
              <div className="mt-5 rounded-2xl border border-gold-soft bg-gold-soft/50 p-4"><p className="text-[11px] font-bold text-[#6b5320]">سؤال البكالوريا</p><p className="mt-1.5 text-sm font-bold leading-relaxed">كيف تحدد المعلومات الوراثية وظيفة البروتين في الخلية؟</p></div>
              <button onClick={onTerminer} disabled={!completeRappel} className="btn btn-primary mt-5 w-full">أنهيت الورشة ✓</button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

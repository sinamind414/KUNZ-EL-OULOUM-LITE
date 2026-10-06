import { useState } from 'react';
import { CadreAtelier, PointsEtape } from './AtelierCadre';
import { melange } from '../utils/melange';
import { nb } from '../utils/dates';

interface Props {
  fait: boolean;
  onTerminer: () => void;
  onFermer: () => void;
  onVoirLecon?: () => void;
}

type Etape = 1 | 2 | 3 | 4 | 5;
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
  { id: 'protein', texte: 'سلسلة بيبتيدية', aide: 'تنفصل في نهاية الترجمة.' },
  { id: 'folding', texte: 'نضج / طيّ البروتين', aide: 'تكتسب السلسلة بنيتها الفراغية.' },
  { id: 'target', texte: 'توجيه البروتين', aide: 'يُوجّه حسب مكان عمله داخل الخلية أو خارجها.' },
];

type Lien = { phrase: string; answer: string; target: string; options: string[] };

const LIENS: Lien[] = [
  {
    phrase: 'المورثة على ADN',
    answer: 'تُنسخ إلى',
    target: 'ARNm طليعي',
    options: ['تُنسخ إلى', 'تُترجم مباشرة إلى', 'تُهضم إلى', 'تُنقل إلى الريبوسوم'],
  },
  {
    phrase: 'ARNm ناضج',
    answer: 'يُقرأ من طرف',
    target: 'الريبوزوم',
    options: ['يُقرأ من طرف', 'يُصنع داخل', 'يُفكك بواسطة', 'يُنسخ داخل'],
  },
  {
    phrase: 'ARNt',
    answer: 'ينقل',
    target: 'حمضًا أمينيًا',
    options: ['ينقل', 'ينسخ', 'يحلل', 'يُرتب'],
  },
  {
    phrase: 'رامزة التوقف',
    answer: 'تنهي',
    target: 'الترجمة',
    options: ['تنهي', 'تبدأ', 'تضاعف', 'تنسخ'],
  },
];

const RECALL = [
  { id: 'r1', text: 'ما المرحلة التي تحول المعلومة الموجودة في ADN إلى ARNm؟', answer: 'الاستنساخ' },
  { id: 'r2', text: 'ما المرحلة التي تحول رسالة ARNm إلى سلسلة أحماض أمينية؟', answer: 'الترجمة' },
  { id: 'r3', text: 'ما العناصر التي تنقل الأحماض الأمينية إلى الريبوزوم؟', answer: 'ARNt' },
  { id: 'r4', text: 'أين تحدث الترجمة عند حقيقيات النوى؟', answer: 'في الهيولى عند الريبوزومات' },
  { id: 'r5', text: 'ماذا يحدث للسلسلة البيبتيدية بعد الترجمة؟', answer: 'تنضج وتطوى ثم تُوجّه حسب وظيفتها' },
];

export default function AtelierDomaine1({ fait, onTerminer, onFermer, onVoirLecon }: Props) {
  const [etape, setEtape] = useState<Etape>(fait ? 5 : 1);
  const [transcription, setTranscription] = useState<string[]>(fait ? TRANSCRIPTION.map((c) => c.id) : []);
  const [traduction, setTraduction] = useState<string[]>(fait ? TRADUCTION.map((c) => c.id) : []);
  const [ordre, setOrdre] = useState<string[]>(() => melange(TRANSCRIPTION.map((c) => c.id)));
  const [ordreLien, setOrdreLien] = useState<string[]>(() => melange(LIENS[0].options));
  const [choisie, setChoisie] = useState<string | null>(null);
  const [lienIndex, setLienIndex] = useState(0);
  const [choixLien, setChoixLien] = useState<string | null>(null);
  const [valide, setValide] = useState(false);
  const [comparaison, setComparaison] = useState<Record<string, boolean>>(fait ? { proc: true, euc: true } : {});
  const [recall, setRecall] = useState<Record<string, boolean>>(fait ? Object.fromEntries(RECALL.map((q) => [q.id, true])) : {});
  const [message, setMessage] = useState<string | null>(null);

  const sequence = etape === 1 ? TRANSCRIPTION : TRADUCTION;
  const currentSequence = etape === 1 ? transcription : traduction;
  const currentLien = LIENS[lienIndex];
  const placementComplete = currentSequence.length === sequence.length;

  function choisirCarte(id: string) {
    setChoisie(id);
    setMessage(null);
  }

  function placerCarte() {
    if (!choisie) return;
    const attendue = sequence[currentSequence.length];
    if (choisie !== attendue.id) {
      setMessage('ليست هذه المرحلة. أعِد ترتيب البطاقات ثم حاول من جديد.');
      setChoisie(null);
      // remélange : on ne donne jamais la réponse avant le bon choix
      setOrdre(melange(sequence.map((c) => c.id)));
      return;
    }
    if (etape === 1) setTranscription((items) => [...items, choisie]);
    else setTraduction((items) => [...items, choisie]);
    setChoisie(null);
    setMessage('صحيح — واصل بناء التسلسل.');
  }

  function continuerPlacement() {
    setMessage(null);
    setChoisie(null);
    if (etape === 1) {
      setEtape(2);
      setOrdre(melange(TRADUCTION.map((c) => c.id)));
    } else {
      setEtape(3);
    }
  }

  function validerLien() {
    if (valide) {
      // passage au lien suivant
      setMessage(null);
      setValide(false);
      setChoixLien(null);
      if (lienIndex === LIENS.length - 1) setEtape(5);
      else {
        setLienIndex((index) => index + 1);
        setOrdreLien(melange(LIENS[lienIndex + 1].options));
      }
      return;
    }
    if (choixLien !== currentLien.answer) {
      setMessage('راجع العلاقة بين المعطى والنتيجة ثم أعد المحاولة.');
      setChoixLien(null);
      setOrdreLien(melange(currentLien.options));
      return;
    }
    setValide(true);
    setMessage('رابط علمي صحيح ✓');
  }

  function terminer() {
    if (Object.keys(recall).length < RECALL.length) return;
    onTerminer();
  }

  return (
    <CadreAtelier
      surtitre="ورشة موجهة · المجال الأول"
      titre="من ADN إلى بروتين وظيفي"
      onFermer={onFermer}
      onVoirLecon={onVoirLecon}
      etapes={{ total: 5, courante: etape }}
      carte="card animate-pop-in p-5"
    >
      {etape === 1 && (
        <section>
          <p className="eyebrow">المرحلة الأولى · الاستنساخ</p>
          <h2 className="font-naskh mt-2 text-2xl font-bold">رتّب مراحل الاستنساخ</h2>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            اضغط بطاقة ثم «ضع البطاقة». اتبع انتقال المعلومة من المورثة إلى ARNm الناضج.
          </p>
          <Sequence items={transcription} all={TRANSCRIPTION} />
          <Cards
            cards={TRANSCRIPTION}
            ordre={ordre}
            used={transcription}
            selected={choisie}
            onSelect={choisirCarte}
          />
          {message && <Feedback message={message} />}
          {!placementComplete ? (
            <button onClick={placerCarte} disabled={!choisie} className="btn btn-primary mt-5 w-full">
             ضع البطاقة
            </button>
          ) : (
            <button onClick={continuerPlacement} className="btn btn-primary mt-5 w-full">
             انتقل إلى الترجمة ←
            </button>
          )}
        </section>
      )}

      {etape === 2 && (
        <section>
          <p className="eyebrow">المرحلة الثانية · الترجمة</p>
          <h2 className="font-naskh mt-2 text-2xl font-bold">رتّب مراحل الترجمة</h2>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            يقرأ الريبوزوم ARNm ويحوّل ترتيب الرامزات إلى ترتيب أحماض أمينية.
          </p>
          <Sequence items={traduction} all={TRADUCTION} />
          <Cards
            cards={TRADUCTION}
            ordre={ordre}
            used={traduction}
            selected={choisie}
            onSelect={choisirCarte}
          />
          {message && <Feedback message={message} />}
          {!placementComplete ? (
            <button onClick={placerCarte} disabled={!choisie} className="btn btn-primary mt-5 w-full">
             ضع البطاقة
            </button>
          ) : (
            <button onClick={continuerPlacement} className="btn btn-primary mt-5 w-full">
             انتقل إلى المقارنة بين الخلايا ←
            </button>
          )}
        </section>
      )}

      {etape === 3 && (
        <section>
          <p className="eyebrow">المرحلة الثالثة · بدائيات النوى وحقيقيات النوى</p>
          <h2 className="font-naskh mt-2 text-2xl font-bold">قارن بين تنظيم التعبير الجيني</h2>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            استعمل الرسم: عند بدائيات النوى يمكن أن تتزامن الترجمة مع الاستنساخ، أما عند حقيقيات النوى فتفصل
            النواة بين المرحلتين.
          </p>
          <div className="mt-5 space-y-3">
            <button
              onClick={() => setComparaison((old) => ({ ...old, proc: true }))}
              className={`w-full rounded-2xl border p-4 text-right ${comparaison.proc ? 'border-sage bg-sage-soft' : 'border-line bg-paper'}`}
            >
              <p className="text-sm font-bold">بدائيات النوى</p>
              <p className="mt-1 text-xs leading-relaxed text-mute">
                لا توجد نواة حقيقية؛ يمكن أن تبدأ الترجمة أثناء تشكل ARNm.
              </p>
            </button>
            <button
              onClick={() => setComparaison((old) => ({ ...old, euc: true }))}
              className={`w-full rounded-2xl border p-4 text-right ${comparaison.euc ? 'border-sage bg-sage-soft' : 'border-line bg-paper'}`}
            >
              <p className="text-sm font-bold">حقيقيات النوى</p>
              <p className="mt-1 text-xs leading-relaxed text-mute">
                الاستنساخ والمعالجة في النواة، ثم الترجمة في الهيولى.
              </p>
            </button>
          </div>
          {comparaison.proc && comparaison.euc && (
            <button onClick={() => setEtape(4)} className="btn btn-primary mt-5 w-full">
             انتقل إلى الروابط العلمية ←
            </button>
          )}
        </section>
      )}

      {etape === 4 && (
        <section>
          <p className="eyebrow">المرحلة الرابعة · العلاقات العلمية</p>
          <PointsEtape total={LIENS.length} courante={lienIndex + 1} />
          <h2 className="font-naskh mt-1 text-2xl font-bold">اختر الرابط الصحيح</h2>
          <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4 text-center text-base font-bold">
            <span>{currentLien.phrase}</span>
            <span className="mx-2 text-gold">{choixLien ?? '؟'}</span>
            <span>{currentLien.target}</span>
          </div>
          <div className="mt-4 grid gap-2">
            {ordreLien.map((option) => (
              <button
                key={option}
                disabled={valide}
                onClick={() => {
                  setChoixLien(option);
                  setMessage(null);
                }}
                className={`rounded-2xl border px-4 py-3 text-right text-sm font-bold disabled:opacity-50 ${
                  choixLien === option ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {message && <Feedback message={message} />}
          <button
            onClick={validerLien}
            disabled={!valide && !choixLien}
            className="btn btn-primary mt-5 w-full"
          >
            {valide ? (lienIndex === LIENS.length - 1 ? 'أنهيت الروابط ←' : 'الرابط التالي ←') : 'تحقق'}
          </button>
        </section>
      )}

      {etape === 5 && (
        <section>
          <p className="eyebrow">المرحلة الخامسة · الاسترجاع النشط</p>
          <h2 className="font-naskh mt-2 text-2xl font-bold">أعد بناء الدرس من الذاكرة</h2>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            أجب عن الأسئلة ثم اكشف الجواب. لا توجد عقوبة: الهدف هو اكتشاف الثغرة.
          </p>
          <div className="mt-5 space-y-3">
            {RECALL.map((question) => (
              <div key={question.id} className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-sm font-bold leading-relaxed">{question.text}</p>
                <button
                  onClick={() => setRecall((old) => ({ ...old, [question.id]: true }))}
                  className="btn btn-gold mt-3 w-full"
                >
                  {recall[question.id] ? `الجواب: ${question.answer}` : 'حاولتُ — أظهر الجواب'}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4">
            <p className="text-[11px] font-bold text-forest">جملة من نوع البكالوريا</p>
            <p className="mt-1.5 text-sm font-bold leading-relaxed">
              تنتقل المعلومة الوراثية من ADN إلى ARNm بالاستنساخ، ثم تتحول رسالة ARNm إلى سلسلة بيبتيدية
              بالترجمة.
            </p>
          </div>
          <button onClick={terminer} disabled={Object.keys(recall).length < RECALL.length} className="btn btn-primary mt-5 w-full">
            أنهيت الورشة ✓
          </button>
        </section>
      )}
    </CadreAtelier>
  );
}

function Sequence({ items, all }: { items: string[]; all: Carte[] }) {
  return (
    <div className="mt-5 rounded-2xl border border-line bg-paper p-4">
      <p className="text-[11px] font-bold text-forest">التسلسل الذي بنيته</p>
      <div className="mt-3 space-y-2">
        {all.map((card, index) => (
          <div
            key={card.id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              items[index] === card.id ? 'border-sage bg-sage-soft' : 'border-dashed border-line bg-cream/50'
            }`}
          >
            <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-forest px-1.5 text-[10px] font-bold text-paper">
              {nb(index + 1)}
            </span>
            <span className="text-sm font-bold">{items[index] === card.id ? card.texte : '••••••••'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cards({
  cards,
  ordre,
  used,
  selected,
  onSelect,
}: {
  cards: Carte[];
  ordre: string[];
  used: string[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const parId = new Map(cards.map((c) => [c.id, c]));
  const cartesChoisies = selected ? parId.get(selected) : undefined;
  return (
    <>
      <p className="mt-5 text-xs font-bold text-ink-soft">البطاقات — اختر البطاقة التالية</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {ordre.map((id) => {
          const card = parId.get(id);
          if (!card) return null;
          const utilisee = used.includes(id);
          return (
            <button
              key={id}
              disabled={utilisee}
              onClick={() => onSelect(id)}
              className={`rounded-2xl border p-3 text-right text-sm font-bold transition-colors ${
                utilisee
                  ? 'border-line bg-cream text-mute opacity-50'
                  : selected === id
                    ? 'border-forest bg-sage text-forest-deep'
                    : 'border-line bg-paper hover:border-forest'
              }`}
            >
              {card.texte}
            </button>
          );
        })}
      </div>
      {cartesChoisies && (
        <p className="mt-2 text-xs leading-relaxed text-mute">البطاقة المختارة: {cartesChoisies.aide}</p>
      )}
    </>
  );
}

function Feedback({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/50 p-3 text-sm leading-relaxed">
      <p className="font-bold text-[#6b5320]">{message}</p>
    </div>
  );
}

import { useState } from 'react';
import { CadreAtelier } from './AtelierCadre';
import { melange } from '../utils/melange';
import { enArabe } from '../utils/dates';

interface Props {
  onFermer: () => void;
  onTerminer: () => void;
  onVoirLecon?: () => void;
}

type Ligne = { id: string; titre: string; etapes: string[]; note: string };

const LIGNES: Ligne[] = [
  {
    id: 'lb',
    titre: 'اللمفاويات LB',
    etapes: ['التعرف على المستضد', 'تركيب مستقبلات IL2', 'تكاثر استنسالي', 'خلايا بلازمية + LBm'],
    note: 'تنتج الخلايا البلازمية الأجسام المضادة النوعية.',
  },
  {
    id: 'lt4',
    titre: 'اللمفاويات LT4',
    etapes: ['التعرف على المستضد على HLA II', 'تركيب مستقبلات IL2', 'تكاثر استنسالي', 'خلايا LT4 مساعدة + ذاكرة'],
    note: 'تفرز LT4 المساعدة IL2 وتنسق الاستجابة.',
  },
  {
    id: 'lt8',
    titre: 'اللمفاويات LT8',
    etapes: ['التعرف على المستضد على HLA I', 'تركيب مستقبلات IL2', 'تكاثر استنسالي', 'خلايا LT8 سامة + ذاكرة'],
    note: 'تقتل LT8 السامة الخلايا المصابة بواسطة حويصلات البرفورين.',
  },
];

const SOUVENIRS: [string, string][] = [
  ['ما الذي يحدد نوع المستضد الذي تتعرف عليه اللمفاوية؟', 'المستقبل الغشائي النوعي'],
  ['ما دور IL2 بعد تنشيط اللمفاوية؟', 'تحفيز التكاثر الاستنسالي'],
  ['ما الفرق بين LB و LT8 في النتيجة؟', 'LB تنتج أجسامًا مضادة، وLT8 تقتل الخلايا المصابة'],
];

function ordreInitial(): Record<string, string[]> {
  return Object.fromEntries(LIGNES.map((l) => [l.id, melange(l.etapes)]));
}

export default function AtelierImmunite({ onFermer, onTerminer, onVoirLecon }: Props) {
  const [ligneId, setLigneId] = useState(LIGNES[0].id);
  const [placees, setPlacees] = useState<Record<string, string[]>>({});
  const [ordres, setOrdres] = useState<Record<string, string[]>>(ordreInitial);
  const [choisie, setChoisie] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [souvenirs, setSouvenirs] = useState<boolean[]>(() => SOUVENIRS.map(() => false));

  const ligne = LIGNES.find((l) => l.id === ligneId) ?? LIGNES[0];
  const seq = placees[ligne.id] ?? [];
  const ordre = ordres[ligne.id] ?? ligne.etapes;
  const complete = seq.length === ligne.etapes.length;

  function choisir(id: string) {
    setChoisie(id);
    setMessage(null);
  }

  function placer() {
    if (!choisie) return;
    const attendue = ligne.etapes[seq.length];
    if (choisie !== attendue) {
      // رسالة لطيفة + مزج جديد: لا كشف للجواب قبل الاختيار الصحيح
      setMessage('ليست هذه البطاقة. أعِد ترتيب البطاقات ثم حاول من جديد.');
      setChoisie(null);
      setOrdres((old) => ({ ...old, [ligne.id]: melange(ligne.etapes) }));
      return;
    }
    setPlacees((old) => ({ ...old, [ligne.id]: [...seq, choisie] }));
    setChoisie(null);
    setMessage(null);
  }

  const toutesComplete = LIGNES.every((l) => (placees[l.id] ?? []).length === l.etapes.length);
  const souvenirsFaits = souvenirs.every(Boolean);

  return (
    <CadreAtelier
      surtitre="ورشة موجهة · المناعة"
      titre="من التعرف إلى الاستجابة المناعية"
      onFermer={onFermer}
      onVoirLecon={onVoirLecon}
      etapes={{ total: LIGNES.length, courante: LIGNES.findIndex((l) => l.id === ligneId) + 1 }}
    >
      <div className="mb-5 flex gap-2">
        {LIGNES.map((l) => {
          const finie = (placees[l.id] ?? []).length === l.etapes.length;
          return (
            <button
              key={l.id}
              onClick={() => {
                setLigneId(l.id);
                setChoisie(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-xl p-2 text-xs font-bold ${l.id === ligneId ? 'bg-forest text-paper' : 'bg-sage-soft text-forest'}`}
            >
              {l.titre}
              {finie && ' ✓'}
            </button>
          );
        })}
      </div>

      <p className="eyebrow">ابنِ التسلسل</p>
      <h2 className="font-naskh mt-2 text-2xl font-bold">{ligne.titre}</h2>
      <p className="mt-2 text-sm text-mute">اختر البطاقة التالية في آلية التنشيط والتكاثر.</p>

      <div className="mt-5 space-y-2">
        {ligne.etapes.map((etape, index) => {
          const placee = seq[index];
          const active = index === seq.length;
          return (
            <div
              key={etape}
              className={`rounded-2xl border p-3 ${placee ? 'border-sage bg-sage-soft' : active ? 'border-forest bg-cream' : 'border-dashed border-line bg-paper'}`}
            >
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-forest px-1.5 text-[10px] font-bold text-paper">
                {enArabe(index + 1)}
              </span>
              <p className="mt-1 text-sm font-bold">{placee ?? (active ? 'ضع هنا البطاقة التالية' : 'في انتظار البطاقة')}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {ordre.map((etape) => {
          const utilisee = seq.includes(etape);
          return (
            <button
              key={etape}
              disabled={utilisee}
              onClick={() => choisir(etape)}
              className={`rounded-2xl border p-3 text-right text-sm font-bold transition-colors disabled:opacity-40 ${
                utilisee
                  ? 'border-line bg-cream text-mute'
                  : choisie === etape
                    ? 'border-forest bg-sage text-forest-deep'
                    : 'border-line bg-paper hover:border-forest'
              }`}
            >
              {etape}
            </button>
          );
        })}
      </div>

      {message && (
        <p className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/50 p-3 text-sm font-bold text-[#6b5320]">
          {message}
        </p>
      )}

      <button onClick={placer} disabled={!choisie || complete} className="btn btn-primary mt-4 w-full">
        تثبيت البطاقة المختارة
      </button>

      {complete && (
        <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4">
          <p className="text-sm font-bold text-forest">المعنى البيولوجي</p>
          <p className="mt-1 text-sm leading-relaxed">{ligne.note}</p>
        </div>
      )}

      {complete && !toutesComplete && (
        <button
          onClick={() => {
            const suivante = LIGNES.find((l) => (placees[l.id] ?? []).length < l.etapes.length);
            if (suivante) {
              setLigneId(suivante.id);
              setChoisie(null);
              setMessage(null);
            }
          }}
          className="btn btn-gold mt-4 w-full"
        >
          الآلية التالية ←
        </button>
      )}

      {toutesComplete && (
        <section className="mt-5 border-t border-line pt-5">
          <p className="eyebrow">الاسترجاع النشط</p>
          <div className="mt-3 space-y-2">
            {SOUVENIRS.map(([question, reponse], index) => (
              <button
                key={question}
                onClick={() => setSouvenirs((old) => old.map((v, i) => (i === index ? true : v)))}
                className="w-full rounded-2xl border border-line bg-paper p-3 text-right text-sm font-bold"
              >
                {question}
                <span className="mt-1 block text-xs text-forest">
                  {souvenirs[index] ? reponse : 'اضغط لمحاولة ثم إظهار الجواب'}
                </span>
              </button>
            ))}
          </div>
          <button onClick={onTerminer} disabled={!souvenirsFaits} className="btn btn-primary mt-5 w-full">
            أنهيت الورشة ✓
          </button>
        </section>
      )}
    </CadreAtelier>
  );
}

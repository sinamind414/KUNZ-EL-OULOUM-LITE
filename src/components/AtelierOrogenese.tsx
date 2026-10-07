import { useState } from 'react';
import { CadreAtelier } from './AtelierCadre';
import { melange } from '../utils/melange';
import { nb } from '../utils/dates';
import { noterReponse } from '../utils/stats';
import { sonFaux, sonJuste } from '../utils/son';

interface Props {
  onFermer: () => void;
  onTerminer: () => void;
  onVoirLecon?: () => void;
}

const ETAPES: { id: string; titre: string; detail: string }[] = [
  {
    id: '1',
    titre: 'استقرار القشرة القارية',
    detail: 'قشرة قارية مستقرة فوق البرنس الليتوسفيري.',
  },
  {
    id: '2',
    titre: 'التباعد والتمدد',
    detail: 'تؤدي قوى التباعد إلى تشققات وهبوط القشرة وتكوّن حوض أولي.',
  },
  {
    id: '3',
    titre: 'اتساع الحوض المحيطي',
    detail: 'يتشكل قاع محيطي وتترسب الصخور الرسوبية على الحافتين.',
  },
  {
    id: '4',
    titre: 'التقارب والضغط',
    detail: 'تتقارب الصفائح؛ يحدث الغوص وتتراكم الرواسب وتتضاغط القشرة.',
  },
  {
    id: '5',
    titre: 'التصادم وتكوّن السلسلة الجبلية',
    detail: 'يشكّل تصادم القارّتين معقّدًا أفيوليتيًا وطيات وفوالق وسلسلة جبلية.',
  },
];

const SOUVENIRS: [string, string][] = [
  ['ماذا تفعل قوى التباعد في المرحلة الثانية؟', 'تمدد القشرة وتفتح حوضًا أوليًا.'],
  ['ماذا يحدث عند التقارب؟', 'تتقارب الصفائح ويحدث الضغط والغوص.'],
  ['ما نتيجة التصادم القاري؟', 'تكوّن سلسلة جبلية وبنيات انضغاطية.'],
];

export default function AtelierOrogenese({ onFermer, onTerminer, onVoirLecon }: Props) {
  const [placees, setPlacees] = useState<string[]>([]);
  const [ordre, setOrdre] = useState<string[]>(() => melange(ETAPES.map((e) => e.id)));
  const [choisie, setChoisie] = useState<string | null>(null);
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null);
  const [souvenirs, setSouvenirs] = useState<boolean[]>(() => SOUVENIRS.map(() => false));

  const complete = placees.length === ETAPES.length;
  const attendue = ETAPES[placees.length];

  function choisir(id: string) {
    setChoisie(id);
    setMessage(null);
  }

  function valider() {
    if (!choisie) return;
    if (choisie !== attendue.id) {
      // رسالة لطيفة + مزج جديد: لا نسمح بحفظ الترتيب بالموقع
      noterReponse('atelier', false);
      sonFaux();
      setMessage({ texte: 'ليست هذه المرحلة التالية. أعِد ترتيب البطاقات ثم حاول من جديد.', ok: false });
      setChoisie(null);
      setOrdre(melange(ETAPES.map((e) => e.id)));
      return;
    }
    noterReponse('atelier', true);
    sonJuste();
    setPlacees((old) => [...old, choisie]);
    setChoisie(null);
    setMessage({ texte: 'صحيح — المرحلة مثبّتة.', ok: true });
  }

  const parId = new Map(ETAPES.map((e) => [e.id, e]));

  return (
    <CadreAtelier
      surtitre="ورشة تركيبية · التكتونية"
      titre="من التباعد إلى تشكّل السلسلة الجبلية"
      onFermer={onFermer}
      onVoirLecon={onVoirLecon}
      etapes={{ total: ETAPES.length, courante: placees.length }}
    >
      <p className="text-sm leading-relaxed text-mute">
        حوّل المخطط التحصيلي إلى تسلسل سببي: لا تحفظ الرسومات فقط، بل فسّر القوة التكتونية والنتيجة في كل
        مرحلة.
      </p>

      <div className="mt-5 space-y-2">
        {placees.map((id) => {
          const etape = parId.get(id);
          if (!etape) return null;
          return (
            <div key={id} className="rounded-2xl border border-sage bg-sage-soft p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-forest px-1.5 text-xs font-bold text-paper">
                  {nb(Number(id))}
                </span>
                <p className="text-sm font-bold">{etape.titre}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-mute">{etape.detail}</p>
            </div>
          );
        })}
        {!complete && (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-line px-1.5 text-xs font-bold text-mute">
                {nb(placees.length + 1)}
              </span>
              <p className="text-sm font-bold text-mute">مرحلة مخفية — ضع البطاقة التالية هنا</p>
            </div>
          </div>
        )}
      </div>

      {!complete && (
        <>
          <p className="mt-5 text-xs font-bold text-ink-soft">اختر المرحلة التالية</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ordre
              .filter((id) => !placees.includes(id))
              .map((id) => {
                const etape = parId.get(id);
                if (!etape) return null;
                return (
                  <button
                    key={id}
                    onClick={() => choisir(id)}
                    className={`rounded-2xl border p-3 text-right text-sm font-bold transition-colors ${
                      choisie === id ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper hover:border-forest'
                    }`}
                  >
                    {etape.titre}
                  </button>
                );
              })}
          </div>
          {message && (
            <p
              className={`mt-3 rounded-2xl border p-3 text-sm font-bold ${
                message.ok
                  ? 'border-forest bg-sage text-forest-deep'
                  : 'border-clay-soft bg-clay-soft/50 text-clay'
              }`}
            >
              {message.texte}
            </p>
          )}
          <button onClick={valider} disabled={!choisie} className="btn btn-primary mt-4 w-full">
            تثبيت المرحلة
          </button>
        </>
      )}

      {complete && (
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
          <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
            <p className="text-[11px] font-bold text-forest">جملة من نوع البكالوريا</p>
            <p className="mt-1.5 text-sm font-bold leading-relaxed">
              يؤدي التباعد إلى تكوّن حوض محيطي، ثم يقود تقارب الصفائح إلى التصادم وتشكّل السلسلة الجبلية.
            </p>
          </div>
          <button onClick={onTerminer} disabled={!souvenirs.every(Boolean)} className="btn btn-primary mt-5 w-full">
            أنهيت الورشة ✓
          </button>
        </section>
      )}
    </CadreAtelier>
  );
}

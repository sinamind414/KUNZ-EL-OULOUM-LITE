// الامتحان التجريبي (v0.9) — وضعية شاملة على نمط بكالوريا علوم تجريبية:
//   التمرين الأول · استرجاع المعارف    → 6 أسئلة اختيار من بنك التدريبات (2 لكل مجال).
//   التمرين الثاني · استغلال وثيقتين  → استقصاء موجَّه في 4 مراحل (سند · تحليل · ربط · استنتاج).
//
// قواعد التطبيق المضادة للقلق (مثل باقي التطبيق):
//   لا مؤقّت، لا نسبة مئوية، لا كشف للجواب قبل الإصابة. الخطأ = نغمة لطيفة + تشخيص مصنّف +
//   إعادة ترتيب الخيارات. النجاح المباشر → بطاقة كفاءة J+3 ؛ الخطأ أو الاستعانة → J+1.
//   كل خطأ يُسجَّل في سجلّ الأخطاء الذرّية (بلا كتابة الجواب الصحيح فيه أبدًا).

import { useState } from 'react';
import type { Etat } from '../types';
import type { ItemDrill } from '../data/drills/types';
import { chargerDomaine, composerJoueur } from '../utils/drills';
import { nb } from '../utils/dates';
import { sonFaux, sonJuste } from '../utils/son';
import type { Qualite } from '../utils/srs';
import { IcoRetour } from './Icones';

interface Props {
  etat: Etat;
  onFermer: () => void;
  onItemReussi: (id: string) => void;
  onResultatKafaa: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
  ) => void;
  onCarnetFaute: (f: { contexte: string; enonce: string; donne: string; diagnostic: string }) => void;
}

type Ecran = 'consignes' | 'chargement' | 'partie1' | 'partie2' | 'bilan';

const NB_QCM = 6;
const ETAPES_ENQUETE = [
  'استخراج من الوثيقة 1',
  'استخراج من الوثيقة 2',
  'العلاقة بين الوثيقتين',
  'الاستنتاج المبرَّر',
];
const GRILLE_BAREME = ['سند', 'تحليل', 'ربط', 'استنتاج'];

const REFAIRE = 'ليس الجواب الصحيح — أعد المحاولة. خذ وقتك، لا عجلة.';

// ───────────── التمرين الثاني · استقصاء «من أين يأتي الأكسجين؟» (التركيب الضوئي) ─────────────
// وثيقتان من البرنامج (Hill 1939 و Ruben و Kamen 1941) بصياغة استكشافية:
// الإجابة الصحيحة دائمًا في options[0]، والدوران ينقلها عند العرض.
type EtapeEnquete = {
  question: string;
  options: [string, string, string];
  cible: Record<number, string>;
  succes: string;
};

const ENQUETE: {
  titre: string;
  situation: string;
  question: string;
  doc1: { titre: string; contenu: string };
  doc2: { titre: string; contenu: string };
  etapes: EtapeEnquete[];
  conclusion: string;
  erreur: string;
} = {
  titre: 'من أين يأتي الأكسجين؟',
  situation: 'استقصاء حول مصدر الأكسجين المنطلق أثناء التركيب الضوئي.',
  question: 'قارن بين الوثيقتين ثم استنتج مصدر الأكسجين المنطلق أثناء التركيب الضوئي.',
  doc1: {
    titre: 'الوثيقة 1 · تجربة Hill (1939)',
    contenu:
      'كلوروبلاستات معزولة في وسط يحتوي الماء ومانحًا صناعيًا للإلكترونات. في الضوء تنطلق فقاعات غاز من الكلوروبلاستات. في الظلام، أو عند غياب الماء، لا ينطلق أي غاز.',
  },
  doc2: {
    titre: 'الوثيقة 2 · تجربة Ruben و Kamen (1941)',
    contenu:
      'وسط نمو يحتوي ماءً بنظير مشع (¹⁸O): الأكسجين المنطلق أثناء التركيب الضوئي غاز مشع. وسط نمو يحتوي ثاني أكسيد الكربون بنظير مشع (C¹⁸O₂): الأكسجين المنطلق غير مشع.',
  },
  etapes: [
    {
      question: 'ما المعلومة التي تستخرجها من الوثيقة 1؟',
      options: [
        'أستخرج أن انطلاق الغاز من الكلوروبلاستات يتم في الضوء مع وجود الماء، ويتوقف في الظلام أو عند غياب الماء.',
        'أستنتج أن الغاز المنطلق هو ثاني أكسيد الكربون لأن التفاعل يحتاج الضوء.',
        'أستخرج أن الكلوروبلاستات تستهلك الغاز في الظلام بدل أن تطلقه.',
      ],
      cible: {
        1: 'خطوة الاستخراج تنقل ما تُظهره الوثيقة فقط. الوثيقة 1 لم تُحدِّد نوع الغاز — لا تستبق التحليل.',
        2: 'أعد قراءة الوثيقة 1: في الظلام لا ينطلق غاز أصلًا، فمن أين أتيت بأنه يُستهلك؟ انقل الملاحظة كما هي.',
      },
      succes: 'أحسنت: الاستخراج نقل شروط الانطلاق (الضوء والماء) كما هي قبل أي حكم.',
    },
    {
      question: 'ما المعلومة التي تستخرجها من الوثيقة 2؟',
      options: [
        'أستخرج أن الأكسجين المنطلق يكون مشعًا فقط حين يكون الماء هو الحامل للنظير المشع، لا حين يكون ثاني أكسيد الكربون.',
        'أستخرج أن ثاني أكسيد الكربون المشع يتحول كله إلى أكسجين مشع.',
        'أستنتج أن النظير المشع مادة تبطئ التركيب الضوئي.',
      ],
      cible: {
        1: 'قارن النتيجتين في الوثيقة 2: مع الماء المشع انطلق أكسجين مشع، ومع ثاني أكسيد الكربون المشع لم ينطلق. انقل الفرق بدقة.',
        2: 'الوثيقة 2 تقيس الإشعاع في الغاز المنطلق فحسب؛ أين ذُكر أي تباطؤ؟ انقل المعطى ولا تضف إليه.',
      },
      succes: 'ممتاز: قراءة دقيقة للنتيجتين المتقابلتين — الإشعاع يتبع الماء لا ثاني أكسيد الكربون.',
    },
    {
      question: 'ما العلاقة بين الوثيقتين؟',
      options: [
        'الوثيقتان متكاملتان: الأولى تُثبت أن انطلاق الغاز يحتاج الضوء والماء، والثانية تحدِّد مصدر ذرات ذلك الغاز (الماء).',
        'الوثيقتان متناقضتان: الأولى تتحدث عن غاز والثانية عن إشعاع.',
        'لا علاقة بين الوثيقتين؛ كل واحدة تجربة مستقلة بلا رابط.',
      ],
      cible: {
        1: 'ليس تناقضًا. ماذا تقيس كل وثيقة؟ الأولى شروط الانطلاق والثانية مصدر ذرات الأكسجين — أين يلتقيان؟',
        2: 'اربط بين احتياج الانطلاق للماء (الوثيقة 1) وتتبُّع ذرات الماء المشع في الأكسجين (الوثيقة 2) — أين الرابط؟',
      },
      succes: 'أحسنت: منجَز الأولى (شرط الانطلاق) ومنجَز الثانية (مصدر الذرات) يتكاملان.',
    },
    {
      question: 'ما الاستنتاج المبرَّر؟',
      options: [
        'أستنتج أن الأكسجين المنطلق أثناء التركيب الضوئي مصدره الماء، لأنه ينطلق في الضوء مع وجود الماء وتتبّعه الإشعاع حين يكون الماء مشعًا.',
        'أستنتج أن الأكسجين مصدره ثاني أكسيد الكربون لأنه يدخل في التفاعل.',
        'أستنتج أن الأكسجين مصدره الكلوروفيل لأنه يمتص الضوء.',
      ],
      cible: {
        1: 'الوثيقة 2 تفصل في هذا: مع ثاني أكسيد الكربون المشع لم ينطلق أكسجين مشع — فكيف يكون هو المصدر؟',
        2: 'الكلوروفيل يمتص الضوء لكنه لا يطلق ذراته كغاز. أين تظهر ذرات الكلوروفيل في الوثيقتين؟',
      },
      succes: 'خلاصة مبرَّرة: شروط الانطلاق (الوثيقة 1) + مصدر الذرات (الوثيقة 2) = الماء.',
    },
  ],
  conclusion:
    'إذن، الأكسجين المنطلق أثناء التركيب الضوئي مصدره الماء: ينطلق في الضوء مع وجود الماء (تجربة Hill)، وتتبّع نظيره المشع في الغاز المنطلق (تجربة Ruben و Kamen)، بينما لا تظهر ذرات ثاني أكسيد الكربون في هذا الغاز.',
  erreur:
    'الخلط بين مصدر الأكسجين المنطلق ومصدر الكتلة العضوية، أو القفز إلى الاستنتاج قبل استخراج معطى الوثيقتين.',
};

/** دوران حتمي لخيارات السؤال: الجواب الصحيح لا يبقى دومًا في الموضع نفسه. */
function rotation(nbOptions: number, decalage: number): number[] {
  return Array.from({ length: nbOptions }, (_, k) => (k + decalage) % nbOptions);
}

/** اختيار 2 أسئلة لكل مجال: نُفضِّل غير المُجابة والمستوى الميسور، سقوطًا حتميًا على الكل. */
function choisirItems(items: ItemDrill[], reussis: Set<string>, n: number): ItemDrill[] {
  const accessibles = items.filter((i) => i.n !== 3);
  const base = accessibles.length >= n ? accessibles : items;
  return composerJoueur(base, reussis, n);
}

export default function ExamBlanc({
  etat,
  onFermer,
  onItemReussi,
  onResultatKafaa,
  onCarnetFaute,
}: Props) {
  const [ecran, setEcran] = useState<Ecran>('consignes');
  const [fileQcm, setFileQcm] = useState<ItemDrill[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [qChoix, setQChoix] = useState<number | null>(null);
  const [qTentatives, setQTentatives] = useState(0);
  const [qRepondu, setQRepondu] = useState(false);
  const [qDirects, setQDirects] = useState(0);
  const [qFaux, setQFaux] = useState(0);

  const [etape, setEtape] = useState(0);
  const [rep, setRep] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [etapeFaite, setEtapeFaite] = useState(false);
  const [enqFaux, setEnqFaux] = useState(0);
  const [kafaaEnvoyee, setKafaaEnvoyee] = useState(false);

  const reussis = new Set(Object.keys(etat.drills ?? {}));

  async function demarrerExamen(): Promise<void> {
    setEcran('chargement');
    const [d1, d2, d3] = await Promise.all([
      chargerDomaine(1),
      chargerDomaine(2),
      chargerDomaine(3),
    ]);
    const file = [
      ...choisirItems(d1, reussis, 2),
      ...choisirItems(d2, reussis, 2),
      ...choisirItems(d3, reussis, 2),
    ];
    setFileQcm(file);
    setQIndex(0);
    setQChoix(null);
    setQTentatives(0);
    setQRepondu(false);
    setQDirects(0);
    setQFaux(0);
    setEtape(0);
    setRep(null);
    setMessage(null);
    setEtapeFaite(false);
    setEnqFaux(0);
    setKafaaEnvoyee(false);
    setEcran('partie1');
  }

  function allerQcmSuivant(): void {
    if (qIndex + 1 >= fileQcm.length) {
      setEtape(0);
      setRep(null);
      setMessage(null);
      setEtapeFaite(false);
      setEcran('partie2');
      return;
    }
    setQIndex(qIndex + 1);
    setQChoix(null);
    setQTentatives(0);
    setQRepondu(false);
  }

  function validerQcm(): void {
    if (qChoix === null || qRepondu) return;
    const item = fileQcm[qIndex];
    // الجواب الصحيح في المصدر بالموضع 0؛ الدوران ينقله عند العرض.
    const decalage = (qIndex * 2 + qTentatives + 1) % item.o.length;
    const ordre = rotation(item.o.length, decalage);
    const bonneAffichee = ordre.indexOf(0);
    if (qChoix === bonneAffichee) {
      sonJuste();
      onItemReussi(item.id);
      if (qTentatives === 0) setQDirects(qDirects + 1);
      setQRepondu(true);
      setMessage(null);
      return;
    }
    sonFaux();
    setQFaux(qFaux + 1);
    setQTentatives(qTentatives + 1);
    setQChoix(null);
    const texteFaux = item.o[ordre[qChoix]];
    onCarnetFaute({
      contexte: `الامتحان التجريبي · استرجاع المعارف · سؤال ${nb(qIndex + 1)}`,
      enonce: item.q,
      donne: texteFaux,
      diagnostic: REFAIRE,
    });
    setMessage(REFAIRE);
  }

  function validerEtape(): void {
    if (rep === null || etapeFaite) return;
    const e = ENQUETE.etapes[etape];
    const decalage = (etape * 2 + (enqFaux % 3) + 1) % 3;
    const ordre = rotation(3, decalage);
    const bonneAffichee = ordre.indexOf(0);
    if (rep === bonneAffichee) {
      sonJuste();
      setEtapeFaite(true);
      setMessage(e.succes);
      return;
    }
    sonFaux();
    setEnqFaux(enqFaux + 1);
    const sourceChoisie = ordre[rep];
    setRep(null);
    onCarnetFaute({
      contexte: `الامتحان التجريبي · استغلال الوثيقتين · ${ETAPES_ENQUETE[etape]}`,
      enonce: e.question,
      donne: e.options[sourceChoisie],
      diagnostic: e.cible[sourceChoisie] ?? REFAIRE,
    });
    setMessage(e.cible[sourceChoisie] ?? REFAIRE);
  }

  function etapeSuivante(): void {
    if (etape + 1 >= ENQUETE.etapes.length) {
      if (!kafaaEnvoyee) {
        setKafaaEnvoyee(true);
        const avecErreur = qFaux > 0 || enqFaux > 0;
        onResultatKafaa('examenBlanc', avecErreur ? 3 : 5, {
          verbe: 'حلَّل ثم استنتج',
          exercice: 'الامتحان التجريبي · استغلال وثيقتين',
          erreur: ENQUETE.erreur,
        });
      }
      setEcran('bilan');
      return;
    }
    setEtape(etape + 1);
    setRep(null);
    setMessage(null);
    setEtapeFaite(false);
  }

  // ───────────── الشاشات ─────────────

  if (ecran === 'consignes') {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-cream">
        <div className="mx-auto max-w-2xl px-5 py-8">
          <button onClick={onFermer} className="btn btn-ghost mb-6">
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
            العودة إلى التدريبات
          </button>
          <section className="card p-6">
            <p className="eyebrow">وضيــفة شاملــة</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">الامتحان التجريبي</h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              امتحان على نمط بكالوريا علوم تجريبية يغطي البرنامج كله. ليس هناك مؤقّت ولا نسبة
              مئوية: خذ وقتك. الخطأ رسالة لطيفة ثم إعادة محاولة، ولن يُكشف الجواب الصحيح قبل أن
              تصيبه بنفسك.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="font-bold">التمرين الأول · استرجاع المعارف</p>
                <p className="mt-1 text-sm text-mute">
                  {nb(NB_QCM)} أسئلة اختيار من المجالات الثلاثة، مأخوذة من بنك التدريبات
                  (سؤالان لكل مجال).
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="font-bold">التمرين الثاني · استغلال وثيقتين</p>
                <p className="mt-1 text-sm text-mute">
                  استقصاء موجَّه في {nb(ENQUETE.etapes.length)} مراحل: سند ثم تحليل ثم ربط ثم
                  استنتاج. تُرقَّع درجة البارم أمامك كلما تقدَّمت.
                </p>
              </div>
            </div>
            <button onClick={demarrerExamen} className="btn btn-primary mt-6 w-full">
              ابدأ الامتحان
            </button>
          </section>
        </div>
      </div>
    );
  }

  if (ecran === 'chargement') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream">
        <p className="text-sm text-mute">نُجهِّز أسئلة الامتحان…</p>
      </div>
    );
  }

  if (ecran === 'partie1' && fileQcm.length > 0) {
    const item = fileQcm[qIndex];
    const decalage = (qIndex * 2 + qTentatives + 1) % item.o.length;
    const ordre = rotation(item.o.length, decalage);
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-cream">
        <div className="mx-auto max-w-2xl px-5 py-8">
          <button onClick={onFermer} className="btn btn-ghost mb-6">
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
            مغادرة الامتحان
          </button>
          <p className="eyebrow">التمرين الأول · استرجاع المعارف</p>
          <p className="mt-1 text-sm text-mute">
            السؤال {nb(qIndex + 1)} من {nb(fileQcm.length)}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-forest transition-all"
              style={{ width: `${((qIndex + 1) / fileQcm.length) * 100}%` }}
            />
          </div>
          <section className="card mt-6 p-6">
            <h3 className="font-naskh text-lg font-bold leading-relaxed">{item.q}</h3>
            <div className="mt-4 grid gap-2" role="radiogroup" aria-label="خيارات السؤال">
              {ordre.map((src, aff) => {
                const choisi = qChoix === aff;
                const style = choisi
                  ? 'border-forest bg-sage text-forest-deep'
                  : 'border-line bg-paper text-ink-soft hover:border-sage';
                return (
                  <button
                    key={aff}
                    onClick={() => !qRepondu && setQChoix(aff)}
                    disabled={qRepondu}
                    className={`rounded-2xl border p-4 text-right text-sm transition ${style}`}
                  >
                    {item.o[src]}
                  </button>
                );
              })}
            </div>
            {message && !qRepondu && (
              <p className="mt-4 text-sm font-bold text-clay">{message}</p>
            )}
            {!qRepondu && (
              <button
                onClick={validerQcm}
                disabled={qChoix === null}
                className="btn btn-primary mt-5 w-full"
              >
                تحقَّق
              </button>
            )}
            {qRepondu && (
              <div className="mt-5">
                <p className="text-sm font-bold text-forest">إجابة صحيحة.</p>
                {item.e && (
                  <p className="mt-2 rounded-2xl bg-sage-soft p-3 text-sm leading-relaxed text-forest-deep">
                    {item.e}
                  </p>
                )}
                <button onClick={allerQcmSuivant} className="btn btn-primary mt-4 w-full">
                  {qIndex + 1 >= fileQcm.length
                    ? 'الانتقال إلى التمرين الثاني ←'
                    : 'السؤال التالي ←'}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (ecran === 'partie2') {
    const e = ENQUETE.etapes[etape];
    const decalage = (etape * 2 + (enqFaux % 3) + 1) % 3;
    const ordre = rotation(3, decalage);
    const barreaux = [0, 1, 2, 3].map((k) => k < etape || (k === etape && etapeFaite));
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-cream">
        <div className="mx-auto max-w-2xl px-5 py-8">
          <button onClick={onFermer} className="btn btn-ghost mb-6">
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
            مغادرة الامتحان
          </button>
          <p className="eyebrow">التمرين الثاني · استغلال وثيقتين</p>
          <h2 className="font-naskh mt-2 text-2xl font-bold">{ENQUETE.titre}</h2>
          <p className="mt-2 text-sm text-mute">{ENQUETE.situation}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-xs font-bold text-mute">{ENQUETE.doc1.titre}</p>
              <p className="mt-2 text-sm leading-relaxed">{ENQUETE.doc1.contenu}</p>
            </div>
            <div className="rounded-2xl border border-line bg-paper p-4">
              <p className="text-xs font-bold text-mute">{ENQUETE.doc2.titre}</p>
              <p className="mt-2 text-sm leading-relaxed">{ENQUETE.doc2.contenu}</p>
            </div>
          </div>

          {/* درجة البارم تُرقَّع أمام التلميذ كلما أتم مرحلة */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {GRILLE_BAREME.map((g, k) => (
              <div
                key={g}
                className={`rounded-xl border p-2 text-center text-xs font-bold transition ${
                  barreaux[k]
                    ? 'border-forest bg-sage text-forest-deep'
                    : 'border-line bg-paper text-mute'
                }`}
              >
                {barreaux[k] ? '✓ ' : ''}
                {g}
              </div>
            ))}
          </div>

          <section className="card mt-6 p-6">
            <p className="text-sm text-mute">
              المرحلة {nb(etape + 1)} من {nb(ENQUETE.etapes.length)} · {ETAPES_ENQUETE[etape]}
            </p>
            <h3 className="font-naskh mt-2 text-lg font-bold leading-relaxed">{e.question}</h3>
            <div className="mt-4 grid gap-2" role="radiogroup" aria-label="خيارات المرحلة">
              {ordre.map((src, aff) => {
                const choisi = rep === aff;
                const style = choisi
                  ? 'border-forest bg-sage text-forest-deep'
                  : 'border-line bg-paper text-ink-soft hover:border-sage';
                return (
                  <button
                    key={aff}
                    onClick={() => !etapeFaite && setRep(aff)}
                    disabled={etapeFaite}
                    className={`rounded-2xl border p-4 text-right text-sm transition ${style}`}
                  >
                    {e.options[src]}
                  </button>
                );
              })}
            </div>
            {message && (
              <p
                className={`mt-4 text-sm font-bold ${
                  etapeFaite ? 'text-forest' : 'text-clay'
                }`}
              >
                {message}
              </p>
            )}
            {!etapeFaite && (
              <div className="mt-5 grid gap-2">
                <button
                  onClick={validerEtape}
                  disabled={rep === null}
                  className="btn btn-primary w-full"
                >
                  تحقَّق
                </button>
              </div>
            )}
            {etapeFaite && (
              <button onClick={etapeSuivante} className="btn btn-primary mt-5 w-full">
                {etape + 1 >= ENQUETE.etapes.length ? 'إنهاء الامتحان ←' : 'المرحلة التالية ←'}
              </button>
            )}
          </section>
        </div>
      </div>
    );
  }

  // ───────────── الشاشة النهائية: لا نسبة مئوية، بل دلالة على درجة البارم ─────────────
  // الدرجة النهائية صادقة: كل مرحلة تُرقَّع خانتها إذا أُنجزت، ولا تُعلَّم إلا ما أُنجز فعلًا.
  const totalFaux = qFaux + enqFaux;
  const toutJuste = totalFaux === 0;
  const barreauxFinaux = [0, 1, 2, 3].map((k) => k <= etape);
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-cream">
      <div className="mx-auto max-w-2xl px-5 py-8">
        <section className="card p-6">
          <p className="eyebrow">نتيجة الامتحان التجريبي</p>
          <h2 className="font-naskh mt-2 text-2xl font-bold">أنهيت الامتحان</h2>
          <div className="mt-4 rounded-2xl bg-sage-soft p-4">
            <p className="text-sm leading-relaxed text-forest-deep">
              {toutJuste
                ? `أتقنت الامتحان دون خطأ: ${nb(qDirects)} من ${nb(
                    NB_QCM,
                  )} أسئلة الاسترجاع إجابة مباشرة، ودرجة البارم كاملة. تُجدول لك بطاقة كفاءة بعد 3 أيام.`
                : `كافحت وأتممت: ${nb(qDirects)} من ${nb(
                    NB_QCM,
                  )} أسئلة الاسترجاع كانت إجابة مباشرة. الأخطاء سُجِّلت في سجلّ الأخطاء لتراجعها، وتُجدول لك بطاقة كفاءة غدًا.`}
            </p>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-mute">درجة بارم التمرين الثاني</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {GRILLE_BAREME.map((g, k) => (
                <div
                  key={g}
                  className={`rounded-xl border p-2 text-center text-xs font-bold ${
                    barreauxFinaux[k]
                      ? 'border-forest bg-sage text-forest-deep'
                      : 'border-line bg-paper text-mute'
                  }`}
                >
                  {barreauxFinaux[k] ? '✓ ' : ''}
                  {g}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-2">
            <button onClick={demarrerExamen} className="btn btn-ghost w-full">
              إعادة الامتحان
            </button>
            <button onClick={onFermer} className="btn btn-primary w-full">
              العودة إلى التدريبات
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

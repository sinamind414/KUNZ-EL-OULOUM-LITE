// منهجية حل التمرين — تشخيص قصير، دليل أفعال التعليمة، مسارات المنهجية، وتمرين تطبيقي.
// مُسترجَعة من فرع arena/7a3f2e84 (6a51bd7 + 6a206d2) — مُطوَّرة بقوانين التطبيق:
// أخضر للصواب / أحمر للخطأ مع sonJuste/sonFaux، إعادة المحاولة بلا كشف الجواب،
// بلا نسبة مئوية وبلا لوم (رسائل تشجيعية فقط)، وكل الأرقام لاتينية.

import { useState } from 'react';
import { IcoRetour } from './Icones';
import { sonFaux, sonJuste } from '../utils/son';

interface Props {
  onFermer: () => void;
}

type Ecran = 'accueil' | 'verbes' | 'diagnostic' | 'methode' | 'exercice' | 'resultat';

const methodes: [string, string, string][] = [
  ['استغلال وثيقة', 'ملاحظة → معلومة → تفسير → استنتاج', 'للنصوص والرسومات والوثائق العلمية.'],
  ['تحليل منحنى', 'محاور → وحدات → تطور → تفسير', 'للقراءة الدقيقة للبيانات والنتائج.'],
  ['استغلال جدول', 'تحديد المعايير → مقارنة → استنتاج', 'للمقارنة بين القيم والمجموعات.'],
  ['تحليل تجربة', 'إشكالية → فرضية → تجربة → نتائج → خلاصة', 'لفهم المنهج التجريبي.'],
  ['المقارنة', 'تشابهات → اختلافات → علاقة', 'لمقارنة استجابتين أو بنيتين.'],
  ['نص علمي تركيبي', 'سؤال → أفكار → ترتيب → روابط → إجابة', 'لتحضير إجابة البكالوريا.'],
];

const verbes: [string, string, string, string][] = [
  ['حدّد / عيّن', 'تسمية العنصر المطلوب بدقة، دون شرح طويل.', 'اذكر الاسم أو القيمة أو المكان كما يظهر في الوثيقة.', 'حدّد مقر تركيب البروتين.'],
  ['استخرج', 'نقل معلومة مباشرة من الوثيقة.', 'لا تضف تفسيرًا من عندك؛ استخرج ما هو موجود.', 'استخرج قيمة سرعة التفاعل عند 37°C.'],
  ['صف', 'ذكر ما نلاحظه من تنظيم أو تطور أو فرق.', 'استعمل: يرتفع، ينخفض، يظهر، يختفي، يختلف.', 'صف تغير نشاط الإنزيم مع درجة الحرارة.'],
  ['قارن', 'تحديد أوجه التشابه والاختلاف بين عنصرين.', 'لا تدرس كل عنصر وحده؛ اربط بينهما.', 'قارن بين الاستجابة الخلطية والاستجابة الخلوية.'],
  ['حلّل', 'تفكيك الوثيقة إلى عناصر ثم إبراز العلاقات بينها.', 'انتقل من المعطيات إلى العلاقة العلمية.', 'حلّل نتائج التجربة وحدد العلاقة بين pH والنشاط.'],
  ['فسّر', 'شرح سبب أو آلية الظاهرة باستعمال المكتسبات.', 'لا تكرر الملاحظة؛ أجب عن لماذا وكيف.', 'فسّر انخفاض نشاط الإنزيم عند pH شديد.'],
  ['علّل / برّر', 'تقديم سبب علمي يدعم إجابتك.', 'اربط السبب بالدليل أو بالمعرفة العلمية.', 'علّل ضرورة معالجة ARNm قبل خروجه من النواة.'],
  ['استنتج / استخلص', 'صياغة خلاصة مبنية على المعطيات.', 'ابدأ بـ: نستنتج أن… أو يمكن القول إن…', 'استنتج مصدر الأكسجين المنطلق في التركيب الضوئي.'],
  ['أثبت / برهن', 'إقناع القارئ بصحة فكرة بواسطة دليل واضح.', 'اذكر النتيجة ثم الدليل الذي يثبتها.', 'أثبت أن البنية الفراغية تحدد وظيفة البروتين.'],
  ['اقترح فرضية', 'تفسير مؤقت قابل للاختبار.', 'يجب أن تكون مرتبطة بالمشكلة ويمكن التحقق منها بتجربة.', 'اقترح فرضية تفسر تغير سرعة التفاعل.'],
  ['مثّل / أنجز مخططًا', 'تحويل المعلومات إلى رسم منظم ومشروح.', 'ضع عنوانًا، أسهمًا، بيانات ومفتاحًا عند الحاجة.', 'أنجز مخططًا يوضح مراحل الاستجابة المناعية.'],
];

const diagnostic: readonly [string, readonly string[], number][] = [
  ['ماذا تفعل عندما تقرأ «قارن»؟', ['أعطي تعريفًا فقط', 'أذكر التشابهات والاختلافات', 'أكتب خلاصة دون وثيقة'], 1],
  ['«تزداد السرعة عند 37°C» هي:', ['ملاحظة', 'فرضية', 'تفسير'], 0],
  ['ما الذي يجب أن تتضمنه الخلاصة؟', ['بيانات + علاقة علمية', 'رأي شخصي فقط', 'نسخ عنوان الوثيقة'], 0],
];

const REFAIRE = 'ليس الجواب الصحيح — أعد المحاولة. خذ وقتك، لا عجلة.';

export default function Methodologie({ onFermer }: Props) {
  const [ecran, setEcran] = useState<Ecran>('accueil');
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [dernierFaux, setDernierFaux] = useState<number | null>(null);
  const [erreur, setErreur] = useState(false);
  const [rate, setRate] = useState(false); // échec au 1er essai sur la question en cours (persiste pendant les réessais)
  const [methode, setMethode] = useState(0);
  const [reponse, setReponse] = useState<number | null>(null);
  const [dernierFauxExo, setDernierFauxExo] = useState<number | null>(null);
  const [justeExo, setJusteExo] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTon, setFeedbackTon] = useState<'juste' | 'refaire'>('juste');

  // تشخيص: خطأ = أحمر + نغمة هادئة + إعادة المحاولة (بلا كشف الجواب)؛ صواب = أخضر + نغمة صاعدة.
  function validerDiagnostic(): void {
    if (selected === null) return;
    if (selected === diagnostic[q][2]) {
      sonJuste();
      if (!rate) setScore((s) => s + 1);
      setErreur(false);
      setRate(false);
      setDernierFaux(null);
      setSelected(null);
      if (q === diagnostic.length - 1) setEcran('resultat');
      else {
        setQ(q + 1);
      }
    } else {
      sonFaux();
      setErreur(true);
      setRate(true);
      setDernierFaux(selected);
      setSelected(null);
    }
  }

  function choisirMethode(i: number): void {
    setMethode(i);
    setEcran('exercice');
    setReponse(null);
    setFeedback('');
    setDernierFauxExo(null);
    setJusteExo(false);
  }

  function validerExercice(): void {
    if (reponse === null) return;
    if (reponse === 0) {
      sonJuste();
      setJusteExo(true);
      setFeedbackTon('juste');
      setFeedback('صحيح. ابدأ بالملاحظة ثم اربطها بالتفسير العلمي.');
    } else {
      sonFaux();
      setDernierFauxExo(reponse);
      setReponse(null);
      setFeedbackTon('refaire');
      setFeedback(REFAIRE);
    }
  }

  return (
    <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl">
      <header className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          onClick={onFermer}
          aria-label="رجوع"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute"
        >
          <span className="block h-5 w-5">
            <IcoRetour />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">تدريب البكالوريا</p>
          <h1 className="font-naskh truncate text-xl font-bold">منهجية حل التمرين</h1>
        </div>
      </header>

      <main className="mx-auto mt-5 max-w-3xl">
        {ecran === 'accueil' && (
          <section className="card p-6">
            <p className="text-4xl">🧭</p>
            <h2 className="font-naskh mt-3 text-2xl font-bold">لا تحفظ الإجابة، تعلّم كيف تبنيها</h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              افهم التعليمة، استخرج المعطيات، صف النتائج، فسّرها ثم اكتب استنتاجًا علميًا. سنبدأ
              بتشخيص قصير لنحدد المنهجية التي تحتاجها.
            </p>
            <button onClick={() => setEcran('diagnostic')} className="btn btn-primary mt-6 w-full">
              ابدأ التشخيص · 3 دقائق
            </button>
            <button onClick={() => setEcran('verbes')} className="btn btn-gold mt-3 w-full">
              دليل أفعال التعليمة
            </button>
            <button onClick={() => setEcran('methode')} className="btn btn-ghost mt-3 w-full">
              أعرف المنهجية — تصفح الطرق
            </button>
          </section>
        )}

        {ecran === 'verbes' && (
          <section className="card p-5">
            <p className="eyebrow">دليل قراءة التعليمة</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ماذا يطلب منك الفعل؟</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              اقرأ فعل التعليمة أولًا: هو الذي يحدد شكل إجابتك، وليس طول الوثيقة.
            </p>
            <div className="mt-4 space-y-2">
              {verbes.map(([verbe, definition, conseil, exemple]) => (
                <article key={verbe} className="rounded-2xl border border-line bg-paper p-4">
                  <h3 className="text-sm font-bold text-forest">{verbe}</h3>
                  <p className="mt-1 text-sm font-bold leading-relaxed">{definition}</p>
                  <p className="mt-1 text-xs leading-relaxed text-mute">نصيحة: {conseil}</p>
                  <p className="mt-2 rounded-xl bg-sage-soft p-2 text-xs font-bold leading-relaxed text-forest-deep">
                    مثال: {exemple}
                  </p>
                </article>
              ))}
            </div>
            <button onClick={() => setEcran('diagnostic')} className="btn btn-primary mt-5 w-full">
              اختبر نفسك
            </button>
          </section>
        )}

        {ecran === 'diagnostic' && (
          <section className="card p-6">
            <p className="eyebrow">
              تشخيص {q + 1} / {diagnostic.length}
            </p>
            <h2 className="font-naskh mt-2 text-xl font-bold">{diagnostic[q][0]}</h2>
            <div className="mt-5 grid gap-2">
              {diagnostic[q][1].map((option, i) => {
                let style = 'border-line bg-paper';
                if (dernierFaux === i) style = 'border-clay bg-clay-soft text-clay';
                else if (selected === i) style = 'border-forest bg-sage text-forest-deep';
                return (
                  <button
                    key={option}
                    onClick={() => {
                      setSelected(i);
                      setErreur(false);
                      setDernierFaux(null);
                    }}
                    className={`rounded-2xl border p-4 text-right text-sm font-bold ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {erreur && (
              <p className="mt-3 text-sm font-bold text-clay">{REFAIRE}</p>
            )}
            <button
              onClick={validerDiagnostic}
              disabled={selected === null}
              className="btn btn-primary mt-5 w-full"
            >
              تحقّق
            </button>
          </section>
        )}

        {ecran === 'resultat' && (
          <section className="card p-6">
            <p className="eyebrow">نتيجة التشخيص</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">
              حصلت على {score} / {diagnostic.length}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              {score === diagnostic.length
                ? 'منهجية صلبة — انتقل إلى المسارات وطبّقها على وثائق البكالوريا.'
                : 'ابدأ بمسار «من الملاحظة إلى الاستنتاج». حتى إذا كانت إجابتك جيدة، هذا المسار يثبت منهجية الإجابة. هذا التشخيص قابل لإعادة المحاولة متى شئت.'}
            </p>
            <button onClick={() => setEcran('methode')} className="btn btn-primary mt-5 w-full">
              اكتشف المنهجية
            </button>
            <button
              onClick={() => {
                setQ(0);
                setScore(0);
                setErreur(false);
                setRate(false);
                setDernierFaux(null);
                setSelected(null);
                setEcran('diagnostic');
              }}
              className="btn btn-ghost mt-3 w-full"
            >
              إعادة التشخيص
            </button>
          </section>
        )}

        {ecran === 'methode' && (
          <section className="card p-5">
            <p className="eyebrow">مسارات المنهجية</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">اختر نوع التمرين</h2>
            <div className="mt-4 space-y-2">
              {methodes.map(([title, chain, description], i) => (
                <button
                  key={title}
                  onClick={() => choisirMethode(i)}
                  className="w-full rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"
                >
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs font-bold text-forest">{chain}</p>
                  <p className="mt-1 text-xs text-mute">{description}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setEcran('accueil')} className="btn btn-ghost mt-4 w-full">
              العودة إلى البداية
            </button>
          </section>
        )}

        {ecran === 'exercice' && (
          <section className="card p-6">
            <p className="eyebrow">{methodes[methode][0]}</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{methodes[methode][1]}</h2>
            <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">قاعدة البداية</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed">
                لا تفسر قبل أن تصف. استخرج أولًا ما يظهر في الوثيقة، ثم ابحث عن العلاقة العلمية.
              </p>
            </div>
            <p className="mt-5 text-sm font-bold">
              تظهر سرعة تفاعل إنزيمي ضعيفة عند 20°C، قصوى عند 37°C، ثم ضعيفة عند 60°C. ماذا تكتب
              أولًا؟
            </p>
            <div className="mt-3 grid gap-2">
              {[
                'ألاحظ أن النشاط يبلغ قيمة قصوى عند 37°C.',
                'أستنتج أن الإنزيم دُمّر عند 60°C.',
                'أكتب أن الحرارة هي السبب دون ذكر النتائج.',
              ].map((option, i) => {
                let style = 'border-line bg-paper';
                if (dernierFauxExo === i) style = 'border-clay bg-clay-soft text-clay';
                else if (justeExo && i === 0) style = 'border-forest bg-sage text-forest-deep';
                else if (reponse === i) style = 'border-forest bg-sage text-forest-deep';
                return (
                  <button
                    key={option}
                    onClick={() => {
                      if (justeExo) return;
                      setReponse(i);
                      setDernierFauxExo(null);
                      setFeedback('');
                    }}
                    className={`rounded-2xl border p-3 text-right text-sm font-bold ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {feedback && (
              <p
                className={`mt-3 rounded-2xl p-3 text-sm font-bold ${
                  feedbackTon === 'juste'
                    ? 'bg-sage-soft text-forest-deep'
                    : 'bg-clay-soft text-clay'
                }`}
              >
                {feedback}
              </p>
            )}
            {!justeExo && (
              <button
                onClick={validerExercice}
                disabled={reponse === null}
                className="btn btn-primary mt-5 w-full"
              >
                تحقّق من طريقة التفكير
              </button>
            )}
            <button
              onClick={() => {
                setEcran('methode');
                setReponse(null);
                setFeedback('');
                setDernierFauxExo(null);
                setJusteExo(false);
              }}
              className="btn btn-ghost mt-3 w-full"
            >
              اختيار طريقة أخرى
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { IcoRetour } from './Icones';

interface Props { onFermer: () => void; }
type Ecran = 'accueil' | 'verbes' | 'diagnostic' | 'methode' | 'exercice' | 'resultat';
const methodes = [
  ['استغلال وثيقة', 'ملاحظة → معلومة → تفسير → استنتاج', 'للنصوص والرسومات والوثائق العلمية.'],
  ['تحليل منحنى', 'محاور → وحدات → تطور → تفسير', 'للقراءة الدقيقة للبيانات والنتائج.'],
  ['استغلال جدول', 'تحديد المعايير → مقارنة → استنتاج', 'للمقارنة بين القيم والمجموعات.'],
  ['تحليل تجربة', 'إشكالية → فرضية → تجربة → نتائج → خلاصة', 'لفهم المنهج التجريبي.'],
  ['المقارنة', 'تشابهات → اختلافات → علاقة', 'لمقارنة استجابتين أو بنيتين.'],
  ['نص علمي تركيبي', 'سؤال → أفكار → ترتيب → روابط → إجابة', 'لتحضير إجابة البكالوريا.'],
];
const verbes = [
  ['حدّد / عيّن', 'تسمية العنصر المطلوب بدقة، دون شرح طويل.', 'اذكر الاسم أو القيمة أو المكان كما يظهر في الوثيقة.'],
  ['استخرج', 'نقل معلومة مباشرة من الوثيقة.', 'لا تضف تفسيرًا من عندك؛ استخرج ما هو موجود.'],
  ['صف', 'ذكر ما نلاحظه من تنظيم أو تطور أو فرق.', 'استعمل: يرتفع، ينخفض، يظهر، يختفي، يختلف.'],
  ['قارن', 'تحديد أوجه التشابه والاختلاف بين عنصرين.', 'لا تدرس كل عنصر وحده؛ اربط بينهما.'],
  ['حلّل', 'تفكيك الوثيقة إلى عناصر ثم إبراز العلاقات بينها.', 'انتقل من المعطيات إلى العلاقة العلمية.'],
  ['فسّر', 'شرح سبب أو آلية الظاهرة باستعمال المكتسبات.', 'لا تكرر الملاحظة؛ أجب عن لماذا وكيف.'],
  ['علّل / برّر', 'تقديم سبب علمي يدعم إجابتك.', 'اربط السبب بالدليل أو بالمعرفة العلمية.'],
  ['استنتج / استخلص', 'صياغة خلاصة مبنية على المعطيات.', 'ابدأ بـ: نستنتج أن… أو يمكن القول إن…'],
  ['أثبت / برهن', 'إقناع القارئ بصحة فكرة بواسطة دليل واضح.', 'اذكر النتيجة ثم الدليل الذي يثبتها.'],
  ['اقترح فرضية', 'تفسير مؤقت قابل للاختبار.', 'يجب أن تكون مرتبطة بالمشكلة ويمكن التحقق منها بتجربة.'],
  ['مثّل / أنجز مخططًا', 'تحويل المعلومات إلى رسم منظم ومشروح.', 'ضع عنوانًا، أسهمًا، بيانات ومفتاحًا عند الحاجة.'],
];

const diagnostic = [
  ['ماذا تفعل عندما تقرأ «قارن»؟', ['أعطي تعريفًا فقط', 'أذكر التشابهات والاختلافات', 'أكتب خلاصة دون وثيقة'], 1],
  ['«تزداد السرعة عند 37°C» هي:', ['ملاحظة', 'فرضية', 'تفسير'], 0],
  ['ما الذي يجب أن تتضمنه الخلاصة؟', ['بيانات + علاقة علمية', 'رأي شخصي فقط', 'نسخ عنوان الوثيقة'], 0],
] as const;
export default function Methodologie({ onFermer }: Props) {
  const [ecran, setEcran] = useState<Ecran>('accueil'); const [q, setQ] = useState(0); const [score, setScore] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [methode, setMethode] = useState(0); const [reponse, setReponse] = useState<number | null>(null); const [feedback, setFeedback] = useState('');
  function checkDiagnostic() { if (selected === null) return; const next = score + (selected === diagnostic[q][2] ? 1 : 0); setScore(next); setSelected(null); if (q === diagnostic.length - 1) setEcran('resultat'); else setQ(q + 1); }
  function checkExercise() { if (reponse === null) return; setFeedback(reponse === 0 ? 'صحيح. ابدأ بالملاحظة ثم اربطها بالتفسير العلمي.' : 'راجع القاعدة: لا تفسر قبل أن تصف ما يظهر في الوثيقة.'); }
  return <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl"><header className="mx-auto flex max-w-3xl items-center gap-3"><button onClick={onFermer} className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute"><span className="block h-5 w-5"><IcoRetour /></span></button><div className="min-w-0 flex-1"><p className="eyebrow">تدريب البكالوريا</p><h1 className="font-naskh truncate text-xl font-bold">منهجية حل التمرين</h1></div></header><main className="mx-auto mt-5 max-w-3xl">
    {ecran === 'accueil' && <section className="card p-6"><p className="text-4xl">🧭</p><h2 className="font-naskh mt-3 text-2xl font-bold">لا تحفظ الإجابة، تعلّم كيف تبنيها</h2><p className="mt-3 text-sm leading-relaxed text-mute">افهم التعليمة، استخرج المعطيات، صف النتائج، فسّرها ثم اكتب استنتاجًا علميًا. سنبدأ بتشخيص قصير لنحدد المنهجية التي تحتاجها.</p><button onClick={() => setEcran('diagnostic')} className="btn btn-primary mt-6 w-full">ابدأ التشخيص · 3 دقائق</button><button onClick={() => setEcran('verbes')} className="btn btn-gold mt-3 w-full">دليل أفعال التعليمة</button><button onClick={() => setEcran('methode')} className="btn btn-ghost mt-3 w-full">أعرف المنهجية — تصفح الطرق</button></section>}
    {ecran === 'verbes' && <section className="card p-5"><p className="eyebrow">دليل قراءة التعليمة</p><h2 className="font-naskh mt-2 text-2xl font-bold">ماذا يطلب منك الفعل؟</h2><p className="mt-2 text-sm leading-relaxed text-mute">اقرأ فعل التعليمة أولًا: هو الذي يحدد شكل إجابتك، وليس طول الوثيقة.</p><div className="mt-4 space-y-2">{verbes.map(([verbe, definition, conseil]) => <article key={verbe} className="rounded-2xl border border-line bg-paper p-4"><h3 className="text-sm font-bold text-forest">{verbe}</h3><p className="mt-1 text-sm font-bold leading-relaxed">{definition}</p><p className="mt-1 text-xs leading-relaxed text-mute">نصيحة: {conseil}</p></article>)}</div><button onClick={() => setEcran('diagnostic')} className="btn btn-primary mt-5 w-full">اختبر نفسك</button></section>}
    {ecran === 'diagnostic' && <section className="card p-6"><p className="eyebrow">تشخيص {q + 1} / {diagnostic.length}</p><h2 className="font-naskh mt-2 text-xl font-bold">{diagnostic[q][0]}</h2><div className="mt-5 grid gap-2">{diagnostic[q][1].map((option, i) => <button key={option} onClick={() => setSelected(i)} className={`rounded-2xl border p-4 text-right text-sm font-bold ${selected === i ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{option}</button>)}</div><button onClick={checkDiagnostic} disabled={selected === null} className="btn btn-primary mt-5 w-full">تحقق</button></section>}
    {ecran === 'resultat' && <section className="card p-6"><p className="eyebrow">نتيجة التشخيص</p><h2 className="font-naskh mt-2 text-2xl font-bold">حصلت على {score} / {diagnostic.length}</h2><p className="mt-3 text-sm leading-relaxed text-mute">ابدأ بمسار «من الملاحظة إلى الاستنتاج». حتى إذا كانت إجابتك جيدة، هذا المسار يثبت منهجية الإجابة.</p><button onClick={() => setEcran('methode')} className="btn btn-primary mt-5 w-full">اكتشف المنهجية</button></section>}
    {ecran === 'methode' && <section className="card p-5"><p className="eyebrow">مسارات المنهجية</p><h2 className="font-naskh mt-2 text-2xl font-bold">اختر نوع التمرين</h2><div className="mt-4 space-y-2">{methodes.map(([title, chain, description], i) => <button key={title} onClick={() => { setMethode(i); setEcran('exercice'); setReponse(null); setFeedback(''); }} className="w-full rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs font-bold text-forest">{chain}</p><p className="mt-1 text-xs text-mute">{description}</p></button>)}</div></section>}
    {ecran === 'exercice' && <section className="card p-6"><p className="eyebrow">{methodes[methode][0]}</p><h2 className="font-naskh mt-2 text-2xl font-bold">{methodes[methode][1]}</h2><div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4"><p className="text-[11px] font-bold text-forest">قاعدة البداية</p><p className="mt-1.5 text-sm font-bold leading-relaxed">لا تفسر قبل أن تصف. استخرج أولًا ما يظهر في الوثيقة، ثم ابحث عن العلاقة العلمية.</p></div><p className="mt-5 text-sm font-bold">تظهر سرعة تفاعل إنزيمي ضعيفة عند 20°C، قصوى عند 37°C، ثم ضعيفة عند 60°C. ماذا تكتب أولًا؟</p><div className="mt-3 grid gap-2">{['ألاحظ أن النشاط يبلغ قيمة قصوى عند 37°C.', 'أستنتج أن الإنزيم دُمّر عند 60°C.', 'أكتب أن الحرارة هي السبب دون ذكر النتائج.'].map((option, i) => <button key={option} onClick={() => setReponse(i)} className={`rounded-2xl border p-3 text-right text-sm font-bold ${reponse === i ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{option}</button>)}</div>{feedback && <p className="mt-3 rounded-2xl bg-sage-soft p-3 text-sm font-bold text-forest">{feedback}</p>}<button onClick={checkExercise} disabled={reponse === null} className="btn btn-primary mt-5 w-full">تحقق من طريقة التفكير</button><button onClick={() => setEcran('methode')} className="btn btn-ghost mt-3 w-full">اختيار طريقة أخرى</button></section>}
  </main></div>;
}

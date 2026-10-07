import { useState } from 'react';
import { IcoRetour } from './Icones';

interface Props { onFermer: () => void; modeInitial?: 'accueil' | 'niveaux'; }
type Ecran = 'accueil' | 'cle' | 'operations' | 'verbes' | 'diagnostic' | 'methode' | 'niveaux' | 'exercice' | 'resultat';

const cle = [
  ['فعل', 'أقرأ التعليمة كاملة وأحدد ما يجب أن أنتج.', 'لا أجيب عن سؤال آخر لمجرد أنني أعرف معلومات عنه.'],
  ['دليل', 'أختار المعطيات النافعة: قيم، تغيرات، مقارنة، شاهد وشروط.', 'كل معطى مختار يجب أن يخدم الاستدلال، وإلا أحذفه.'],
  ['جواب', 'أكتب المنتج المطلوب مباشرة، مع علاقة إذا اقتضت التعليمة.', 'الجملة النهائية يجب أن تجيب عن السؤال وحده.'],
  ['فحص', 'أراجع الفعل والدليل والجواب قبل إنهاء الإجابة.', 'إذا فشل الفحص أرجع إلى التعليمة، لا إلى الحفظ العشوائي.'],
];
const operations = [
  ['أصف', 'ماذا تظهر المعطيات؟', 'نلاحظ، يرتفع، ينخفض، يثبت، يختلف.'],
  ['أفسّر', 'ماذا تعني المعطيات؟', 'معطى من الوثيقة + معرفة من الدرس.'],
  ['أحكم', 'ماذا أقرر بناءً على الدليل؟', 'يتوافق، لا يتوافق، نستنتج، لا تكفي المعطيات.'],
];
const verbes = [
  ['حدّد / عيّن', 'تسمية العنصر المطلوب بدقة.', 'حدّد مقر تركيب البروتين.'],
  ['استخرج', 'نقل معلومة مباشرة من الوثيقة.', 'استخرج قيمة سرعة التفاعل عند 37°C.'],
  ['صف', 'ذكر ما نلاحظه دون تفسير.', 'صف تغير نشاط الإنزيم مع الحرارة.'],
  ['قارن', 'تحديد أوجه التشابه والاختلاف.', 'قارن بين الاستجابة الخلطية والخلوية.'],
  ['حلّل', 'تفكيك الوثيقة وإبراز العلاقات.', 'حلّل نتائج التجربة وحدد العلاقة.'],
  ['فسّر', 'شرح السبب أو الآلية باستعمال الدرس.', 'فسّر انخفاض نشاط الإنزيم.'],
  ['علّل / برّر', 'تقديم سبب علمي يدعم الإجابة.', 'علّل معالجة ARNm قبل خروجه.'],
  ['استنتج / استخلص', 'صياغة خلاصة مبنية على المعطيات.', 'استنتج مصدر الأكسجين المنطلق.'],
  ['أثبت / برهن', 'إقناع القارئ بدليل واضح.', 'أثبت أن البنية تحدد الوظيفة.'],
  ['اقترح فرضية', 'تفسير مؤقت قابل للاختبار.', 'اقترح فرضية لتغير سرعة التفاعل.'],
  ['مثّل / أنجز مخططًا', 'تحويل المعلومات إلى رسم منظم.', 'أنجز مخططًا للاستجابة المناعية.'],
];
const methodes = [
  ['استغلال وثيقة', 'ملاحظة → معلومة → تفسير → استنتاج'],
  ['تحليل منحنى', 'محاور → وحدات → تطور → تفسير'],
  ['استغلال جدول', 'معايير → مقارنة → علاقة → خلاصة'],
  ['تحليل تجربة', 'إشكالية → فرضية → تجربة → نتائج'],
  ['المقارنة', 'تشابهات → اختلافات → علاقة'],
  ['نص علمي تركيبي', 'سؤال → أفكار → ترتيب → روابط'],
];
const diagnostic = [
  ['ماذا تفعل عندما تقرأ «قارن»؟', ['أعطي تعريفًا فقط', 'أذكر التشابهات والاختلافات', 'أكتب خلاصة دون وثيقة'], 1],
  ['«تزداد السرعة عند 37°C» هي:', ['ملاحظة', 'فرضية', 'تفسير'], 0],
  ['ما الذي يجب أن تتضمنه الخلاصة؟', ['بيانات + علاقة علمية', 'رأي شخصي فقط', 'نسخ عنوان الوثيقة'], 0],
] as const;

export default function Methodologie({ onFermer, modeInitial = 'accueil' }: Props) {
  const [ecran, setEcran] = useState<Ecran>(modeInitial);
  const [q, setQ] = useState(0); const [score, setScore] = useState(0); const [selected, setSelected] = useState<number | null>(null);
  const [operation, setOperation] = useState(0); const [methode, setMethode] = useState(0); const [reponse, setReponse] = useState<number | null>(null); const [feedback, setFeedback] = useState('');
  function startDiagnostic() { setQ(0); setScore(0); setSelected(null); setEcran('diagnostic'); }
  function checkDiagnostic() { if (selected === null) return; const next = score + (selected === diagnostic[q][2] ? 1 : 0); setScore(next); setSelected(null); if (q === diagnostic.length - 1) setEcran('resultat'); else setQ(q + 1); }
  function checkExercise() { if (reponse === null) return; setFeedback(reponse === 0 ? 'صحيح. ابدأ بالملاحظة، ثم اربطها بالتفسير العلمي إذا طلبت التعليمة ذلك.' : 'راجع المفتاح: لا تفسر قبل أن تصف ما يظهر في الوثيقة.'); }
  return <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl">
    <header className="mx-auto flex max-w-3xl items-center gap-3"><button onClick={onFermer} className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute" aria-label="رجوع"><span className="block h-5 w-5"><IcoRetour /></span></button><div className="min-w-0 flex-1"><p className="eyebrow">تدريب البكالوريا</p><h1 className="font-naskh truncate text-xl font-bold">منهجية حل التمرين</h1></div><span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">المفتاح</span></header>
    <main className="mx-auto mt-5 max-w-3xl">
      {ecran === 'accueil' && <section className="space-y-4"><div className="card overflow-hidden"><div className="bg-gradient-to-l from-forest to-forest-deep p-6 text-paper"><p className="text-4xl">🔑</p><h2 className="font-naskh mt-3 text-2xl font-bold">فعل ← دليل ← جواب ← فحص</h2><p className="mt-2 text-sm leading-relaxed text-paper/80">لا تحفظ الإجابة. تعلّم كيف تبنيها من التعليمة والوثيقة.</p><button onClick={startDiagnostic} className="btn mt-5 w-full bg-paper text-forest-deep hover:bg-sage">ابدأ التشخيص · 3 دقائق</button></div></div><div className="card p-5"><p className="eyebrow">النواة</p><h2 className="font-naskh mt-1 text-xl font-bold">أربع حركات قبل أن تكتب</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{cle.map(([title, text], i) => <button key={title} onClick={() => setEcran('cle')} className="rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"><span className="flex items-center gap-2"><b className="grid h-7 w-7 place-items-center rounded-full bg-forest text-xs text-paper">{i + 1}</b><b className="text-sm text-forest">{title}</b></span><span className="mt-2 block text-xs leading-relaxed text-mute">{text}</span></button>)}</div><button onClick={() => setEcran('cle')} className="btn btn-ghost mt-4 w-full">شرح المفتاح خطوة بخطوة</button></div><div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setEcran('operations')} className="card p-4 text-right hover:border-forest"><p className="text-sm font-bold text-forest">أصف · أفسّر · أحكم</p><p className="mt-1 text-xs text-mute">العمليات التي تبني جوابًا علميًا.</p></button><button onClick={() => setEcran('verbes')} className="card p-4 text-right hover:border-forest"><p className="text-sm font-bold text-forest">أفعال التعليمة</p><p className="mt-1 text-xs text-mute">افهم المطلوب قبل أن تبدأ.</p></button></div><button onClick={() => setEcran('niveaux')} className="btn btn-gold w-full">مستويات التدريب الأربعة</button></section>}
      {ecran === 'cle' && <section className="card p-5"><p className="eyebrow">المفتاح · حلقة التحكم</p><h2 className="font-naskh mt-2 text-2xl font-bold">قبل أن أكتب، أعرف ماذا أُنتج</h2><div className="mt-5 space-y-3">{cle.map(([title, text, conseil], i) => <article key={title} className="rounded-2xl border border-line bg-paper p-4"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-paper">{i + 1}</span><h3 className="text-base font-bold text-forest">{title}</h3></div><p className="mt-2 text-sm font-bold leading-relaxed">{text}</p><p className="mt-1 rounded-xl bg-sage-soft p-2 text-xs leading-relaxed text-forest-deep">علامة الأمان: {conseil}</p></article>)}</div><button onClick={() => setEcran('operations')} className="btn btn-primary mt-5 w-full">التالي: العمليات الثلاث</button></section>}
      {ecran === 'operations' && <section className="card p-5"><p className="eyebrow">المفتاح · أصف / أفسّر / أحكم</p><h2 className="font-naskh mt-2 text-2xl font-bold">ثلاث عمليات قابلة للدمج</h2><div className="mt-4 space-y-2">{operations.map(([title, question, language], i) => <button key={title} onClick={() => setOperation(i)} className={`w-full rounded-2xl border p-4 text-right ${operation === i ? 'border-forest bg-sage-soft' : 'border-line bg-paper'}`}><b className="text-sm text-forest">{title}</b><p className="mt-1 text-sm font-bold">{question}</p><p className="mt-1 text-xs text-mute">لغة مفيدة: {language}</p></button>)}</div><div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/50 p-4"><p className="text-[11px] font-bold text-[#6b5320]">مثال</p><p className="mt-1 text-sm leading-relaxed"><b>أصف:</b> النشاط يبلغ قيمة قصوى عند 37°C. <b>أفسّر:</b> لأن البنية الفراغية للإنزيم تكون مناسبة. <b>أحكم:</b> إذن للإنزيم درجة حرارة مثلى.</p></div><button onClick={() => setEcran('methode')} className="btn btn-primary mt-5 w-full">اختيار نوع التمرين</button></section>}
      {ecran === 'verbes' && <section className="card p-5"><p className="eyebrow">دليل قراءة التعليمة</p><h2 className="font-naskh mt-2 text-2xl font-bold">ماذا يطلب منك الفعل؟</h2><div className="mt-4 space-y-2">{verbes.map(([verbe, definition, exemple]) => <article key={verbe} className="rounded-2xl border border-line bg-paper p-4"><h3 className="text-sm font-bold text-forest">{verbe}</h3><p className="mt-1 text-sm font-bold">{definition}</p><p className="mt-2 rounded-xl bg-sage-soft p-2 text-xs font-bold text-forest-deep">مثال: {exemple}</p></article>)}</div><button onClick={startDiagnostic} className="btn btn-primary mt-5 w-full">اختبر نفسك</button></section>}
      {ecran === 'diagnostic' && <section className="card p-6"><p className="eyebrow">تشخيص {q + 1} / {diagnostic.length}</p><h2 className="font-naskh mt-2 text-xl font-bold">{diagnostic[q][0]}</h2><div className="mt-5 grid gap-2">{diagnostic[q][1].map((option, i) => <button key={option} onClick={() => setSelected(i)} className={`rounded-2xl border p-4 text-right text-sm font-bold ${selected === i ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{option}</button>)}</div><button onClick={checkDiagnostic} disabled={selected === null} className="btn btn-primary mt-5 w-full">تحقق</button></section>}
      {ecran === 'resultat' && <section className="card p-6"><p className="eyebrow">نتيجة التشخيص</p><h2 className="font-naskh mt-2 text-2xl font-bold">حصلت على {score} / {diagnostic.length}</h2><p className="mt-3 text-sm leading-relaxed text-mute">ابدأ بمسار «من الملاحظة إلى الاستنتاج». حتى إذا كانت إجابتك جيدة، هذا المسار يثبت منهجية الإجابة.</p><button onClick={() => setEcran('niveaux')} className="btn btn-primary mt-5 w-full">اكتشف مستويات التدريب</button></section>}
      {ecran === 'methode' && <section className="card p-5"><p className="eyebrow">مسارات المنهجية</p><h2 className="font-naskh mt-2 text-2xl font-bold">اختر نوع التمرين</h2><div className="mt-4 space-y-2">{methodes.map(([title, chain], i) => <button key={title} onClick={() => { setMethode(i); setEcran('exercice'); setReponse(null); setFeedback(''); }} className="w-full rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs font-bold text-forest">{chain}</p></button>)}</div></section>}
      {ecran === 'niveaux' && <section className="card p-5"><p className="eyebrow">التدريب المتدرج</p><h2 className="font-naskh mt-2 text-2xl font-bold">أربع مستويات نحو الاستقلال</h2><div className="mt-4 space-y-3">{[['1', 'القدوة المشروحة', 'مثال كامل مع شرح سبب صحة كل جملة.'], ['2', 'التمرين الموجه', 'هيكل جزئي، أكمل الخطوات الناقصة.'], ['3', 'التمرين المستقل', 'تعليمة وسند جديدان بلا إطار جاهز.'], ['4', 'تشخيص الخطأ', 'حلل إجابة تبدو صحيحة واكتشف ما سقط منها.']].map(([number, title, text]) => <button key={number} onClick={() => setEcran('methode')} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper p-4 text-right"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">{number}</span><span><b className="text-sm">{title}</b><span className="mt-1 block text-xs text-mute">{text}</span></span></button>)}</div><p className="mt-4 rounded-2xl bg-gold-soft/50 p-3 text-xs leading-relaxed text-[#6b5320]">لا تنتقل إلى المستوى التالي لمجرد أنك قرأت الطريقة. النجاح يعني أن تنفذها في تمرين.</p></section>}
      {ecran === 'exercice' && <section className="card p-6"><p className="eyebrow">{methodes[methode][0]}</p><h2 className="font-naskh mt-2 text-2xl font-bold">{methodes[methode][1]}</h2><div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4"><p className="text-[11px] font-bold text-forest">قاعدة المفتاح</p><p className="mt-1.5 text-sm font-bold leading-relaxed">لا تفسر قبل أن تصف. استخرج أولًا ما يظهر في الوثيقة، ثم ابحث عن العلاقة العلمية.</p></div><p className="mt-5 text-sm font-bold">تظهر سرعة تفاعل إنزيمي ضعيفة عند 20°C، قصوى عند 37°C، ثم ضعيفة عند 60°C. ماذا تكتب أولًا؟</p><div className="mt-3 grid gap-2">{['ألاحظ أن النشاط يبلغ قيمة قصوى عند 37°C.', 'أستنتج أن الإنزيم دُمّر عند 60°C.', 'أكتب أن الحرارة هي السبب دون ذكر النتائج.'].map((option, i) => <button key={option} onClick={() => setReponse(i)} className={`rounded-2xl border p-3 text-right text-sm font-bold ${reponse === i ? 'border-forest bg-sage text-forest-deep' : 'border-line bg-paper'}`}>{option}</button>)}</div>{feedback && <p className="mt-3 rounded-2xl bg-sage-soft p-3 text-sm font-bold text-forest">{feedback}</p>}<button onClick={checkExercise} disabled={reponse === null} className="btn btn-primary mt-5 w-full">تحقق من طريقة التفكير</button><button onClick={() => setEcran('methode')} className="btn btn-ghost mt-3 w-full">اختيار طريقة أخرى</button></section>}
    </main>
  </div>;
}

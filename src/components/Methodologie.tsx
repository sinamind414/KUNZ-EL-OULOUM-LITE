// منهجية حل التمرين — المفتاح: فعل ← دليل ← جواب ← فحص.
// Portée depuis la branche arena (commits 4bc29e2 « méthode clé » + 48afe8b « 10 تمارين
// تركيب البروتين »), branchée sur les conventions de l'app : أخضر للصواب / أحمر للخطأ avec
// sonJuste/sonFaux، إعادة المحاولة بلا كشف الجواب (l'erreur n'est révélée qu'après le bon
// choix)، بلا نسبة مئوية وبلا لوم، والأرقام لاتينية. Corrections du port : état `sourceExo`
// (collision d'index avec methodes), feedback rouge au faux, schémas #8 et n°6, positions
// variées de la bonne réponse.

import { useState } from 'react';
import { IcoRetour } from './Icones';
import { sonFaux, sonJuste } from '../utils/son';

interface Props {
  onFermer: () => void;
  /** Écran d'ouverture : accueil (onglet منهجية) ou niveaux (3e porte تمارين dans تدريبات). */
  modeInitial?: 'accueil' | 'niveaux';
}

type Ecran = 'accueil' | 'cle' | 'operations' | 'verbes' | 'diagnostic' | 'methode' | 'niveaux' | 'unite1' | 'exercice' | 'resultat';

// المفتاح — أربع حركات قبل أن أكتب.
const cle: [string, string, string][] = [
  ['فعل', 'أقرأ التعليمة كاملة وأحدد ما يجب أن أنتج.', 'لا أجيب عن سؤال آخر لمجرد أنني أعرف معلومات عنه.'],
  ['دليل', 'أختار المعطيات النافعة: قيم، تغيرات، مقارنة، شاهد وشروط.', 'كل معطى مختار يجب أن يخدم الاستدلال، وإلا أحذفه.'],
  ['جواب', 'أكتب المنتج المطلوب مباشرة، مع علاقة إذا اقتضت التعليمة.', 'الجملة النهائية يجب أن تجيب عن السؤال وحده.'],
  ['فحص', 'أراجع الفعل والدليل والجواب قبل إنهاء الإجابة.', 'إذا فشل الفحص أرجع إلى التعليمة، لا إلى الحفظ العشوائي.'],
];

// العمليات الثلاث التي تبني جوابًا علميًا.
const operations: [string, string, string][] = [
  ['أصف', 'ماذا تظهر المعطيات؟', 'نلاحظ، يرتفع، ينخفض، يثبت، يختلف.'],
  ['أفسّر', 'ماذا تعني المعطيات؟', 'معطى من الوثيقة + معرفة من الدرس.'],
  ['أحكم', 'ماذا أقرر بناءً على الدليل؟', 'يتوافق، لا يتوافق، نستنتج، لا تكفي المعطيات.'],
];

const verbes: [string, string, string][] = [
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

const methodes: [string, string][] = [
  ['استغلال وثيقة', 'ملاحظة → معلومة → تفسير → استنتاج'],
  ['تحليل منحنى', 'محاور → وحدات → تطور → تفسير'],
  ['استغلال جدول', 'معايير → مقارنة → علاقة → خلاصة'],
  ['تحليل تجربة', 'إشكالية → فرضية → تجربة → نتائج'],
  ['المقارنة', 'تشابهات → اختلافات → علاقة'],
  ['نص علمي تركيبي', 'سؤال → أفكار → ترتيب → روابط'],
];

// أربع مستويات نحو الاستقلال.
const niveaux: [string, string, string][] = [
  ['1', 'القدوة المشروحة', 'مثال كامل مع شرح سبب صحة كل جملة.'],
  ['2', 'التمرين الموجه', 'هيكل جزئي، أكمل الخطوات الناقصة.'],
  ['3', 'التمرين المستقل', 'تعليمة وسند جديدان بلا إطار جاهز.'],
  ['4', 'تشخيص الخطأ', 'حلل إجابة تبدو صحيحة واكتشف ما سقط منها.'],
];

const diagnostic: readonly [string, readonly string[], number][] = [
  ['ماذا تفعل عندما تقرأ «قارن»؟', ['أعطي تعريفًا فقط', 'أذكر التشابهات والاختلافات', 'أكتب خلاصة دون وثيقة'], 1],
  ['«تزداد السرعة عند 37°C» هي:', ['ملاحظة', 'فرضية', 'تفسير'], 0],
  ['ما الذي يجب أن تتضمنه الخلاصة؟', ['بيانات + علاقة علمية', 'رأي شخصي فقط', 'نسخ عنوان الوثيقة'], 0],
];

const REFAIRE = 'ليس الجواب الصحيح — أعد المحاولة. خذ وقتك، لا عجلة.';

// ───────────── الوحدة 1 · تركيب البروتين — 10 تمارين (ports arena 48afe8b + a79905c) ─────────────
type ExerciceUnite1 = {
  titre: string;
  verbe: string;
  objectif: string;
  consigne: string;
  preuve: string;
  reponse: string;
  erreur: string;
  diagramme:
    | 'flux'
    | 'cellules'
    | 'arn'
    | 'ribosome'
    | 'mutation'
    | 'sequence'
    | 'expression'
    | 'graphique'
    | 'comparaison'
    | 'synthese';
  /** Format d'exercice style Bac (port commit a79905c « varier les exercices »). */
  format: string;
  /** السند — le document support numéroté. */
  document: string;
};

const exercicesUnite1: ExerciceUnite1[] = [
  { titre: 'من المورثة إلى البروتين', verbe: 'مثّل', objectif: 'بناء مخطط التعبير المورثي', consigne: 'مثّل مراحل انتقال المعلومة الوراثية من ADN إلى بروتين وظيفي.', preuve: 'ADN → ARNm → ريبوزوم → سلسلة ببتيدية', reponse: 'تنتقل المعلومة من ADN بالاستنساخ إلى ARNm، ثم تُترجم في الريبوزوم إلى سلسلة ببتيدية تنطوي لتصبح بروتينًا وظيفيًا.', erreur: 'الريبوزوم لا يصنع ARNm؛ إنزيم ARN polymérase هو المسؤول عن الاستنساخ.', diagramme: 'flux', format: 'مخطط تركيبي', document: 'السند 1 · مخطط التعبير المورثي' },
  { titre: 'مقر الاستنساخ والترجمة', verbe: 'قارن', objectif: 'التمييز بين بدائيات وحقيقيات النوى', consigne: 'قارن بين مكان الاستنساخ ومكان الترجمة عند الخليتين.', preuve: 'النواة موجودة عند حقيقيات النوى وغير موجودة عند بدائيات النوى', reponse: 'عند حقيقيات النوى يتم الاستنساخ في النواة ثم تخرج ARNm إلى الهيولى للترجمة، أما عند بدائيات النوى فتتم العمليتان في الهيولى ويمكن أن تكونا متزامنتين.', erreur: 'لا تقل إن ADN يخرج من النواة؛ الذي ينتقل هو ARNm.', diagramme: 'cellules', format: 'مقارنة خلوية', document: 'السند 2 · خليتان مجهريتان' },
  { titre: 'نضج ARNm', verbe: 'فسّر', objectif: 'فهم معالجة الرسالة الوراثية', consigne: 'فسّر لماذا لا يغادر ARNm الأولي النواة مباشرة.', preuve: 'حذف الإنترونات وربط الإكسونات ينتج ARNm ناضجًا', reponse: 'يخضع ARNm الأولي للمعالجة؛ تحذف الإنترونات وتربط الإكسونات، فيتكون ARNm ناضج قابل للترجمة.', erreur: 'المعالجة لا تحدث في الريبوزوم، بل داخل النواة قبل خروج الرسالة.', diagramme: 'arn', format: 'تحليل وثيقة', document: 'السند 3 · معالجة ARNm' },
  { titre: 'قراءة الرامزة', verbe: 'حلّل', objectif: 'ربط الرامزة بمضاد الرامزة', consigne: 'حلّل الوثيقة وبيّن كيف يضمن ARNt إضافة الحمض الأميني المناسب.', preuve: 'تكامل الرامزة مع مضاد الرامزة', reponse: 'يتثبت ARNt في الرامزة الموافقة على ARNm بواسطة التكامل، ويحمل الحمض الأميني المحدد، ثم تتشكل الرابطة الببتيدية.', erreur: 'الرامزة توجد على ARNm، أما مضاد الرامزة فعلى ARNt.', diagramme: 'ribosome', format: 'تجربة الترجمة', document: 'السند 4 · آلية الترجمة' },
  { titre: 'طفرة واستبدال حمض أميني', verbe: 'استنتج', objectif: 'ربط تغير ADN بتغير البروتين', consigne: 'استنتج أثر استبدال رامزة واحدة في تسلسل مورثة.', preuve: 'اختلاف رامزة واحدة يقابله اختلاف حمض أميني واحد', reponse: 'قد يؤدي تغير قاعدة إلى رامزة جديدة، فتتغير هوية حمض أميني، وقد تتغير بنية البروتين ووظيفته.', erreur: 'لا نحكم دائمًا بفقدان الوظيفة؛ يجب مقارنة التسلسل والوظيفة أولًا.', diagramme: 'mutation', format: 'دراسة طفرة', document: 'السند 5 · مقارنة تسلسلين' },
  { titre: 'استخراج ARNm', verbe: 'استخرج', objectif: 'تطبيق التكامل القاعدي', consigne: 'استخرج تسلسل ARNm انطلاقًا من السلسلة غير المستنسخة المعطاة.', preuve: 'A↔U و T↔A و C↔G و G↔C حسب السلسلة المستنسخة', reponse: 'أحدد أولًا نوع السلسلة واتجاهها، ثم أطبق التكامل القاعدي وأكتب ARNm في الاتجاه 5’→3’.', erreur: 'في ARNm نستعمل U بدل T، ولا نخلط بين السلسلة المستنسخة وغير المستنسخة.', diagramme: 'sequence', format: 'تمرين وراثي', document: 'السند 6 · جدول التكامل القاعدي' },
  { titre: 'كمية ARNm والبروتين', verbe: 'حلّل', objectif: 'فهم العلاقة الزمنية بين الرسالة والبروتين', consigne: 'حلّل تغير كمية ARNm وكمية البروتين بعد إضافة ARNm.', preuve: 'ترتفع كمية البروتين بعد ارتفاع ARNm وتتأخر عنه', reponse: 'تظهر الرسالة أولًا ثم تُقرأ في الريبوزومات؛ لذلك يتأخر ارتفاع البروتين عن ارتفاع ARNm.', erreur: 'التأخر الزمني لا يعني أن البروتين يصنع الرسالة.', diagramme: 'expression', format: 'منحنى تجريبي', document: 'السند 7 · تغير الكمية مع الزمن' },
  { titre: 'تحديد مقر بروتين', verbe: 'علّل', objectif: 'ربط البنية بالوجهة', consigne: 'علّل وجود بروتين مُفرز خارج الخلية في الشبكة الهيولية المحببة.', preuve: 'وجود ببتيد إشارة والريبوزومات المرتبطة بالشبكة', reponse: 'يوجه ببتيد الإشارة الريبوزوم نحو الشبكة الهيولية المحببة، حيث يدخل البروتين مسار الإفراز ثم ينقل إلى خارج الخلية.', erreur: 'الريبوزوم الحر لا يفسر وحده إفراز البروتين.', diagramme: 'graphique', format: 'تجربة التوجيه', document: 'السند 8 · مسار بروتين مفرز' },
  { titre: 'مقارنة بروتينين', verbe: 'قارن', objectif: 'إثبات خصوصية التعبير المورثي', consigne: 'قارن جزءًا من تسلسل بروتينين وحدد ما يمكن استنتاجه.', preuve: 'تشابه أجزاء واختلاف أجزاء من التسلسل', reponse: 'التشابه يدل على أصل أو وظيفة مشتركة محتملة، والاختلاف قد يفسر اختلاف البنية أو الوظيفة.', erreur: 'التشابه في جزء قصير لا يثبت وحده تطابق الوظيفة.', diagramme: 'comparaison', format: 'مقارنة جزيئية', document: 'السند 9 · تسلسل بروتينين' },
  { titre: 'المعلومة والبنية والوظيفة', verbe: 'ركّب', objectif: 'إنجاز خلاصة علمية', consigne: 'أنجز خلاصة تربط بين تسلسل ADN وبنية البروتين ووظيفته.', preuve: 'تسلسل النكليوتيدات يحدد تسلسل الأحماض الأمينية ثم البنية الفراغية', reponse: 'يحدد تسلسل ADN تسلسل ARNm، وهذا يحدد ترتيب الأحماض الأمينية؛ ويحدد الترتيب البنية الفراغية التي تمنح البروتين وظيفته.', erreur: 'لا تنتقل مباشرة من ADN إلى الوظيفة دون ذكر الترجمة والبنية الفراغية.', diagramme: 'synthese', format: 'مقالة تركيبية', document: 'السند 10 · من المعلومة إلى الوظيفة' },
];

// Les 3 propositions, en rotation déterministe : la bonne réponse n'est pas toujours en 1re position.
function optionsExercice(i: number): string[] {
  const item = exercicesUnite1[i];
  const trio = [item.reponse, item.erreur, 'أنقل عنوان الوثيقة فقط دون بناء علاقة.'];
  const decalage = (i * 2 + 1) % 3;
  return [...trio.slice(decalage), ...trio.slice(0, decalage)];
}

/**
 * مخططات الوحدة 1 — SVG inline aux couleurs de l'app (forêt / or / bleu).
 * Corrections du port : 'graphique' retournait null (boîte vide au n°8 alors que le badge
 * promet « مخطط لكل تمرين ») et 'sequence' réutilisait le schéma de mutation (contenu faux).
 */
function SchemaUnite1({ type }: { type: ExerciceUnite1['diagramme'] }) {
  const common = {
    className: 'h-44 w-full',
    viewBox: '0 0 520 180',
    role: 'img' as const,
  };
  if (type === 'flux')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-u1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="#315b45" />
          </marker>
        </defs>
        <rect x="15" y="60" width="150" height="60" rx="10" fill="#eef4e8" stroke="#315b45" />
        <text x="90" y="87" textAnchor="middle" fontSize="14" fill="#315b45">ADN</text>
        <text x="90" y="107" textAnchor="middle" fontSize="11">المورثة</text>
        <path d="M165 90 H225" stroke="#315b45" strokeWidth="2" markerEnd="url(#arrow-u1)" />
        <text x="195" y="80" textAnchor="middle" fontSize="11" fill="#6b7e70">استنساخ</text>
        <rect x="230" y="60" width="150" height="60" rx="10" fill="#d9eddf" stroke="#315b45" />
        <text x="305" y="87" textAnchor="middle" fontSize="14" fill="#315b45">ARNm</text>
        <text x="305" y="107" textAnchor="middle" fontSize="11">الرسالة</text>
        <path d="M380 90 H440" stroke="#315b45" strokeWidth="2" markerEnd="url(#arrow-u1)" />
        <text x="410" y="80" textAnchor="middle" fontSize="11" fill="#6b7e70">ترجمة</text>
        <circle cx="470" cy="90" r="26" fill="#e4bc71" stroke="#315b45" />
        <text x="470" y="94" textAnchor="middle" fontSize="11">بروتين</text>
      </svg>
    );
  if (type === 'cellules')
    return (
      <svg {...common}>
        <rect x="15" y="25" width="240" height="130" rx="16" fill="#eef4e8" stroke="#315b45" />
        <text x="135" y="47" textAnchor="middle" fontSize="13" fill="#315b45">حقيقيات النوى</text>
        <circle cx="135" cy="105" r="34" fill="#d9eddf" stroke="#315b45" />
        <text x="135" y="109" textAnchor="middle" fontSize="11">نواة</text>
        <text x="135" y="168" textAnchor="middle" fontSize="11" fill="#6b7e70">استنساخ داخل النواة</text>
        <rect x="265" y="25" width="240" height="130" rx="16" fill="#f7f3e6" stroke="#d19552" />
        <text x="385" y="47" textAnchor="middle" fontSize="13" fill="#6b5320">بدائيات النوى</text>
        <ellipse cx="385" cy="100" rx="70" ry="34" fill="none" stroke="#d19552" strokeDasharray="5 4" />
        <text x="385" y="104" textAnchor="middle" fontSize="11" fill="#6b5320">حلقة ADN</text>
        <text x="385" y="168" textAnchor="middle" fontSize="11" fill="#6b7e70">استنساخ وترجمة في الهيولى</text>
      </svg>
    );
  if (type === 'arn')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-u2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="#315b45" />
          </marker>
        </defs>
        <rect x="15" y="45" width="200" height="90" rx="12" fill="#eef4e8" stroke="#315b45" />
        <text x="115" y="70" textAnchor="middle" fontSize="12" fill="#315b45">ARNm الأولي</text>
        <text x="115" y="92" textAnchor="middle" fontSize="12" fontFamily="monospace">■إنترون■إكسون■إنترون■</text>
        <text x="115" y="120" textAnchor="middle" fontSize="11" fill="#6b7e70">قبل المعالجة</text>
        <path d="M220 90 H275" stroke="#315b45" strokeWidth="2" markerEnd="url(#arrow-u2)" />
        <rect x="285" y="45" width="220" height="90" rx="12" fill="#d9eddf" stroke="#315b45" />
        <text x="395" y="70" textAnchor="middle" fontSize="12" fill="#315b45">ARNm الناضج</text>
        <text x="395" y="92" textAnchor="middle" fontSize="12" fontFamily="monospace">■إكسون■إكسون■</text>
        <text x="395" y="120" textAnchor="middle" fontSize="11" fill="#6b7e70">حذف الإنترونات وربط الإكسونات</text>
      </svg>
    );
  if (type === 'ribosome')
    return (
      <svg {...common}>
        <path d="M40 60 H480" stroke="#3475aa" strokeWidth="2" strokeDasharray="6 4" />
        <text x="60" y="48" fontSize="12" fill="#3475aa">ARNm 5’→3’</text>
        <rect x="180" y="70" width="160" height="52" rx="22" fill="#d9eddf" stroke="#315b45" />
        <text x="260" y="101" textAnchor="middle" fontSize="13" fill="#315b45">ريبوزوم</text>
        <path d="M120 130 L180 105" stroke="#d19552" strokeWidth="2" />
        <text x="60" y="146" fontSize="12" fill="#6b5320">ARNt</text>
        <circle cx="120" cy="130" r="10" fill="#f1dca9" stroke="#d19552" />
        <text x="330" y="146" fontSize="11" fill="#6b7e70">مضاد الرامزة ← رامزة على ARNm</text>
      </svg>
    );
  if (type === 'mutation' || type === 'sequence')
    return (
      <svg {...common}>
        <text x="30" y="40" fontSize="13" fill="#315b45">
          {type === 'mutation' ? 'السلسلة الأصلية' : 'سلسلة ADN المعطاة'}
        </text>
        <text x="30" y="66" fontSize="16" fontFamily="monospace">ATG · GCT · TTT · TGA</text>
        <text x="30" y="112" fontSize="13" fill="#b0653f">
          {type === 'mutation' ? 'بعد الطفرة' : 'ARNm المطلوب'}
        </text>
        <text x="30" y="138" fontSize="16" fontFamily="monospace">
          {type === 'mutation' ? 'ATG · GCT · TTC · TGA' : 'AUG · GCC · UUU · UGA'}
        </text>
        <rect x="330" y="46" width="165" height="34" rx="8" fill="#f1dca9" />
        <text x="412" y="68" textAnchor="middle" fontSize="12" fill="#6b5320">
          {type === 'mutation' ? 'رامزة واحدة تتغير' : 'U بدل T في ARNm'}
        </text>
      </svg>
    );
  if (type === 'expression')
    return (
      <svg {...common}>
        <path d="M50 150 H490" stroke="#315b45" strokeWidth="1.5" />
        <path d="M50 150 V20" stroke="#315b45" strokeWidth="1.5" />
        <text x="14" y="30" fontSize="11" fill="#315b45">كمية</text>
        <text x="460" y="172" fontSize="11" fill="#315b45">زمن</text>
        <path d="M60 145 C150 145 170 60 260 55 C340 52 380 45 480 45" stroke="#3475aa" strokeWidth="3" fill="none" />
        <path d="M60 147 C170 147 220 110 300 95 C370 82 410 75 480 72" stroke="#d19552" strokeWidth="3" fill="none" />
        <text x="330" y="40" fontSize="12" fill="#3475aa">ARNm</text>
        <text x="400" y="100" fontSize="12" fill="#6b5320">بروتين (متأخر)</text>
      </svg>
    );
  if (type === 'graphique') {
    // مسار البروتين المُفرز — schéma du n°8 (absent du commit arena : il retournait null).
    return (
      <svg {...common}>
        <rect x="12" y="24" width="376" height="132" rx="24" fill="#eef4e8" stroke="#315b45" />
        <text x="26" y="172" fontSize="12" fill="#315b45">داخل الخلية</text>
        <rect x="34" y="52" width="130" height="62" rx="12" fill="#d9eddf" stroke="#315b45" />
        <text x="99" y="76" textAnchor="middle" fontSize="11">الشبكة الهيولية</text>
        <text x="99" y="94" textAnchor="middle" fontSize="11">المحببة</text>
        <path d="M164 83 H214" stroke="#315b45" strokeWidth="2" />
        <polygon points="214,78 224,83 214,88" fill="#315b45" />
        <circle cx="262" cy="83" r="26" fill="#e4bc71" stroke="#315b45" />
        <text x="262" y="87" textAnchor="middle" fontSize="10">حويصلة</text>
        <path d="M288 83 H436" stroke="#315b45" strokeWidth="2" />
        <polygon points="436,78 446,83 436,88" fill="#315b45" />
        <text x="452" y="72" fontSize="11" fill="#315b45">خارج الخلية</text>
        <text x="30" y="140" fontSize="11" fill="#6b7e70">ببتيد الإشارة يوجّه الريبوزوم نحو الشبكة</text>
      </svg>
    );
  }
  if (type === 'comparaison')
    return (
      <svg {...common}>
        <text x="40" y="40" fontSize="13" fill="#315b45">بروتين أ</text>
        <text x="40" y="66" fontSize="15" fontFamily="monospace">—Met—Val—Glu—Leu—</text>
        <text x="40" y="118" fontSize="13" fill="#315b45">بروتين ب</text>
        <text x="40" y="144" fontSize="15" fontFamily="monospace">—Met—Val—Asp—Leu—</text>
        <rect x="330" y="60" width="165" height="60" rx="10" fill="#f1dca9" />
        <text x="412" y="86" textAnchor="middle" fontSize="12" fill="#6b5320">تشابه في جزء</text>
        <text x="412" y="106" textAnchor="middle" fontSize="12" fill="#6b5320">واختلاف في جزء</text>
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="15" y="30" width="490" height="120" rx="16" fill="#eef4e8" stroke="#315b45" />
      <text x="260" y="60" textAnchor="middle" fontSize="13" fill="#315b45">ADN ← ARNm ← ببتيد ملتف</text>
      <text x="260" y="92" textAnchor="middle" fontSize="13" fill="#3475aa">بنية فراغية</text>
      <text x="260" y="124" textAnchor="middle" fontSize="13" fill="#b0653f">وظيفة البروتين</text>
    </svg>
  );
}

export default function Methodologie({ onFermer, modeInitial = 'accueil' }: Props) {
  const [ecran, setEcran] = useState<Ecran>(modeInitial);
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [dernierFaux, setDernierFaux] = useState<number | null>(null);
  const [erreur, setErreur] = useState(false);
  const [rate, setRate] = useState(false); // échec au 1er essai sur la question en cours (persiste pendant les réessais)
  const [operation, setOperation] = useState(0);
  const [methode, setMethode] = useState(0);
  const [reponse, setReponse] = useState<number | null>(null);
  const [dernierFauxExo, setDernierFauxExo] = useState<number | null>(null);
  const [justeExo, setJusteExo] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTon, setFeedbackTon] = useState<'juste' | 'refaire'>('juste');
  // Origine du tamrin affiché : unité 1 (0-9) ou méthode classique (0-5) — les index se
  // chevauchent, d'où un état dédié (correction du bug de collision du commit arena).
  const [sourceExo, setSourceExo] = useState<'unite1' | 'chemin'>('chemin');

  function startDiagnostic(): void {
    setQ(0);
    setScore(0);
    setErreur(false);
    setRate(false);
    setDernierFaux(null);
    setSelected(null);
    setEcran('diagnostic');
  }

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
    setSourceExo('chemin');
    setEcran('exercice');
    setReponse(null);
    setFeedback('');
    setDernierFauxExo(null);
    setJusteExo(false);
  }

  function choisirExerciceUnite1(i: number): void {
    setMethode(i);
    setSourceExo('unite1');
    setEcran('exercice');
    setReponse(null);
    setFeedback('');
    setDernierFauxExo(null);
    setJusteExo(false);
  }

  function validerExercice(): void {
    if (reponse === null) return;
    if (sourceExo === 'unite1') {
      if (reponse === idxJusteU1) {
        // صواب: أخضر + نغمة صاعدة، ثم نكشف «خطأ شائع» (الاشطاح) بعد الجواب الصحيح فقط.
        sonJuste();
        setJusteExo(true);
        setFeedbackTon('juste');
        setFeedback(
          `إجابة سليمة. الدليل يطابق الفعل «${exoU1.verbe}»: ${exoU1.preuve}. الآن افحص: هل ذكرت المعطى والعلاقة والخلاصة؟`,
        );
      } else {
        // خطأ: أحمر + نغمة هادئة + إعادة المحاولة بلا كشف الجواب.
        sonFaux();
        setDernierFauxExo(reponse);
        setReponse(null);
        setFeedbackTon('refaire');
        setFeedback(REFAIRE);
      }
      return;
    }
    if (reponse === 0) {
      sonJuste();
      setJusteExo(true);
      setFeedbackTon('juste');
      setFeedback('صحيح. ابدأ بالملاحظة، ثم اربطها بالتفسير العلمي إذا طلبت التعليمة ذلك.');
    } else {
      sonFaux();
      setDernierFauxExo(reponse);
      setReponse(null);
      setFeedbackTon('refaire');
      setFeedback(REFAIRE);
    }
  }

  // Données de l'exercice unité 1 (précalculées pour l'affichage).
  const exoU1 = exercicesUnite1[methode] ?? exercicesUnite1[0];
  const optionsU1 = optionsExercice(methode);
  const idxJusteU1 = optionsU1.indexOf(exoU1.reponse);

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
        <span className="rounded-full bg-sage px-2.5 py-1 text-[11px] font-bold text-forest-deep">
          المفتاح
        </span>
      </header>

      <main className="mx-auto mt-5 max-w-3xl">
        {ecran === 'accueil' && (
          <section className="space-y-4">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-l from-forest to-forest-deep p-6 text-paper">
                <p className="text-4xl">🔑</p>
                <h2 className="font-naskh mt-3 text-2xl font-bold">فعل ← دليل ← جواب ← فحص</h2>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  لا تحفظ الإجابة. تعلّم كيف تبنيها من التعليمة والوثيقة.
                </p>
                <button
                  onClick={() => setEcran('cle')}
                  className="btn mt-5 w-full bg-paper text-forest-deep hover:bg-sage"
                >
                  شرح المفتاح خطوة بخطوة
                </button>
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow">النواة</p>
              <h2 className="font-naskh mt-1 text-xl font-bold">أربع حركات قبل أن تكتب</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {cle.map(([title, text], i) => (
                  <button
                    key={title}
                    onClick={() => setEcran('cle')}
                    className="rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"
                  >
                    <span className="flex items-center gap-2">
                      <b className="grid h-7 w-7 place-items-center rounded-full bg-forest text-xs text-paper">
                        {i + 1}
                      </b>
                      <b className="text-sm text-forest">{title}</b>
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-mute">{text}</span>
                  </button>
                ))}
              </div>
              <button onClick={startDiagnostic} className="btn btn-ghost mt-4 w-full">
                ابدأ التشخيص · 3 دقائق
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setEcran('operations')}
                className="card p-4 text-right hover:border-forest"
              >
                <p className="text-sm font-bold text-forest">أصف · أفسّر · أحكم</p>
                <p className="mt-1 text-xs text-mute">العمليات التي تبني جوابًا علميًا.</p>
              </button>
              <button
                onClick={() => setEcran('verbes')}
                className="card p-4 text-right hover:border-forest"
              >
                <p className="text-sm font-bold text-forest">أفعال التعليمة</p>
                <p className="mt-1 text-xs text-mute">افهم المطلوب قبل أن تبدأ.</p>
              </button>
            </div>

            <button onClick={() => setEcran('niveaux')} className="btn btn-gold w-full">
              مستويات التدريب الأربعة
            </button>
          </section>
        )}

        {ecran === 'cle' && (
          <section className="card p-5">
            <p className="eyebrow">المفتاح · حلقة التحكم</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">قبل أن أكتب، أعرف ماذا أُنتج</h2>
            <div className="mt-5 space-y-3">
              {cle.map(([title, text, conseil], i) => (
                <article key={title} className="rounded-2xl border border-line bg-paper p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-paper">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-bold text-forest">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm font-bold leading-relaxed">{text}</p>
                  <p className="mt-1 rounded-xl bg-sage-soft p-2 text-xs leading-relaxed text-forest-deep">
                    علامة الأمان: {conseil}
                  </p>
                </article>
              ))}
            </div>
            <button onClick={() => setEcran('operations')} className="btn btn-primary mt-5 w-full">
              التالي: العمليات الثلاث
            </button>
          </section>
        )}

        {ecran === 'operations' && (
          <section className="card p-5">
            <p className="eyebrow">المفتاح · أصف / أفسّر / أحكم</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ثلاث عمليات قابلة للدمج</h2>
            <div className="mt-4 space-y-2">
              {operations.map(([title, question, language], i) => (
                <button
                  key={title}
                  onClick={() => setOperation(i)}
                  className={`w-full rounded-2xl border p-4 text-right ${
                    operation === i ? 'border-forest bg-sage-soft' : 'border-line bg-paper'
                  }`}
                >
                  <b className="text-sm text-forest">{title}</b>
                  <p className="mt-1 text-sm font-bold">{question}</p>
                  <p className="mt-1 text-xs text-mute">لغة مفيدة: {language}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-gold-soft bg-gold-soft/50 p-4">
              <p className="text-[11px] font-bold text-[#6b5320]">مثال</p>
              <p className="mt-1 text-sm leading-relaxed">
                <b>أصف:</b> النشاط يبلغ قيمة قصوى عند 37°C. <b>أفسّر:</b> لأن البنية الفراغية
                للإنزيم تكون مناسبة. <b>أحكم:</b> إذن للإنزيم درجة حرارة مثلى.
              </p>
            </div>
            <button onClick={() => setEcran('methode')} className="btn btn-primary mt-5 w-full">
              اختيار نوع التمرين
            </button>
          </section>
        )}

        {ecran === 'verbes' && (
          <section className="card p-5">
            <p className="eyebrow">دليل قراءة التعليمة</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ماذا يطلب منك الفعل؟</h2>
            <div className="mt-4 space-y-2">
              {verbes.map(([verbe, definition, exemple]) => (
                <article key={verbe} className="rounded-2xl border border-line bg-paper p-4">
                  <h3 className="text-sm font-bold text-forest">{verbe}</h3>
                  <p className="mt-1 text-sm font-bold">{definition}</p>
                  <p className="mt-2 rounded-xl bg-sage-soft p-2 text-xs font-bold leading-relaxed text-forest-deep">
                    مثال: {exemple}
                  </p>
                </article>
              ))}
            </div>
            <button onClick={startDiagnostic} className="btn btn-primary mt-5 w-full">
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
            {erreur && <p className="mt-3 text-sm font-bold text-clay">{REFAIRE}</p>}
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
            <button onClick={() => setEcran('niveaux')} className="btn btn-primary mt-5 w-full">
              اكتشف مستويات التدريب
            </button>
            <button onClick={startDiagnostic} className="btn btn-ghost mt-3 w-full">
              إعادة التشخيص
            </button>
          </section>
        )}

        {ecran === 'methode' && (
          <section className="card p-5">
            <p className="eyebrow">مسارات المنهجية</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">اختر نوع التمرين</h2>
            <div className="mt-4 space-y-2">
              {methodes.map(([title, chain], i) => (
                <button
                  key={title}
                  onClick={() => choisirMethode(i)}
                  className="w-full rounded-2xl border border-line bg-paper p-4 text-right hover:border-forest"
                >
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs font-bold text-forest">{chain}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setEcran('accueil')} className="btn btn-ghost mt-4 w-full">
              العودة إلى البداية
            </button>
          </section>
        )}

        {ecran === 'niveaux' && (
          <section className="card p-5">
            <p className="eyebrow">التدريب المتدرج</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">أربع مستويات نحو الاستقلال</h2>
            <div className="mt-4 space-y-3">
              {niveaux.map(([number, title, text]) => (
                <button
                  key={number}
                  onClick={() => setEcran('methode')}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper p-4 text-right"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">
                    {number}
                  </span>
                  <span>
                    <b className="text-sm">{title}</b>
                    <span className="mt-1 block text-xs text-mute">{text}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-gold-soft/50 p-3 text-xs leading-relaxed text-[#6b5320]">
              لا تنتقل إلى المستوى التالي لمجرد أنك قرأت الطريقة. النجاح يعني أن تنفذها في تمرين.
            </p>
            <button
              onClick={() => setEcran('unite1')}
              className="btn btn-primary mt-4 w-full"
            >
              الوحدة 1 · تركيب البروتين · 10 تمارين
            </button>
          </section>
        )}

        {ecran === 'unite1' && (
          <section className="space-y-4">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper">
                <p className="eyebrow text-paper/70">الوحدة 1 · تدريب بالوثائق والمخططات</p>
                <h2 className="font-naskh mt-2 text-2xl font-bold">تركيب البروتين</h2>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  عشرة تمارين مستوحاة من نمط الكتاب المدرسي: اقرأ الوثيقة، اختر الدليل، ثم ابنِ
                  جوابك.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-paper/15 px-3 py-1">10 تمارين</span>
                  <span className="rounded-full bg-paper/15 px-3 py-1">مخطط لكل تمرين</span>
                  <span className="rounded-full bg-paper/15 px-3 py-1">المفتاح</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {exercicesUnite1.map((item, i) => (
                <article key={item.titre} className="card overflow-hidden">
                  <button
                    onClick={() => choisirExerciceUnite1(i)}
                    className="flex w-full items-center gap-3 p-4 text-right hover:bg-sage-soft"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-forest">
                        {item.format} · {item.verbe}
                      </span>
                      <b className="mt-1 block text-base">{item.titre}</b>
                      <span className="mt-1 block text-[11px] text-mute">{item.document}</span>
                    </span>
                    <span className="text-mute">←</span>
                  </button>
                  <div className="border-t border-line bg-paper px-3 pb-3">
                    <SchemaUnite1 type={item.diagramme} />
                  </div>
                </article>
              ))}
            </div>
            <button onClick={() => setEcran('niveaux')} className="btn btn-ghost w-full">
              العودة إلى مستويات التدريب
            </button>
          </section>
        )}

        {ecran === 'exercice' && sourceExo === 'unite1' && (
          <section className="card p-6">
            <p className="eyebrow">
              تمرين {methode + 1} / {exercicesUnite1.length} · {exoU1.format}
            </p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{exoU1.titre}</h2>
            <p className="mt-2 text-sm text-mute">
              {exoU1.document} · الهدف: {exoU1.objectif}
            </p>
            <div className="mt-4 rounded-2xl border border-line bg-paper p-2">
              <SchemaUnite1 type={exoU1.diagramme} />
            </div>
            <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">فعل</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoU1.consigne}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
              <p className="text-[11px] font-bold text-[#6b5320]">دليل · قبل أن تجيب</p>
              <p className="mt-1 text-sm leading-relaxed">استخرج من المخطط: {exoU1.preuve}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold text-forest">جواب</p>
              <p className="mt-2 text-sm leading-relaxed">
                اكتب جوابك ذهنيًا، ثم اختر ما يطابق المنهجية:
              </p>
              <div className="mt-3 grid gap-2">
                {optionsU1.map((option, i) => {
                  let style = 'border-line bg-paper';
                  if (dernierFauxExo === i) style = 'border-clay bg-clay-soft text-clay';
                  else if (justeExo && i === idxJusteU1) style = 'border-forest bg-sage text-forest-deep';
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
                      className={`rounded-2xl border p-3 text-right text-sm leading-relaxed ${style}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            {feedback && (
              <div
                className={`mt-3 rounded-2xl p-4 text-sm leading-relaxed ${
                  feedbackTon === 'juste'
                    ? 'bg-sage-soft text-forest-deep'
                    : 'bg-clay-soft text-clay'
                }`}
              >
                <b>{feedbackTon === 'juste' ? 'فحص · تصحيح تدريجي' : 'فحص'}</b>
                <p className="mt-1">{feedback}</p>
                {feedbackTon === 'juste' && (
                  <p className="mt-2 text-xs font-bold text-forest">
                    خطأ شائع: {exoU1.erreur}
                  </p>
                )}
              </div>
            )}
            {!justeExo && (
              <button
                onClick={validerExercice}
                disabled={reponse === null}
                className="btn btn-primary mt-4 w-full"
              >
                افحص جوابي
              </button>
            )}
            {!justeExo ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEcran('unite1');
                    setReponse(null);
                    setFeedback('');
                    setDernierFauxExo(null);
                    setJusteExo(false);
                  }}
                  className="btn btn-ghost"
                >
                  قائمة التمارين
                </button>
                <button
                  onClick={() => {
                    setReponse(null);
                    setFeedback('');
                    setDernierFauxExo(null);
                  }}
                  className="btn btn-ghost"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEcran('unite1');
                  setReponse(null);
                  setFeedback('');
                  setDernierFauxExo(null);
                  setJusteExo(false);
                }}
                className="btn btn-ghost mt-3 w-full"
              >
                قائمة التمارين
              </button>
            )}
          </section>
        )}

        {ecran === 'exercice' && sourceExo === 'chemin' && (
          <section className="card p-6">
            <p className="eyebrow">{methodes[methode][0]}</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">{methodes[methode][1]}</h2>
            <div className="mt-5 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">قاعدة المفتاح</p>
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

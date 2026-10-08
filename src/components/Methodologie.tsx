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
import MascotteKunz from './MascotteKunz';
import type { Qualite } from '../utils/srs';

interface Props {
  onFermer: () => void;
  /** Écran d'ouverture : accueil (onglet منهجية) ou niveaux (3e porte تمارين dans تدريبات). */
  modeInitial?: 'accueil' | 'niveaux';
  /** Bataille de كفاءة : enregistre la réussite d'un exercice dans la file SM-2 (audit). */
  onResultatKafaa?: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string }
  ) => void;
}

type Ecran = 'accueil' | 'cle' | 'operations' | 'verbes' | 'diagnostic' | 'methode' | 'niveaux' | 'unite1' | 'exercice' | 'redaction' | 'resultat';

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
  /** Zones cliquables du schéma — وثيقة تفاعلية (port commit fa88370 « preuve visuelle »). */
  zones: string[];
  /** La question de la وثيقة تفاعلية (quelle zone identifier comme preuve). */
  question: string;
  /** Les 3 propositions du جواب (la bonne est à l'index correctChoice). */
  choices: string[];
  /** Index de la bonne réponse dans choices (la rotation maison varie sa position). */
  correctChoice: number;
};

const exercicesUnite1: ExerciceUnite1[] = [
  { titre: 'من المورثة إلى البروتين', verbe: 'مثّل', objectif: 'بناء مخطط التعبير المورثي', consigne: 'مثّل مراحل انتقال المعلومة الوراثية من ADN إلى بروتين وظيفي.', preuve: 'ADN → ARNm → ريبوزوم → سلسلة ببتيدية', reponse: 'تنتقل المعلومة من ADN بالاستنساخ إلى ARNm، ثم تُترجم في الريبوزوم إلى سلسلة ببتيدية تنطوي لتصبح بروتينًا وظيفيًا.', erreur: 'الريبوزوم لا يصنع ARNm؛ إنزيم ARN polymérase هو المسؤول عن الاستنساخ.', diagramme: 'flux', format: 'مخطط تركيبي', document: 'السند 1 · مخطط التعبير المورثي', zones: ['ADN', 'ARNm', 'الريبوزوم', 'البروتين'], question: 'انقر على المنطقة التي تمثل الرسالة المنقولة من ADN إلى الريبوزوم.', choices: ['ADN', 'ARNm', 'البروتين الوظيفي'], correctChoice: 1 },
  { titre: 'مقر الاستنساخ والترجمة', verbe: 'قارن', objectif: 'التمييز بين بدائيات وحقيقيات النوى', consigne: 'قارن بين مكان الاستنساخ ومكان الترجمة عند الخليتين.', preuve: 'النواة موجودة عند حقيقيات النوى وغير موجودة عند بدائيات النوى', reponse: 'عند حقيقيات النوى يتم الاستنساخ في النواة ثم تخرج ARNm إلى الهيولى للترجمة، أما عند بدائيات النوى فتتم العمليتان في الهيولى ويمكن أن تكونا متزامنتين.', erreur: 'لا تقل إن ADN يخرج من النواة؛ الذي ينتقل هو ARNm.', diagramme: 'cellules', format: 'مقارنة خلوية', document: 'السند 2 · خليتان مجهريتان', zones: ['النواة', 'ADN في الهيولى', 'الترجمة', 'الغشاء'], question: 'اختر المنطقة التي تميز الخلية حقيقية النوى عن بدائية النوى.', choices: ['النواة', 'الغشاء', 'الترجمة'], correctChoice: 0 },
  { titre: 'نضج ARNm', verbe: 'فسّر', objectif: 'فهم معالجة الرسالة الوراثية', consigne: 'فسّر لماذا لا يغادر ARNm الأولي النواة مباشرة.', preuve: 'حذف الإنترونات وربط الإكسونات ينتج ARNm ناضجًا', reponse: 'يخضع ARNm الأولي للمعالجة؛ تحذف الإنترونات وتربط الإكسونات، فيتكون ARNm ناضج قابل للترجمة.', erreur: 'المعالجة لا تحدث في الريبوزوم، بل داخل النواة قبل خروج الرسالة.', diagramme: 'arn', format: 'تحليل وثيقة', document: 'السند 3 · معالجة ARNm', zones: ['الإكسونات', 'الإنترونات', 'ARNm الأولي', 'ARNm الناضج'], question: 'أي منطقة تُحذف أثناء نضج ARNm؟', choices: ['الإكسونات', 'الإنترونات', 'ARNm الناضج'], correctChoice: 1 },
  { titre: 'قراءة الرامزة', verbe: 'حلّل', objectif: 'ربط الرامزة بمضاد الرامزة', consigne: 'حلّل الوثيقة وبيّن كيف يضمن ARNt إضافة الحمض الأميني المناسب.', preuve: 'تكامل الرامزة مع مضاد الرامزة', reponse: 'يتثبت ARNt في الرامزة الموافقة على ARNm بواسطة التكامل، ويحمل الحمض الأميني المحدد، ثم تتشكل الرابطة الببتيدية.', erreur: 'الرامزة توجد على ARNm، أما مضاد الرامزة فعلى ARNt.', diagramme: 'ribosome', format: 'تجربة الترجمة', document: 'السند 4 · آلية الترجمة', zones: ['الرامزة', 'مضاد الرامزة', 'ARNt', 'الريبوزوم'], question: 'ما العنصر الذي يحمل الحمض الأميني إلى الريبوزوم؟', choices: ['ARNm', 'ARNt', 'ADN'], correctChoice: 1 },
  { titre: 'طفرة واستبدال حمض أميني', verbe: 'استنتج', objectif: 'ربط تغير ADN بتغير البروتين', consigne: 'استنتج أثر استبدال رامزة واحدة في تسلسل مورثة.', preuve: 'اختلاف رامزة واحدة يقابله اختلاف حمض أميني واحد', reponse: 'قد يؤدي تغير قاعدة إلى رامزة جديدة، فتتغير هوية حمض أميني، وقد تتغير بنية البروتين ووظيفته.', erreur: 'لا نحكم دائمًا بفقدان الوظيفة؛ يجب مقارنة التسلسل والوظيفة أولًا.', diagramme: 'mutation', format: 'دراسة طفرة', document: 'السند 5 · مقارنة تسلسلين', zones: ['التسلسل الأصلي', 'القاعدة المستبدلة', 'التسلسل الطافر', 'البروتين'], question: 'انقر على المنطقة التي تمثل سبب اختلاف التسلسلين.', choices: ['التسلسل الأصلي', 'القاعدة المستبدلة', 'البروتين'], correctChoice: 1 },
  { titre: 'استخراج ARNm', verbe: 'استخرج', objectif: 'تطبيق التكامل القاعدي', consigne: 'استخرج تسلسل ARNm انطلاقًا من السلسلة المستنسخة المعطاة.', preuve: 'A↔U و T↔A و C↔G و G↔C حسب السلسلة المستنسخة', reponse: 'أحدد أولًا نوع السلسلة واتجاهها، ثم أطبق التكامل القاعدي وأكتب ARNm في الاتجاه 5’→3’.', erreur: 'في ARNm نستعمل U بدل T، ولا نخلط بين السلسلة المستنسخة وغير المستنسخة.', diagramme: 'sequence', format: 'تمرين وراثي', document: 'السند 6 · جدول التكامل القاعدي', zones: ['السلسلة المستنسخة', 'ARNm', 'الرامزة', 'اتجاه 5’→3’'], question: 'ما الجزيء الذي يجب استخراجه من السلسلة المستنسخة؟', choices: ['ARNm', 'ADN جديد', 'بروتين'], correctChoice: 0 },
  { titre: 'كمية ARNm والبروتين', verbe: 'حلّل', objectif: 'فهم العلاقة الزمنية بين الرسالة والبروتين', consigne: 'حلّل تغير كمية ARNm وكمية البروتين بعد إضافة ARNm.', preuve: 'ترتفع كمية البروتين بعد ارتفاع ARNm وتتأخر عنه', reponse: 'تظهر الرسالة أولًا ثم تُقرأ في الريبوزومات؛ لذلك يتأخر ارتفاع البروتين عن ارتفاع ARNm.', erreur: 'التأخر الزمني لا يعني أن البروتين يصنع الرسالة.', diagramme: 'expression', format: 'منحنى تجريبي', document: 'السند 7 · تغير الكمية مع الزمن', zones: ['منحنى ARNm', 'منحنى البروتين', 'لحظة الإضافة', 'محور الزمن'], question: 'أي منحنى يظهر أولًا بعد إضافة ARNm؟', choices: ['منحنى ARNm', 'منحنى البروتين', 'كلاهما في الوقت نفسه'], correctChoice: 0 },
  { titre: 'تحديد مقر بروتين', verbe: 'علّل', objectif: 'ربط البنية بالوجهة', consigne: 'علّل وجود بروتين مُفرز خارج الخلية في الشبكة الهيولية المحببة.', preuve: 'وجود ببتيد إشارة والريبوزومات المرتبطة بالشبكة', reponse: 'يوجه ببتيد الإشارة الريبوزوم نحو الشبكة الهيولية المحببة، حيث يدخل البروتين مسار الإفراز ثم ينقل إلى خارج الخلية.', erreur: 'الريبوزوم الحر لا يفسر وحده إفراز البروتين.', diagramme: 'graphique', format: 'تجربة التوجيه', document: 'السند 8 · مسار بروتين مفرز', zones: ['النواة', 'الشبكة الهيولية', 'جهاز غولجي', 'خارج الخلية'], question: 'ما أول محطة توجه البروتين نحو الإفراز بعد خروجه من النواة؟', choices: ['الشبكة الهيولية المحببة', 'خارج الخلية', 'النواة'], correctChoice: 0 },
  { titre: 'مقارنة بروتينين', verbe: 'قارن', objectif: 'إثبات خصوصية التعبير المورثي', consigne: 'قارن جزءًا من تسلسل بروتينين وحدد ما يمكن استنتاجه.', preuve: 'تشابه أجزاء واختلاف أجزاء من التسلسل', reponse: 'التشابه يدل على أصل أو وظيفة مشتركة محتملة، والاختلاف قد يفسر اختلاف البنية أو الوظيفة.', erreur: 'التشابه في جزء قصير لا يثبت وحده تطابق الوظيفة.', diagramme: 'comparaison', format: 'مقارنة جزيئية', document: 'السند 9 · تسلسل بروتينين', zones: ['البروتين أ', 'موضع الاختلاف', 'البروتين ب', 'الوظيفة'], question: 'ما الدليل المباشر على اختلاف البروتينين؟', choices: ['اختلاف حمض أميني في التسلسل', 'اختلاف لون الوثيقة', 'اختلاف عنوان السند'], correctChoice: 0 },
  { titre: 'المعلومة والبنية والوظيفة', verbe: 'ركّب', objectif: 'إنجاز خلاصة علمية', consigne: 'أنجز خلاصة تربط بين تسلسل ADN وبنية البروتين ووظيفته.', preuve: 'تسلسل النكليوتيدات يحدد تسلسل الأحماض الأمينية ثم البنية الفراغية', reponse: 'يحدد تسلسل ADN تسلسل ARNm، وهذا يحدد ترتيب الأحماض الأمينية؛ ويحدد الترتيب البنية الفراغية التي تمنح البروتين وظيفته.', erreur: 'لا تنتقل مباشرة من ADN إلى الوظيفة دون ذكر الترجمة والبنية الفراغية.', diagramme: 'synthese', format: 'مقالة تركيبية', document: 'السند 10 · من المعلومة إلى الوظيفة', zones: ['تسلسل ADN', 'الأحماض الأمينية', 'البنية الفراغية', 'الوظيفة'], question: 'ما العلاقة الصحيحة بين تسلسل ADN ووظيفة البروتين؟', choices: ['ADN يحدد التسلسل ثم البنية فالوظيفة', 'البروتين يصنع ADN', 'الوظيفة لا علاقة لها بالبنية'], correctChoice: 0 },
];

// Les 3 propositions, en rotation déterministe : la bonne réponse n'est pas toujours en 1re position.
// Port du commit arena fa88370 (choices + correctChoice) : la rotation maison s'applique sur les
// 3 propositions fournies et recalcule l'index de la bonne réponse.
function optionsExercice(i: number): { options: string[]; bonne: number } {
  const item = exercicesUnite1[i];
  const decalage = (i * 2 + 1) % 3;
  const options = item.choices.map((_, k) => item.choices[(k + decalage) % 3]);
  // La bonne réponse choices[correctChoice] se retrouve à l'index (correctChoice - décalage).
  return { options, bonne: (item.correctChoice - decalage + 3) % 3 };
}

/** اختر المنطقة — étiquette A/B/C/D des zones du schéma (وثيقة تفاعلية). */
function lettreZone(i: number): string {
  return String.fromCharCode(65 + i);
}

// ───────────── محرّر الجواب — assemblage de tuiles, zéro clavier (audit) ─────────────
// La réponse modèle de chaque exercice est découpée en segments (phrases/clauses). L'élève
// remet les tuiles dans l'ordre : pour chaque emplacement il choisit la bonne continuation
// parmi 3 candidats (1 bonne tuile + 2 leurres plausibles tirés de la rubrique). Zéro champ de
// saisie, retry sans révélation, sons maison, aucune date ni pourcentage.
function segmentsReponse(texte: string): string[] {
  return texte
    .replace(/([.،؛:])\s*/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Réserve de leurres : segments des autres réponses + erreurs fréquentes de la rubrique. */
const RESERVE_TUILES: string[] = [
  ...exercicesUnite1.flatMap((e) => segmentsReponse(e.reponse)),
  ...exercicesUnite1.map((e) => e.erreur),
];

/** Candidats d'un emplacement : rotation déterministe, 1 bonne tuile + 2 leurres. */
function tuilesEmplacement(i: number, k: number): { options: string[]; bonne: number } {
  const bonne = segmentsReponse(exercicesUnite1[i].reponse)[k];
  const leurres = RESERVE_TUILES.filter((s) => s !== bonne);
  const a = leurres[(i * 7 + k * 3 + 1) % leurres.length];
  let j = (i * 7 + k * 3 + 5) % leurres.length;
  if (leurres[j] === a) j = (j + 1) % leurres.length;
  const base = [bonne, a, leurres[j]];
  const decalage = (i + k) % 3;
  const options = base.map((_, x) => base[(x + decalage) % 3]);
  return { options, bonne: (3 - decalage) % 3 };
}

/**
 * مخططات الوحدة 1 — SVG inline aux couleurs de l'app (forêt / or / bleu).
 * Schémas de la version clarifiée arena (commit 7ac24a4) avec corrections maison :
 * - 'mutation' reste en ADN (T) car l'arena présentait une séquence à U comme « السلسلة الأصلية » ;
 * - les markers fléchés ont un id dédié par schéma (arrow-u1/arrow-seq/arrow-gq/arrow-synth) —
 *   sur arena, 'sequence' et 'graphique' pointaient vers un marker défini dans un autre SVG
 *   (flèche invisible quand le schéma s'affiche seul).
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
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="24" textAnchor="middle" fontSize="16" fontWeight="700" fill="#315b45">
          تعبير المعلومة الوراثية
        </text>
        {['ADN', 'ARNm', 'سلسلة ببتيدية', 'بروتين وظيفي'].map((t, i) => (
          <g key={t}>
            <rect
              x={18 + i * 128}
              y="70"
              width="104"
              height="42"
              rx="14"
              fill={i === 3 ? '#d8ead7' : '#eef4e8'}
              stroke="#315b45"
            />
            <text x={70 + i * 128} y="96" textAnchor="middle" fontSize="14" fill="#244634">
              {t}
            </text>
            {i < 3 && (
              <line
                x1={124 + i * 128}
                y1="91"
                x2={142 + i * 128}
                y2="91"
                stroke="#315b45"
                strokeWidth="2"
                markerEnd="url(#arrow-u1)"
              />
            )}
          </g>
        ))}
        <text x="135" y="137" textAnchor="middle" fontSize="11" fill="#6b7e70">استنساخ</text>
        <text x="265" y="137" textAnchor="middle" fontSize="11" fill="#6b7e70">ترجمة</text>
        <text x="395" y="137" textAnchor="middle" fontSize="11" fill="#6b7e70">انطواء</text>
      </svg>
    );
  if (type === 'cellules')
    return (
      <svg {...common}>
        <rect x="15" y="28" width="230" height="120" rx="22" fill="#d9eddf" stroke="#315b45" />
        <circle cx="130" cy="88" r="34" fill="#f8f4e9" stroke="#315b45" strokeWidth="2" />
        <text x="130" y="93" textAnchor="middle" fontSize="12">النواة</text>
        <text x="130" y="168" textAnchor="middle" fontSize="13" fill="#315b45">حقيقية النوى</text>
        <rect x="275" y="28" width="230" height="120" rx="22" fill="#f3ead5" stroke="#315b45" />
        <path d="M315 83 Q350 55 385 83 T455 83" fill="none" stroke="#315b45" strokeWidth="3" />
        <text x="390" y="120" textAnchor="middle" fontSize="12">ADN في الهيولى</text>
        <text x="390" y="168" textAnchor="middle" fontSize="13" fill="#315b45">بدائية النوى</text>
      </svg>
    );
  if (type === 'arn')
    return (
      <svg {...common}>
        <path d="M35 55 H485" stroke="#315b45" strokeWidth="8" />
        <text x="260" y="43" textAnchor="middle" fontSize="13">إكسون</text>
        <path d="M35 105 H485" stroke="#d19552" strokeWidth="8" />
        <text x="260" y="95" textAnchor="middle" fontSize="13">إنترون يُحذف</text>
        <path d="M35 145 H180 M235 145 H485" stroke="#315b45" strokeWidth="8" />
        <text x="260" y="172" textAnchor="middle" fontSize="13" fill="#315b45">
          ARNm ناضج = إكسونات مرتبطة
        </text>
      </svg>
    );
  if (type === 'ribosome')
    return (
      <svg {...common}>
        <path d="M55 120 H465" stroke="#315b45" strokeWidth="5" />
        <ellipse cx="260" cy="80" rx="90" ry="45" fill="#d9eddf" stroke="#315b45" strokeWidth="2" />
        <circle cx="195" cy="45" r="15" fill="#e4bc71" />
        <circle cx="260" cy="35" r="15" fill="#e4bc71" />
        <circle cx="325" cy="45" r="15" fill="#e4bc71" />
        <text x="260" y="86" textAnchor="middle" fontSize="15">الريبوزوم</text>
        <text x="260" y="150" textAnchor="middle" fontSize="13" fill="#315b45">
          ARNm · رامزة · ARNt · أحماض أمينية
        </text>
      </svg>
    );
  if (type === 'mutation')
    return (
      <svg {...common}>
        <text x="35" y="38" fontSize="14" fill="#315b45">السلسلة الأصلية</text>
        <text x="35" y="67" fontSize="18" fontFamily="monospace">ATG · TTT · GGC · TAA</text>
        <text x="35" y="105" fontSize="14" fill="#315b45">بعد الطفرة</text>
        <text x="35" y="134" fontSize="18" fontFamily="monospace" fill="#a45d43">
          ATG · TTA · GGC · TAA
        </text>
        <line x1="128" y1="73" x2="128" y2="111" stroke="#d19552" strokeWidth="3" />
        <text x="155" y="95" fontSize="13" fill="#6b7e70">استبدال قاعدة</text>
      </svg>
    );
  if (type === 'sequence')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-seq" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="24" textAnchor="middle" fontSize="15" fontWeight="700" fill="#315b45">
          استخراج ARNm بالتكامل القاعدي
        </text>
        <text x="40" y="62" fontSize="14" fill="#315b45">ADN المستنسخة 3’</text>
        <text x="185" y="62" fontSize="18" fontFamily="monospace">TAC · GGA · CTT</text>
        <text x="40" y="108" fontSize="14" fill="#315b45">ARNm 5’</text>
        <text x="185" y="108" fontSize="18" fontFamily="monospace" fill="#3475aa">
          AUG · CCU · GAA
        </text>
        <path d="M185 72 L185 95" stroke="#d19552" strokeWidth="3" markerEnd="url(#arrow-seq)" />
        <text x="260" y="145" textAnchor="middle" fontSize="13" fill="#6b7e70">
          A↔U · T↔A · C↔G · G↔C
        </text>
      </svg>
    );
  if (type === 'expression')
    return (
      <svg {...common}>
        <line x1="45" y1="145" x2="480" y2="145" stroke="#315b45" />
        <line x1="45" y1="25" x2="45" y2="145" stroke="#315b45" />
        <path d="M50 130 Q130 95 220 105 T470 52" fill="none" stroke="#3475aa" strokeWidth="4" />
        <path d="M50 135 Q150 132 230 126 T470 82" fill="none" stroke="#b36b55" strokeWidth="4" />
        <text x="400" y="45" fontSize="13" fill="#3475aa">ARNm</text>
        <text x="400" y="78" fontSize="13" fill="#b36b55">بروتين</text>
        <text x="260" y="170" textAnchor="middle" fontSize="12">الزمن (دقائق)</text>
        <text x="20" y="40" fontSize="11" fill="#6b7e70">الكمية</text>
      </svg>
    );
  if (type === 'graphique')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-gq" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="20" textAnchor="middle" fontSize="15" fontWeight="700" fill="#315b45">
          مسار إفراز البروتين
        </text>
        <ellipse cx="100" cy="88" rx="68" ry="48" fill="#eef4e8" stroke="#315b45" strokeWidth="2" />
        <text x="100" y="93" textAnchor="middle" fontSize="13">النواة</text>
        <path d="M170 88 H235" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-gq)" />
        <path
          d="M240 55 Q285 35 330 55 M240 82 Q285 62 330 82 M240 109 Q285 89 330 109"
          fill="none"
          stroke="#a45d43"
          strokeWidth="5"
        />
        <text x="285" y="140" textAnchor="middle" fontSize="12">شبكة هيولية محببة</text>
        <path d="M340 82 H425" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-gq)" />
        <path d="M435 54 Q475 82 435 110 Q410 82 435 54" fill="#d8ead7" stroke="#315b45" strokeWidth="2" />
        <text x="470" y="143" textAnchor="middle" fontSize="12">خارج الخلية</text>
      </svg>
    );
  if (type === 'comparaison')
    return (
      <svg {...common}>
        <text x="35" y="35" fontSize="14" fill="#315b45">بروتين أ</text>
        <text x="35" y="63" fontSize="18" fontFamily="monospace">Ala · Gly · Lys · Val · Ser</text>
        <text x="35" y="105" fontSize="14" fill="#315b45">بروتين ب</text>
        <text x="35" y="133" fontSize="18" fontFamily="monospace">Ala · Gly · Arg · Val · Ser</text>
        <rect x="190" y="42" width="45" height="30" rx="5" fill="#f1dca9" />
        <rect x="190" y="112" width="45" height="30" rx="5" fill="#f1dca9" />
        <text x="300" y="93" fontSize="13" fill="#6b7e70">موضع الاختلاف</text>
      </svg>
    );
  if (type === 'synthese')
    return (
      <svg {...common}>
        <defs>
          <marker id="arrow-synth" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#315b45" />
          </marker>
        </defs>
        <text x="260" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill="#315b45">
          العلاقة بين البنية والوظيفة
        </text>
        <path d="M50 70 H470" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-synth)" />
        <path d="M50 125 H470" stroke="#315b45" strokeWidth="3" markerEnd="url(#arrow-synth)" />
        <circle cx="95" cy="70" r="22" fill="#e9d59d" />
        <circle cx="205" cy="70" r="22" fill="#e9d59d" />
        <circle cx="315" cy="70" r="22" fill="#e9d59d" />
        <circle cx="425" cy="70" r="22" fill="#e9d59d" />
        <text x="260" y="76" textAnchor="middle" fontSize="13">تسلسل الأحماض الأمينية</text>
        <path
          d="M85 125 Q120 92 155 125 T225 125 T295 125 T365 125 T435 125"
          fill="none"
          stroke="#a45d43"
          strokeWidth="5"
        />
        <text x="260" y="115" textAnchor="middle" fontSize="13">بنية فراغية</text>
        <text x="260" y="161" textAnchor="middle" fontSize="13" fill="#315b45">وظيفة البروتين</text>
      </svg>
    );
  return null;
}

export default function Methodologie({
  onFermer,
  modeInitial = 'accueil',
  onResultatKafaa,
}: Props) {
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
  // وثيقة تفاعلية : la zone du schéma choisie comme preuve (port fa88370 — null = pas encore choisie).
  const [zoneActive, setZoneActive] = useState<number | null>(null);
  const [dernierFauxExo, setDernierFauxExo] = useState<number | null>(null);
  const [justeExo, setJusteExo] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTon, setFeedbackTon] = useState<'juste' | 'refaire'>('juste');
  // Origine du tamrin affiché : unité 1 (0-9) ou méthode classique (0-5) — les index se
  // chevauchent, d'où un état dédié (correction du bug de collision du commit arena).
  const [sourceExo, setSourceExo] = useState<'unite1' | 'chemin'>('chemin');
  // محرّر الجواب (audit) : assemblage des tuiles de la réponse modèle, sans clavier.
  const [slotRedaction, setSlotRedaction] = useState(0);
  const [tuilesChoisies, setTuilesChoisies] = useState<string[]>([]);
  const [tuileFausse, setTuileFausse] = useState<number | null>(null);
  const [redactionFin, setRedactionFin] = useState(false);

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
    setZoneActive(null); // jamais la zone de l'exercice précédent (fix maison du port).
    setFeedback('');
    setDernierFauxExo(null);
    setJusteExo(false);
  }

  // ───────────── محرّر الجواب — assemblage de tuiles ─────────────

  function ouvrirRedaction(): void {
    setSlotRedaction(0);
    setTuilesChoisies([]);
    setTuileFausse(null);
    setRedactionFin(false);
    setEcran('redaction');
  }

  function choisirTuile(idx: number): void {
    const segments = segmentsReponse(exoU1.reponse);
    const attendu = segments[slotRedaction];
    if (attendu === undefined) return;
    const { options } = tuilesEmplacement(methode, slotRedaction);
    if (options[idx] === attendu) {
      // Bonne tuile : verte + son montant, puis emplacement suivant (sf si dernier).
      sonJuste();
      setTuilesChoisies([...tuilesChoisies, attendu]);
      setTuileFausse(null);
      if (slotRedaction + 1 >= segments.length) setRedactionFin(true);
      else setSlotRedaction(slotRedaction + 1);
    } else {
      // Mauvaise tuile : rouge + son doux, sans révéler la bonne (retry).
      sonFaux();
      setTuileFausse(idx);
    }
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
        // بطاقة الكفاءة (audit) : réussite directe → J+3، réussite après erreur → J+1 (même SM-2).
        onResultatKafaa?.(`methodo${methode}`, rate ? 3 : 5, {
          verbe: exoU1.verbe,
          exercice: exoU1.titre,
          erreur: exoU1.erreur,
        });
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
  const { options: optionsU1, bonne: idxJusteU1 } = optionsExercice(methode);
  const segmentsU1 = segmentsReponse(exoU1.reponse);

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
            <MascotteKunz message="مرحبًا أيها المستكشف! لا تبحث عن الجواب مباشرة؛ ابحث أولًا عن الدليل الذي يفتح لك كنز الوثيقة." />
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
            <MascotteKunz
              compact
              tone="gold"
              message="كل تمرين جزيرة جديدة. اقرأ التعليمة، حدّد الفعل، ثم اجمع الأدلة قبل أن تبني جوابك."
            />
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
            <MascotteKunz
              compact
              tone="gold"
              message="قبل أن تكتب: ما هو الفعل؟ أين الدليل؟ وهل جوابك يجيب عن السؤال نفسه؟"
            />
            <div className="mt-4 rounded-2xl border border-line bg-paper p-2">
              <SchemaUnite1 type={exoU1.diagramme} />
            </div>
            <div className="mt-3 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">وثيقة تفاعلية · اختر المنطقة</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoU1.question}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {exoU1.zones.map((zone, i) => (
                  <button
                    key={zone}
                    onClick={() => setZoneActive(i)}
                    className={`rounded-xl border p-2 text-xs font-bold transition ${
                      zoneActive === i
                        ? 'border-forest bg-forest text-paper'
                        : 'border-line bg-paper text-forest-deep'
                    }`}
                  >
                    {lettreZone(i)} · {zone}
                  </button>
                ))}
              </div>
              {zoneActive !== null && (
                <p className="mt-3 rounded-xl bg-paper p-2 text-xs font-bold text-forest">
                  الدليل المحدد: المنطقة {lettreZone(zoneActive)} · {exoU1.zones[zoneActive]}
                </p>
              )}
            </div>
            <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">فعل</p>
              <p className="mt-1 text-sm font-bold leading-relaxed">{exoU1.consigne}</p>
            </div>
            {zoneActive === null ? (
              <div className="mt-3 rounded-2xl border border-gold-soft bg-gold-soft/40 p-4">
                <p className="text-[11px] font-bold text-[#6b5320]">دليل · قبل أن تجيب</p>
                <p className="mt-1 text-sm leading-relaxed">
                  استخرج الدليل بنفسك: انقر أعلاه على المنطقة التي تمثّل المعطى النافع في المخطط،
                  ثم اكتب جوابك.
                </p>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-sage bg-sage-soft p-4">
                <p className="text-[11px] font-bold text-forest">دليل · قارن اختيارك بالمرجع</p>
                <p className="mt-1 text-sm leading-relaxed">{exoU1.preuve}</p>
              </div>
            )}
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
                disabled={reponse === null || zoneActive === null}
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
              <div className="mt-3 space-y-2">
                <button onClick={ouvrirRedaction} className="btn btn-primary w-full">
                  ابنِ جوابك الكامل · بطاقات ←
                </button>
                <button
                  onClick={() => {
                    setEcran('unite1');
                    setReponse(null);
                    setFeedback('');
                    setDernierFauxExo(null);
                    setJusteExo(false);
                  }}
                  className="btn btn-ghost w-full"
                >
                  قائمة التمارين
                </button>
              </div>
            )}
          </section>
        )}

        {ecran === 'redaction' && (
          <section className="card p-6">
            <p className="eyebrow">
              {exoU1.format} · {exoU1.verbe}
            </p>
            <h2 className="font-naskh mt-2 text-2xl font-bold">ابنِ جوابك · بطاقات</h2>
            <p className="mt-2 text-sm text-mute">
              {exoU1.document} · رتّب البطاقات لِتُكوّن جوابًا علميًا كاملًا، دون كتابة ولا لوحة
              مفاتيح.
            </p>
            <div className="mt-4 rounded-2xl border border-line bg-paper p-2">
              <SchemaUnite1 type={exoU1.diagramme} />
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
              <p className="text-[11px] font-bold text-forest">
                البطاقة {slotRedaction + 1} من {segmentsU1.length}
              </p>
              <div className="mt-3 space-y-2 text-sm leading-relaxed">
                {segmentsU1.map((_, i) => {
                  if (i < tuilesChoisies.length) {
                    return (
                      <p key={i} className="rounded-xl bg-sage-soft p-2 text-forest-deep">
                        {tuilesChoisies[i]}
                      </p>
                    );
                  }
                  if (i === slotRedaction && !redactionFin) {
                    return (
                      <p
                        key={i}
                        className="rounded-xl border border-dashed border-forest p-2 font-bold text-forest"
                      >
                        ▸ اختر البطاقة المناسبة أدناه
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="rounded-xl border border-dashed border-line p-2 text-mute">
                      …
                    </p>
                  );
                })}
              </div>
            </div>

            {!redactionFin && (
              <div className="mt-3 grid gap-2">
                {tuilesEmplacement(methode, slotRedaction).options.map((opt, idx) => (
                  <button
                    key={opt}
                    onClick={() => choisirTuile(idx)}
                    className={`rounded-2xl border p-3 text-right text-sm leading-relaxed ${
                      tuileFausse === idx
                        ? 'border-clay bg-clay-soft text-clay'
                        : 'border-line bg-paper'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                {tuileFausse !== null && (
                  <p className="rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">
                    ليست البطاقة المناسبة — أعد النظر في تسلسل الجواب. خذ وقتك، لا عجلة.
                  </p>
                )}
              </div>
            )}

            {redactionFin && (
              <div className="mt-4 rounded-2xl border border-sage bg-sage-soft p-4">
                <p className="text-[11px] font-bold text-forest">جوابك المُركّب</p>
                <p className="mt-2 text-sm leading-relaxed">{tuilesChoisies.join(' ')}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-forest">
                  <span className="rounded-full bg-paper px-3 py-1">✓ سند</span>
                  <span className="rounded-full bg-paper px-3 py-1">✓ تحليل</span>
                  <span className="rounded-full bg-paper px-3 py-1">✓ ربط</span>
                  <span className="rounded-full bg-paper px-3 py-1">✓ استنتاج</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-forest-deep">
                  خطأ شائع: {exoU1.erreur}
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSlotRedaction(0);
                  setTuilesChoisies([]);
                  setTuileFausse(null);
                  setRedactionFin(false);
                }}
                className="btn btn-ghost"
              >
                إعادة البناء
              </button>
              <button onClick={() => setEcran('unite1')} className="btn btn-ghost">
                قائمة التمارين
              </button>
            </div>
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

// نموذج البيانات العام — معماريّة OPUS 5.5 MAX مُطبّقة
// الحالة كلها في المتصفح (localStorage). لا خادم.

export type StatutLecon = 'vierge' | 'en_cours' | 'terminee';

export interface Domaine {
  id: string;
  titre: string;
  accent: string; // 'forest' | 'gold' | 'clay'
  unites: string[];
}

export interface Fenetre {
  debut: number; // أسبوع في السنة الدراسية (1 = منتصف سبتمبر)
  fin: number;
}

export interface Unite {
  id: string; // 'u1' ... 'u11'
  domaineId: string;
  numero: number;
  titre: string;
  competence: string;
  page: number;
  lessonIds: string[];
  prerequis?: string[];
  // ── إضافات معماريّة OPUS ──
  questionAr: string; // سؤال الوحدة (يُجاب عنه في الجسر)
  fenetre: Fenetre; // التدرّج السنوي الرسمي
  fenetreAr: string; // نص نافذة الوحدة
  poidsBac: number; // 1..5 — ثقل الوحدة في البكالوريا
  piegesAr: string[]; // فخّان رسميان للوحدة
}

// تقدّم تلميذ في درس واحد + معاملات التكرار المتباعد SM-2
export interface ProgressionLecon {
  statut: StatutLecon;
  phases: number[]; // المراحل المُنجزة (1..6)
  minutes: number;
  derniereSession?: string;
  repetitions: number;
  intervalle: number;
  facilite: number;
  prochaineRevision?: string;
  lue?: boolean;
  fragile?: boolean; // دعم/خطأ مرّتين → مراجعة غدًا
  reponses?: Record<number, string>; // إجابات التلميذ المكتوبة (إعادة القراءة)
  diagnostic?: string; // تشخيص الثغرة في المرحلة 6
  note?: number; // آخر تقييم ذاتي 0..10
}

// بطاقة كفاءة المنهجية — مراجعة قصيرة programmée par la même SM-2 des leçons.
// Clé dans etat.kafaa : `methodo{index}` (index du تمرين في exercicesUnite1).
export interface CarteKafaa {
  verbe: string; // الإجراء (فكّك، استنتج، استخرج…)
  exercice: string; // عنوان التمرين
  erreur: string; // الفخّ (خطأ شائع) — à réécarter à chaque revue
  repetitions: number;
  intervalle: number;
  facilite: number;
  prochaineRevision?: string;
  fragile?: boolean;
}

// مربّط الوحدة (جسر) — كتابة تركيبية من الذاكرة
export interface JalonUnite {
  fait: boolean;
  synthese?: string;
  ts?: string;
}

export type KindNote = 'note' | 'question';

export interface NoteCarnet {
  id: string;
  kind: KindNote;
  texte: string;
  lessonId?: string;
  uniteId?: string;
  ts: string; // ISO
}

// خطأ ذرّي في تمرين منهجية — يُسجَّل آليًا لحظة وقوعه ثم يُصدَّر (v0.8 « carnet des failles »).
// Il complète la boucle mémoire kafaa par une trace consultable : « j'ai choisi X, pourquoi c'est
// fautif » — sans jamais y inscrire la bonne réponse (anti-stress : pas de révélation hors exercice).
export interface FauteCarnet {
  id: string;
  ts: string; // ISO
  contexte: string; // « تشخيص » « استقصاء · وثيقتان · مرحلة 3 » « محرّر · بطاقات » …
  enonce: string; // السؤال أو الموضع المطلوب
  donne: string; // جواب التلميذ الخاطئ (اختياره)
  diagnostic: string; // التشخيص المصنّف الذي عُرض لحظة الخطأ
}

// حساب التلميذ — يُحفظ في المتصفح فقط (لا خادم، لا تتبّع).
// motDePasse = نص مجزّأ بـ SHA-256 مع ملح «kunz» — لا يُخزَّن نصًّا صريحًا.
export interface Compte {
  email: string;
  motDePasse: string;
  wilaya: string; // رمز الولاية '01' .. '58'
  daira: string;
  creeLe: string; // ISO
}

export interface Etat {
  version: number;
  compte?: Compte;
  progression: Record<string, ProgressionLecon>;
  jalons: Record<string, JalonUnite>;
  notes: NoteCarnet[];
  carnet?: FauteCarnet[]; // سجلّ الأخطاء الذرّية (v0.8) — exportable
  journal: string[]; // أيام النشاط (ISO) — لإيقاع 5/7
  minutesTotales: number;
  revisions: number;
  nom: string;
  dateBac?: string; // ISO
  seancesJour?: string; // تاريخ آخر حصّة جديدة
  seancesComptees: number; // عدد الحصص الجديدة في seancesJour
  bonusJour?: string; // تاريخ استعمال الحصّة الإضافية
  drills?: Record<string, true>; // عناصر التدريبات المُجاب عنها correctly (المعرّف → true)
  ateliers?: Record<string, { fait: boolean; ts: string }>;
  kafaa?: Record<string, CarteKafaa>; // بطاقات كفاءة المنهجية (مفتاح: methodo{index})
  kafaaHebdo?: { debut: string; n: number }; // مراجعات الكفاءة هذا الأسبوع (الأحد → samedi): ≤ 2
  consentementSync?: boolean; // موافقة التلميذ على إرسال ملخّص تقدّمه للمطوّر (انظر utils/sync.ts)
}

export function progressionVierge(): ProgressionLecon {
  return {
    statut: 'vierge',
    phases: [],
    minutes: 0,
    repetitions: 0,
    intervalle: 0,
    facilite: 2.5,
  };
}

export function etatVierge(): Etat {
  return {
    version: 2,
    progression: {},
    jalons: {},
    notes: [],
    carnet: [],
    journal: [],
    minutesTotales: 0,
    revisions: 0,
    nom: 'تلميذ',
    dateBac: '2027-06-10',
    seancesComptees: 0,
    ateliers: {},
    consentementSync: true,
  };
}

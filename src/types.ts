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
  journal: string[]; // أيام النشاط (ISO) — لإيقاع 5/7
  minutesTotales: number;
  revisions: number;
  nom: string;
  dateBac?: string; // ISO
  copies?: number; // نسخ البكالوريا المنجزة (rubrique البكالوريا)
  seancesJour?: string; // تاريخ آخر حصّة جديدة
  seancesComptees: number; // عدد الحصص الجديدة في seancesJour
  bonusJour?: string; // تاريخ استعمال الحصّة الإضافية
  drills?: Record<string, true>; // عناصر التدريبات المُجاب عنها correctly (المعرّف → true)
  ateliers?: Record<string, { fait: boolean; ts: string }>;
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
    journal: [],
    minutesTotales: 0,
    revisions: 0,
    nom: 'تلميذ',
    dateBac: '2027-06-10',
    copies: 0,
    seancesComptees: 0,
    ateliers: {},
    consentementSync: true,
  };
}

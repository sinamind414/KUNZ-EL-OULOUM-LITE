// أرقام وتواريخ بالعربية — بدون عدّ تنازلي ولا نسب مئوية (قاعدة OPUS المضادة للقلق)

const UNITE = [
  'صفر',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
];
const ACHADA = [
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];
const ASHAR = [
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
];
const MIAT = [
  'مئة',
  'مئتان',
  'ثلاثمئة',
  'أربعمئة',
  'خمسمئة',
  'ستمئة',
  'سبعمئة',
  'ثمانمئة',
  'تسعمئة',
];

/** عدد من 0 إلى 999 بالحروف */
export function enArabe(n: number): string {
  if (n < 0) return String(n);
  if (n < 11) return UNITE[n];
  if (n < 20) return ACHADA[n - 11];
  if (n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    return u ? `${UNITE[u]} و${ASHAR[d - 2]}` : ASHAR[d - 2];
  }
  if (n < 1000) {
    const c = Math.floor(n / 100);
    const r = n % 100;
    return r ? `${MIAT[c - 1]} و${enArabe(r)}` : MIAT[c - 1];
  }
  return String(n);
}

// بعد «من» (تمييز): الأعداد تكون مجرورة — تسعة وستين لا تسعة وستون
const MAJROUR: [string, string][] = [
  ['عشرون', 'عشرين'],
  ['ثلاثون', 'ثلاثين'],
  ['أربعون', 'أربعين'],
  ['خمسون', 'خمسين'],
  ['ستون', 'ستين'],
  ['سبعون', 'سبعين'],
  ['ثمانون', 'ثمانين'],
  ['تسعون', 'تسعين'],
  ['مئتان', 'مئتين'],
];

export function enArabeMin(n: number): string {
  let s = enArabe(n);
  for (const [a, b] of MAJROUR) s = s.replace(a, b);
  return s;
}

export function minutesEnArabe(n: number): string {
  if (n === 0) return 'صفر دقيقة';
  if (n === 1) return 'دقيقة واحدة';
  if (n === 2) return 'دقيقتان';
  if (n < 11) return `${enArabe(n)} دقائق`;
  return `${enArabe(n)} دقيقة`;
}

// عدّ الدروس مع اتفاق العدد والمعدود: درس واحد / درجان / 3 دروس / 11 درسًا
export function compteLecons(n: number): string {
  if (n === 0) return 'صفر دروس';
  if (n === 1) return 'درس واحد';
  if (n === 2) return 'درجان';
  if (n < 11) return `${enArabe(n)} دروس`;
  return `${enArabe(n)} درسًا`;
}

// عدّ الدروس مع صفة متّبعة (اتفاق): درس واحد مستحقّ / درجان مستحقّان / 3 دروس مستحقّة / 11 درسًا مستحقًّا
export function compteLeconsAdj(
  n: number,
  un: string,
  deux: string,
  pl: string,
  acc: string
): string {
  if (n === 0) return `صفر دروس ${pl}`;
  if (n === 1) return `درس واحد ${un}`;
  if (n === 2) return `درجان ${deux}`;
  if (n < 11) return `${enArabe(n)} دروس ${pl}`;
  return `${enArabe(n)} درسًا ${acc}`;
}

const MOIS_AR = [
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان',
  'جويلية',
  'أوت',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const JOURS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** «الثلاثاء 5 أكتوبر 2026» */
export function formatJourAr(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  return `${JOURS_AR[d.getDay()]} ${d.getDate()} ${MOIS_AR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatCourteAr(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MOIS_AR[d.getMonth()]}`;
}

export function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function ajouterJours(iso: string, jours: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + jours);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function differenceJours(depuis: string, jusquA: string): number {
  const a = new Date(depuis + 'T12:00:00');
  const b = new Date(jusquA + 'T12:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function salue(): string {
  const h = new Date().getHours();
  return h >= 4 && h < 12 ? 'صباح الخير' : h >= 12 && h < 18 ? 'مساء الخير' : 'مساء الخير';
}

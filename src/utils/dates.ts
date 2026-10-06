// أرقام لاتينية (1, 2, 3…) في كل التطبيق — بلا نسب مئوية ولا عدّ تنازلي
// (قاعدة OPUS المضادة للقلق تبقى: لا نسبة، لا مؤقّت، لا خسارة سلسلة).

/** رقم بالأرقام اللاتينية: 42 */
export function nb(n: number): string {
  return String(n);
}

/** بعد «من» (تمييز) — مع الأرقام اللاتينية لا يتغيّر شكل الرقم */
export const nbMin = nb;

/** أرقام كبيرة (XP…) بالأرقام اللاتينية */
export const nbGrand = nb;

/** أيام متتالية: 1 يوم / 2 يوم / 5 أيام / 12 يومًا — بلا عرض لخسارة السلسلة */
export function joursNb(n: number): string {
  if (n <= 0) return 'ابدأ اليوم';
  if (n < 3) return `${n} يوم`;
  if (n < 11) return `${n} أيام`;
  return `${n} يومًا`;
}

/** دقائق: 0 دقيقة / 2 دقيقة / 4 دقائق / 12 دقيقة */
export function minutesNb(n: number): string {
  if (n < 3) return `${n} دقيقة`;
  if (n < 11) return `${n} دقائق`;
  return `${n} دقيقة`;
}

// عدّ الدروس مع اتفاق العدد والمعدود: 1 درس / 2 درس / 4 دروس / 11 درسًا
export function compteLecons(n: number): string {
  if (n < 1) return `${n} دروس`;
  if (n < 3) return `${n} درس`;
  if (n < 11) return `${n} دروس`;
  return `${n} درسًا`;
}

// عدّ الدروس مع صفة متّبعة (اتفاق): 1 درس مستحقّ / 2 درس مستحقّان / 4 دروس مستحقّة
export function compteLeconsAdj(
  n: number,
  un: string,
  deux: string,
  pl: string,
  acc: string
): string {
  if (n < 1) return `${n} دروس ${pl}`;
  if (n === 1) return `1 درس ${un}`;
  if (n === 2) return `2 درس ${deux}`;
  if (n < 11) return `${n} دروس ${pl}`;
  return `${n} درسًا ${acc}`;
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

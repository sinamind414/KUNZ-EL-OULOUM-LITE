// استيراد بنك التدريبات → ملفات بيانات TS (تحميل كسول لكل مجال)
//   قراءة MD → تنظيف النصوص → تحويل التعريفات إلى QCM ب4 خيارات → كتابة src/data/drills/*.ts
//   + توليد تقرير للمراجعة (scripts/drills-rapport.md)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SOURCE = process.argv[2] ?? 'C:/Users/zakaria/Desktop/drills_svt_arabe_500_QCM_120_definitions_programme_joint.md';
const SORTIE = 'src/data/drills';
const RAPPORT = 'scripts/drills-rapport.md';

// ───────────── 1. القراءة والتحليل ─────────────

const lignes = readFileSync(SOURCE, 'utf8').split(/\r?\n/);
const qcms = [];
const defs = [];
let section = null;
let axe = null;
let courant = null;

for (const l of lignes) {
  if (l.startsWith('# أسئلة الاختيار')) { section = 'qcm'; continue; }
  if (l.startsWith('# التعريفات')) { section = 'def'; continue; }
  if (l.startsWith('## ')) { continue; }
  if (l.startsWith('### ')) { axe = l.slice(4).trim(); continue; }
  if (!section) continue;

  let m = l.match(/^\*\*س(\d+)\.\s*(.*)\*\*\s*(?:\[([^\]]*)\])?\s*$/);
  if (m && section === 'qcm') {
    courant = { kind: 'qcm', n: +m[1], question: m[2].trim(), niveau: (m[3] ?? '').trim(), axe, options: [], reponse: null, explication: null };
    qcms.push(courant);
    continue;
  }
  m = l.match(/^\*\*ت(\d+)\.\s*(.*)$/);
  if (m && section === 'def') {
    const t = m[2].match(/النوع\s*([أبج])/);
    courant = { kind: 'def', n: +m[1], entete: m[2].replace(/\*\*$/, '').trim(), type: t ? t[1] : '?', axe, options: [], reponse: null, texte: null };
    defs.push(courant);
    continue;
  }
  if (!courant) continue;
  m = l.match(/^([أ-ي])\)\s*(.+)$/);
  if (m) { courant.options.push({ lettre: m[1], texte: m[2].trim() }); continue; }
  m = l.match(/^✅\s*\*\*الإجابة:\s*(.+?)\*\*/);
  if (m) { courant.reponse = m[1].trim(); continue; }
  m = l.match(/^💡\s*\*\*التفسير:\*\*\s*(.*)$/);
  if (m) { courant.explication = m[1].trim(); continue; }
}

// المحاور بالترتيب كما وردت في قسم QCM — مع معرّفات العناصر لاحتساب التقدّم دون تحميل البنك
const axes = [];
const indexAxe = new Map();
for (const q of qcms) {
  if (!indexAxe.has(q.axe)) {
    indexAxe.set(q.axe, axes.length);
    axes.push({
      titre: q.axe,
      u: Number(q.axe.match(/^(\d+)\./)?.[1] ?? 0),
      qcm: 0,
      defs: 0,
      ids: [],
    });
  }
  q.a = indexAxe.get(q.axe);
  axes[q.a].qcm++;
  axes[q.a].ids.push(`q${String(q.n).padStart(3, '0')}`);
}
for (const d of defs) {
  d.a = indexAxe.get(d.axe);
  if (d.a !== undefined) {
    axes[d.a].defs++;
    axes[d.a].ids.push(`d${String(d.n).padStart(3, '0')}`);
  }
}

// ───────────── 2. تنظيف نصوص الأسئلة (إزالة ذكر المحور) ─────────────

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALT_AXES = axes.map((x) => escRe(x.titre)).join('|');

function nettoyerQuestion(q) {
  let s = q.replace(/\*\*/g, '').trim();
  // صيغ ثابتة لا تحمل اسم المحور
  s = s.replace(/^في سؤال بكالوريا قصير (?:حول\s*)?/, '');
  // اسم المحور قد يحوي «:» و«،» — نحذفه بطوله أولًا ثم نرجع للقاعدة العامة
  s = s.replace(new RegExp(`^أمامك وثيقة (?:حول\\s*)?(?:${ALT_AXES})\\s*:\\s*`), '');
  s = s.replace(new RegExp(`^أمامك معطيات (?:حول\\s*)?(?:${ALT_AXES})\\s*:\\s*`), '');
  s = s.replace(/^أمامك وثيقة (?:حول\s*)?[^:]*:\s*/, '');
  s = s.replace(/^أمامك معطيات (?:حول\s*)?[^:]*:\s*/, '');
  // صيغ تتطلّب إعادة صياغة (يبقى المعنى ويُحذف اسم المحور)
  s = s.replace(
    new RegExp(`^إذا طُلب تفسير «([^»]+)» (?:ضمن|في)\\s*(?:${ALT_AXES})\\s*[،,:]?\\s*فأي جواب هو الأدق؟`),
    'ما الجواب الأدق في تفسير «$1»؟'
  );
  s = s.replace(
    new RegExp(`^اختر العبارة العلمية الصحيحة بخصوص «([^»]+)» (?:ضمن|في)\\s*(?:${ALT_AXES})\\s*\\.?`),
    'اختر العبارة العلمية الصحيحة بخصوص «$1».'
  );
  s = s.replace(
    new RegExp(`^اختر العبارة العلمية الصحيحة بخصوص «([^»]+)» (?:ضمن|في)\\s*(?:${ALT_AXES})\\s*[،,]\\s*`),
    'اختر العبارة العلمية الصحيحة بخصوص «$1»: '
  );
  // حذف ذكر المحور في أي موضع
  s = s.replace(new RegExp(`^(?:في محور|ضمن|عند مراجعة|حول|في)\\s*(?:${ALT_AXES})\\s*[،,:]?\\s*`), '');
  s = s.replace(new RegExp(`^(?:${ALT_AXES})\\s*[،,:]?\\s*`), '');
  s = s.replace(new RegExp(`\\s*(?:ضمن|حول|في محور|لدى مراجعة|في)\\s*(?:${ALT_AXES})\\s*[،,:.]?`, 'g'), '');
  s = s
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([،.!؟:])/g, '$1')
    .replace(/^[،,:]\s*/, '')
    .trim();
  return s;
}

function explicationPropre(e) {
  if (!e) return '';
  return e.replace(/^(\S+)\s*يرتبط هنا بـ:\s*/, '$1: ').replace(/\*\*/g, '').trim();
}

const NIVEAUX = { 'سهل': 1, 'متوسط': 2, 'صعب': 3 };

// ───────────── 3. بنوك المشتتات للتعريفات ─────────────

function sansDoublon(liste) {
  return [...new Set(liste.map((s) => s.trim()).filter(Boolean))];
}

// تقارب الطول يقلّل «الخيار الشاذ»
function choisirParLongueur(candidats, exemple, n, alea) {
  const tri = [...candidats].sort((a, b) => {
    const da = Math.abs(a.length - exemple.length);
    const db = Math.abs(b.length - exemple.length);
    return da - db || alea(a) - alea(b);
  });
  return tri.slice(0, n);
}

const alea = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// بنوك المشتتات: المصطلحات (النوع أ) · التكملات (النوع ج) · جمل الإجابات الصحيحة (QCM)
const nbUnite = (axe) => Number(axe?.match(/^(\d+)\./)?.[1] ?? 0);
const DOMAINES_U = { 1: [1, 2, 3, 4, 5], 2: [6, 7, 8], 3: [9, 10, 11] };
const domaineDe = (u) => Number(Object.keys(DOMAINES_U).find((d) => DOMAINES_U[d].includes(u)) ?? 1);

const banque = { termes: [], completions: [], qcm: [] };
for (const d of defs) {
  const texte =
    d.type === 'ب'
      ? d.options.find((o) => o.lettre === d.reponse)?.texte ?? ''
      : (d.reponse ?? '').trim();
  if (!texte) continue;
  const e = { texte, u: nbUnite(d.axe), a: d.a };
  if (d.type === 'أ') banque.termes.push(e);
  else if (d.type === 'ج') banque.completions.push(e);
}
for (const q of qcms) {
  banque.qcm.push({
    texte: q.options.find((o) => o.lettre === q.reponse)?.texte ?? '',
    u: axes[q.a]?.u ?? 0,
    a: q.a,
  });
  // المصطلحات المذكورة داخل نص السؤال نفسها — بنك إضافي مناسب لأسئلة «ما المصطلح؟»
  for (const m of nettoyerQuestion(q.question).matchAll(/مصطلح «([^»]+)»/g)) {
    banque.termes.push({ texte: m[1], u: axes[q.a]?.u ?? 0, a: q.a });
  }
}

const deLa = (nom, pred) => banque[nom].filter(pred).map((e) => e.texte);

// تقارب الطول يقلّل «الخيار الشاذ» — ملء تدريجي حسب أولوية المجموعات
function remplir(groupes, exemple, n) {
  const sorties = [];
  for (const groupe of groupes) {
    const pool = exclure(groupe, exemple).filter((c) => !sorties.includes(c));
    for (const c of choisirParLongueur(pool, exemple, n - sorties.length, alea)) {
      if (!sorties.includes(c)) sorties.push(c);
    }
    if (sorties.length >= n) break;
  }
  return sorties;
}

// تشابه كبير = خياران يبدوان كإجابة واحدة → يُستبعد أحدهما
function ressemblance(a, b) {
  const ta = new Set(a.split(/\s+/));
  const tb = new Set(b.split(/\s+/));
  const commun = [...ta].filter((t) => tb.has(t)).length;
  return commun / Math.max(ta.size, tb.size);
}

function exclure(candidats, bonne) {
  const b = bonne.trim();
  return sansDoublon(candidats).filter(
    (c) => c.trim() !== b && !c.includes(b) && !b.includes(c) && ressemblance(c, b) < 0.65
  );
}

// ───────────── 4. توليد عناصر التدريب ─────────────

const items = [];

for (const q of qcms) {
  const bonneTexte = q.options.find((o) => o.lettre === q.reponse)?.texte ?? '';
  // الواجهة تفترض أن الصحيح أولًا (نفس عقد بنك أسئلة الدروس) — نُعيد الترتيب هنا
  const autres = q.options.filter((o) => o.lettre !== q.reponse).map((o) => o.texte);
  items.push({
    id: `q${String(q.n).padStart(3, '0')}`,
    u: axes[q.a].u,
    a: q.a,
    n: NIVEAUX[q.niveau.replace(/[^\S\n]/g, '')] ?? 2,
    q: nettoyerQuestion(q.question),
    o: [bonneTexte, ...autres],
    e: explicationPropre(q.explication),
  });
}

// ───────────── 4b. استبدال المشتتات الخارجة عن الموضوع ─────────────

const HORS_SUJET = /لا علاقة له|لا علاقة لها|ولا علاقة|مرحلة جيولوجية عميقة|ظاهرة مناعية نوعية فقط/;
let remplaces = 0;
for (const item of items) {
  if (!item.id.startsWith('q')) continue;
  for (let i = 1; i < item.o.length; i++) {
    if (!HORS_SUJET.test(item.o[i])) continue;
    const pool = exclure(
      deLa('qcm', (r) => r.a === item.a),
      item.o[0]
    );
    const candidat = choisirParLongueur(pool, item.o[i], 3, alea).find((c) => !item.o.includes(c));
    if (candidat) {
      item.o[i] = candidat;
      remplaces++;
    }
  }
}

// ───────────── 4c. تفادي الخيارات المكرّرة أو المتقاربة جدًا ─────────────

let dedoublonnes = 0;
for (const item of items) {
  if (!item.id.startsWith('q')) continue;
  const vus = [item.o[0].trim()];
  for (let i = 1; i < item.o.length; i++) {
    const c = item.o[i].trim();
    const doublon = vus.some((v) => v === c || ressemblance(v, c) >= 0.65);
    if (!doublon) {
      vus.push(c);
      continue;
    }
    const pool = exclure(deLa('qcm', (r) => r.a === item.a), item.o[0]).filter(
      (x) => item.o.every((o) => ressemblance(o, x) < 0.65)
    );
    const candidat = choisirParLongueur(pool, item.o[i], 1, alea)[0];
    if (candidat) {
      item.o[i] = candidat;
      vus.push(candidat);
      dedoublonnes++;
    }
  }
}

const defsGenerees = [];
let manquants = 0;
for (const d of defs) {
  const u = Number(d.axe?.match(/^(\d+)\./)?.[1] ?? 0);
  const brut = d.entete
    .replace(/^ت\d+\.\s*/, '')
    .replace(/^\(النوع [أبج][^)]*\)\s*/, '')
    .replace(/^التعريف:\s*/, '')
    .replace(/^\(النوع [أبج][^)]*\)\s*المصطلح/, 'المصطلح')
    .trim();
  let question;
  let bonne;

  if (d.type === 'أ') {
    // النص المحصور بين أول « وآخر » يُعطي التعريف نفسه (يتخلّص من ** وعلامات الاقتباس)
    const sansEtiquette = brut.replace(/^التعريف:\s*/, '');
    const i1 = sansEtiquette.indexOf('«');
    const i2 = sansEtiquette.lastIndexOf('»');
    const contenu = (i1 !== -1 && i2 > i1 ? sansEtiquette.slice(i1 + 1, i2) : sansEtiquette).replace(/\.$/, '').trim();
    question = `أي مصطلح في البرنامج يُعرَّف بـ: «${contenu}»؟`;
    bonne = d.reponse;
  } else if (d.type === 'ج') {
    question = brut.replace(/\*\*/g, '').replace(/^\s*أكمل:\s*/, 'أكمل: ').trim();
    bonne = d.reponse;
  } else {
    question = brut.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    bonne = d.options.find((o) => o.lettre === d.reponse)?.texte ?? d.reponse;
  }

  const memeAxe = (nom) => (d.a === undefined ? [] : deLa(nom, (e) => e.a === d.a));
  const memeUnite = (nom) => deLa(nom, (e) => e.u === u);
  const memeDomaine = (nom) => deLa(nom, (e) => domaineDe(e.u) === domaineDe(u));
  let distracteurs;
  if (d.type === 'ب') {
    // النوع ب: الخيارات جُمل مقارَنة — من إجابات QCM الصحيحة في نفس المحور
    distracteurs = remplir([memeAxe('qcm'), memeUnite('qcm'), memeUnite('completions'), memeDomaine('qcm')], bonne, 3);
  } else if (d.type === 'أ') {
    // النوع أ: الخيارات مصطلحات — من تعريفات الوحدة ثم من نصوص أسئلة الاختيار
    distracteurs = remplir([memeAxe('termes'), memeUnite('termes'), memeUnite('completions'), memeDomaine('termes')], bonne, 3);
  } else {
    // النوع ج: الخيارات تكملات — من تكملات الوحدة ثم مصطلحاتها
    distracteurs = remplir([memeAxe('completions'), memeUnite('completions'), memeUnite('termes'), memeDomaine('completions')], bonne, 3);
  }
  if (distracteurs.length < 3) manquants++;

  const options = [bonne, ...distracteurs.slice(0, 3)];
  items.push({
    id: `d${String(d.n).padStart(3, '0')}`,
    u,
    a: d.a,
    n: 1,
    q: question,
    o: options,
    e: '',
    def: true,
  });
  defsGenerees.push({ id: `d${d.n}`, u, axe: d.axe, type: d.type, question, options, r: 0, complet: distracteurs.length === 3 });
}

// ───────────── 5. الكتابة ─────────────

mkdirSync(SORTIE, { recursive: true });

const TYPES = `// بنك التدريبات — مولّد من البرنامج الوطني (scripts/importer-drills.mjs)
// لا تُعدَّل يدويًا: كل سؤال يُجاب عنه بالاختيار فقط، بدون أي كتابة.

export interface ItemDrill {
  /** معرّف ثابت: q001..q500 (سؤال) · d001..d120 (تعريف محوّل) */
  id: string;
  /** رقم الوحدة 1..11 */
  u: number;
  /** فهرس المحور الصغير 0..48 */
  a: number;
  /** المستوى 1 سهل · 2 متوسط · 3 صعب */
  n: 1 | 2 | 3;
  /** نص السؤال */
  q: string;
  /** أربعة خيارات — الصحيح دائمًا في o[0] (الواجهة تخلط العرض) */
  o: string[];
  /** تفسير يظهر بعد الإجابة الصحيحة */
  e: string;
  /** عناصر التعريفات المحوّلة */
  def?: boolean;
}
`;

writeFileSync(`${SORTIE}/types.ts`, TYPES);

const AXES_TS = `// المحاور الصغيرة للبرنامج — 49 محورًا موزّعة على 11 وحدة (مولّد)
export interface AxeDrill {
  /** فهرس ثابت 0..48 */
  id: number;
  /** رقم الوحدة 1..11 */
  u: number;
  titre: string;
  qcm: number;
  defs: number;
  /** معرّفات العناصر التابعة — تُستعمل لاحتساب التقدّم دون تحميل البنك */
  ids: string[];
}

export const AXES: AxeDrill[] = [
${axes.map((x, i) => `  { id: ${i}, u: ${x.u}, titre: ${JSON.stringify(x.titre)}, qcm: ${x.qcm}, defs: ${x.defs}, ids: [${x.ids.map((id) => `'${id}'`).join(', ')}] },`).join('\n')}
];

export const TOTAL_QCM = ${qcms.length};
export const TOTAL_DEFS = ${defs.length};
export const TOTAL_ITEMS = ${items.length};
`;
writeFileSync(`${SORTIE}/axes.ts`, AXES_TS);

const GROUPES = { 1: [1, 2, 3, 4, 5], 2: [6, 7, 8], 3: [9, 10, 11] };
for (const [d, unites] of Object.entries(GROUPES)) {
  const liste = items.filter((i) => unites.includes(i.u));
  const corps = liste
    .map(
      (i) =>
        `  { id: '${i.id}', u: ${i.u}, a: ${i.a}, n: ${i.n}, q: ${JSON.stringify(i.q)}, o: [${i.o
          .map((x) => JSON.stringify(x))
          .join(', ')}], e: ${JSON.stringify(i.e)}${i.def ? ', def: true' : ''} },`
    )
    .join('\n');
  const fichier = `// بنك التدريبات — المجال ${d} (مولّد من البرنامج الوطني)
import type { ItemDrill } from './types';

export const ITEMS: ItemDrill[] = [
${corps}
];
`;
  writeFileSync(`${SORTIE}/domaine${d}.ts`, fichier);
}

// ───────────── 6. التقرير ─────────────

const douteuses = items.filter((i) => /\d+\.\d+ —|في محور|أمامك وثيقة|ضمن الوحدة|س\d+\./.test(i.q) || i.o.length !== 4);
const doublons = items.filter((i) => new Set(i.o.map((x) => x.trim())).size !== 4).length;
const squelettes = {};
for (const i of items) {
  const k = i.q.split(/\s+/).slice(0, 4).join(' ');
  squelettes[k] = (squelettes[k] ?? 0) + 1;
}

const rapport = `# تقرير استيراد بنك التدريبات

- أسئلة اختيار: **${qcms.length}** · تعريفات محوّلة: **${defs.length}** · المجموع: **${items.length}**
- محاور: **${axes.length}** · وحدات: 11
- عناصر ذات نص داعش (تحتاج مراجعة): **${douteuses.length}**
- مشتتات خارجة عن الموضوع تم استبدالها: **${remplaces}**
- تعريفات بخيار رابع ناقص: **${manquants}**
- عناصر بخيارات مكرّرة: **${doublons}**
- خيارات QCM مكرّرة تم تبديلها: **${dedoublonnes}**

## العناصر الداعشة
${douteuses.map((i) => `- ${i.id} [U${i.u}] ${i.q}`).join('\n')}

## أكثر الصيغ تكرارًا (بعد التنظيف)
${Object.entries(squelettes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .map(([k, v]) => `- ${v} × ${k}`)
  .join('\n')}

## مراجعة التعريفات المحوّلة (120)
${defsGenerees
  .map(
    (d) =>
      `### ${d.id} — U${d.u} — ${d.axe} (النوع ${d.type})${d.complet ? '' : ' ⚠️ ناقص مشتت'}\n**${d.question}**\n${d.options
        .map((o, i) => `${i === d.r ? '✅ ' : '- '}${o}`)
        .join('\n')}`
  )
  .join('\n\n')}
`;
writeFileSync(RAPPORT, rapport);

console.log(`QCM: ${qcms.length} · تعريفات: ${defs.length} · محاور: ${axes.length}`);
console.log(`نصوص داعشة: ${douteuses.length} · ملفات: ${SORTIE}/types.ts, axes.ts, domaine1-3.ts`);
console.log(`تقرير: ${RAPPORT}`);

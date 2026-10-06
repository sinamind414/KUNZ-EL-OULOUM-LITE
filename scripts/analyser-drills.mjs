// تحليل ملف التدريبات (500 QCM + 120 تعريف) — فحص البنية والأخطاء قبل الاستيراد
import { readFileSync } from 'node:fs';

const FICHIER = process.argv[2] ?? 'C:/Users/zakaria/Desktop/drills_svt_arabe_500_QCM_120_definitions_programme_joint.md';
const lignes = readFileSync(FICHIER, 'utf8').split(/\r?\n/);

const ARABES = /[٠-٩۰-۹]/g;
const qcms = [];
const defs = [];
let section = null; // 'qcm' | 'def'
let unite = null;
let axe = null;
let courant = null;

const LETTRES = ['أ', 'ب', 'ج', 'د'];

for (const l of lignes) {
  if (l.startsWith('# أسئلة الاختيار')) { section = 'qcm'; continue; }
  if (l.startsWith('# التعريفات')) { section = 'def'; continue; }
  if (l.startsWith('## ')) { if (section === 'qcm') unite = l.slice(3).trim(); else if (section === 'def') unite = l.slice(3).trim(); continue; }
  if (l.startsWith('### ')) { axe = l.slice(4).trim(); continue; }

  let m = l.match(/^\*\*س(\d+)\.\s*(.*)\*\*\s*(?:\[([^\]]*)\])?\s*$/);
  if (m && section === 'qcm') {
    courant = { kind: 'qcm', n: Number(m[1]), question: m[2].trim(), niveau: (m[3] ?? '').trim(), unite, axe, options: [], reponse: null, explication: null, erreurs: [] };
    qcms.push(courant);
    continue;
  }
  m = l.match(/^\*\*ت(\d+)\.\s*(.*)$/);
  if (m && section === 'def') {
    courant = { kind: 'def', n: Number(m[1]), entete: m[2].trim(), unite, axe, options: [], reponse: null, explication: null, type: null, texte: null, erreurs: [] };
    const t = m[2].match(/النوع\s*([أبج])/);
    courant.type = t ? t[1] : '?';
    defs.push(courant);
    continue;
  }
  if (!courant) continue;

  m = l.match(/^([أ-ي])\)\s*(.+)$/);
  if (m && courant.options.length < 5) {
    courant.options.push({ lettre: m[1], texte: m[2].trim() });
    continue;
  }
  m = l.match(/^✅\s*\*\*الإجابة:\s*(.+?)\*\*/);
  if (m) { courant.reponse = m[1].trim(); continue; }
  m = l.match(/^💡\s*\*\*التفسير:\*\*\s*(.*)$/);
  if (m) { courant.explication = m[1].trim(); continue; }
  m = l.match(/^\*\*ت(\d+)\.\s*\(النوع\s*([أبج])[^)]*\)\s*(.*)$/);
  if (m) { /* déjà traité */ }
}

function scanner(nom, liste) {
  const problemes = { sansReponse: [], mauvaisNombreOptions: [], reponseHorsOptions: [], lettresDoubles: [], chiffresArabes: [], axesInconnus: [] };
  for (const q of liste) {
    if (!q.reponse) problemes.sansReponse.push(q.n);
    const attendu = q.kind === 'qcm' ? 4 : q.kind === 'def' && q.type === 'ب' ? 3 : 0;
    if (attendu && q.options.length !== attendu) problemes.mauvaisNombreOptions.push(`${q.n}(${q.options.length})`);
    if (q.reponse && q.options.length && !q.options.some((o) => o.lettre === q.reponse)) problemes.reponseHorsOptions.push(q.n);
    const lettres = q.options.map((o) => o.lettre);
    if (new Set(lettres).size !== lettres.length) problemes.lettresDoubles.push(q.n);
    const texte = [q.question, q.entete, q.texte, q.explication, ...q.options.map((o) => o.texte)].filter(Boolean).join(' ');
    if (ARABES.test(texte)) { ARABES.lastIndex = 0; problemes.chiffresArabes.push(q.n); }
    ARABES.lastIndex = 0;
    if (!q.axe) problemes.axesInconnus.push(q.n);
  }
  console.log(`\n=== ${nom} : ${liste.length} entrées ===`);
  console.log('sans réponse        :', problemes.sansReponse.length, problemes.sansReponse.slice(0, 10).join(','));
  console.log('nb options erroné   :', problemes.mauvaisNombreOptions.length, problemes.mauvaisNombreOptions.slice(0, 10).join(','));
  console.log('réponse hors options:', problemes.reponseHorsOptions.length, problemes.reponseHorsOptions.slice(0, 10).join(','));
  console.log('lettres doubles     :', problemes.lettresDoubles.length, problemes.lettresDoubles.slice(0, 10).join(','));
  console.log('chiffres arabes     :', problemes.chiffresArabes.length, problemes.chiffresArabes.slice(0, 10).join(','));
  console.log('sans axe            :', problemes.axesInconnus.length);
  return problemes;
}

scanner('QCM', qcms);
scanner('Définitions', defs);

// توزيع حسب الوحدة
const parUnite = {};
for (const q of qcms) {
  const u = (q.unite ?? '').match(/^U(\d+)/)?.[1] ?? '?';
  parUnite[u] = parUnite[u] ?? { qcm: 0, def: 0 };
  parUnite[u].qcm++;
}
for (const d of defs) {
  const u = (d.unite ?? '').match(/^U(\d+)/)?.[1] ?? '?';
  parUnite[u] = parUnite[u] ?? { qcm: 0, def: 0 };
  parUnite[u].def++;
}
console.log('\n=== التوزيع حسب الوحدة ===');
for (const u of Object.keys(parUnite).sort()) console.log(`U${u}: ${parUnite[u].qcm} QCM · ${parUnite[u].def} تعريف`);

// المحاور
const axesQ = new Set(qcms.map((q) => q.axe).filter(Boolean));
const axesD = new Set(defs.map((d) => d.axe).filter(Boolean));
console.log('\nمحاور QCM:', axesQ.size, '· محاور التعريفات:', axesD.size);
const niveaux = {};
for (const q of qcms) niveaux[q.niveau || '(بدون)'] = (niveaux[q.niveau || '(بدون)'] ?? 0) + 1;
console.log('المستويات:', JSON.stringify(niveaux, null, 0));

// أنواع التعريفات
const types = {};
for (const d of defs) types[d.type] = (types[d.type] ?? 0) + 1;
console.log('أنواع التعريفات:', JSON.stringify(types));

// أكبر المستويات: QCM لكل محور
const parAxe = {};
for (const q of qcms) parAxe[q.axe] = (parAxe[q.axe] ?? 0) + 1;
console.log('\nأقل/أكثر محاور QCM:');
const tri = Object.entries(parAxe).sort((a, b) => a[1] - b[1]);
console.log(' أقل:', tri.slice(0, 3).map(([k, v]) => `${k}=${v}`).join(' | '));
console.log(' أكثر:', tri.slice(-3).map(([k, v]) => `${k}=${v}`).join(' | '));

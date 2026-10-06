// ضبط بنك التدريبات المولّد: بنية، خيارات، تكرار، نصوص فارغة
import { readFileSync } from 'node:fs';

const fichiers = ['domaine1', 'domaine2', 'domaine3'];
const items = [];
const problemesLignes = [];
for (const f of fichiers) {
  const src = readFileSync(`src/data/drills/${f}.ts`, 'utf8');
  // extraction ligne à ligne (chaque item tient sur une ligne)
  for (const ligne of src.split('\n')) {
    const m = ligne.match(/^\s*\{ id: '([^']+)', u: (\d+), a: (\d+), n: (\d), q: (".*?"), o: \[(.*)\], e: (".*?")(, def: true)? \},$/);
    if (!m) {
      if (ligne.includes('{ id:')) problemesLignes.push(`${f}: non parsé → ${ligne.slice(0, 220)}`);
      continue;
    }
    const options = [...m[6].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => JSON.parse(`"${x[1]}"`));
    items.push({
      id: m[1],
      u: +m[2],
      a: +m[3],
      n: +m[4],
      q: JSON.parse(m[5]),
      o: options,
      e: JSON.parse(m[7]),
      def: Boolean(m[8]),
    });
  }
}

const problemes = [];
const ids = new Set();

function ressemblance(a, b) {
  const ta = new Set(a.split(/\s+/));
  const tb = new Set(b.split(/\s+/));
  const commun = [...ta].filter((t) => tb.has(t)).length;
  return commun / Math.max(ta.size, tb.size);
}
for (const i of items) {
  if (ids.has(i.id)) problemes.push(`${i.id}: معرّف مكرر`);
  ids.add(i.id);
  if (i.o.length !== 4) problemes.push(`${i.id}: ${i.o.length} خيارات`);
  if (new Set(i.o).size !== 4) problemes.push(`${i.id}: خيارات مكرّرة`);
  if (!i.q.trim()) problemes.push(`${i.id}: سؤال فارغ`);
  if (i.o.some((o) => !o.trim())) problemes.push(`${i.id}: خيار فارغ`);
  if (!i.def && !i.e.trim()) problemes.push(`${i.id}: بلا تفسير`);
  if (i.def && i.e.trim()) problemes.push(`${i.id}: تعريف يحمل تفسيرًا`);
  if (/\d+\.\d+ —|في محور|أمامك وثيقة|\*\*/.test(i.q)) problemes.push(`${i.id}: بقايا قالب: ${i.q}`);
  if (/[٠-٩]/.test(i.q) || i.o.some((o) => /[٠-٩]/.test(o))) problemes.push(`${i.id}: رقم هندي`);
  for (let x = 0; x < i.o.length; x++) {
    for (let y = x + 1; y < i.o.length; y++) {
      if (ressemblance(i.o[x], i.o[y]) >= 0.65) problemes.push(`${i.id}: خيارات متقاربة: ${i.o[x]} / ${i.o[y]}`);
    }
  }
}

const squelettes = {};
for (const i of items) {
  const k = i.q.split(/\s+/).slice(0, 5).join(' ');
  squelettes[k] = (squelettes[k] ?? 0) + 1;
}

console.log(`عناصر: ${items.length} · تعريفات: ${items.filter((i) => i.def).length} · مشاكل: ${problemes.length}`);
for (const p of problemesLignes) console.log('- ' + p);
for (const p of problemes.slice(0, 40)) console.log('- ' + p);
console.log('\nأكثر الصيغ (5 كلمات):');
for (const [k, v] of Object.entries(squelettes).sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  console.log(`${v} × ${k}`);
}

// Extrait le SVG d'une leçon et le recolore au thème olive/cream de l'app.
// Usage: node scripts/recolorer-svg.mjs <fichierHtml> <ligneDebut> <ligneFin>
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fichier = process.argv[2];
const debut = parseInt(process.argv[3], 10);
const fin = parseInt(process.argv[4], 10);

const lignes = readFileSync(fichier, 'utf8').split('\n');
// les numéros de ligne sont 1-based
let svg = lignes.slice(debut - 1, fin).join('\n');

// ── Mapping palette sombre (ProFigureEngine) → palette olive/cream ──
const palette = [
  // fonds et encadrés
  ['#0c1322', '#fbf8f1'],          // fond du schéma → paper
  ['#1e1b4b', '#ebf2ed'],          // bandeau badge → sage-soft
  ['#032b44', '#d7e6dc'],          // fond label REG → sage
  ['#2e1065', '#f3e6c4'],          // fond label golgi → gold-soft
  ['#1e293b', '#e4d9c5'],          // fond vésicules / membrane → line
  ['#334155', '#d7e6dc'],          // vésicules → sage
  ['#0f172a', '#f3eee4'],          // gradient membrane/nucleus → cream
  ['#1e3a5f', '#d7e6dc'],          // gradient noyau → sage
  // texte
  ['#f8fafc', '#1c1914'],          // titre → ink
  ['#cbd5e1', '#3f3a32'],          // labels → ink-soft
  ['#94a3b8', '#6b6458'],          // sous-titres → mute
  ['#bfdbfe', '#143d2e'],          // label noyau → forest-deep
  ['#7dd3fc', '#1f5c45'],          // label REG → forest
  ['#e9d5ff', '#6b5320'],          // label golgi → gold foncé
  ['#e0e7ff', '#143d2e'],          // texte badge → forest-deep
  ['#a5b4fc', '#6b6458'],          // sous-texte badge → mute
  ['#64748b', '#6b6458'],          // traits vésicules → mute
  // contours et traits (bleu/cyan → forest)
  ['#38bdf8', '#1f5c45'],
  ['#0284c7', '#1f5c45'],
  ['#60a5fa', '#1f5c45'],
  ['#3b82f6', '#2d7a5e'],
  ['#1d4ed8', '#1f5c45'],
  // violet (golgi) → gold
  ['#c084fc', '#9a7a2c'],
  ['#a855f7', '#9a7a2c'],
  // indigo badge → forest
  ['#6366f1', '#1f5c45'],
];

for (const [de, vers] of palette) {
  svg = svg.split(de).join(vers);
}

// Le badge "100% الإشعاع" garde le rouge d'alerte, mais sur fond clair on l'assombrit
svg = svg.split('#ef4444').join('#b91c1c');

// Ajustement des classes internes au SVG (définies en <style> interne)
svg = svg
  .replace(/\.pfe-title\s*\{([^}]*)fill:\s*#[0-9a-fA-F]{3,6}/, '.pfe-title {$1fill: #1c1914')
  .replace(/\.pfe-label\s*\{([^}]*)fill:\s*#[0-9a-fA-F]{3,6}/, '.pfe-label {$1fill: #3f3a32')
  .replace(/\.pfe-sub\s*\{([^}]*)fill:\s*#[0-9a-fA-F]{3,6}/, '.pfe-sub {$1fill: #6b6458');

const sortie = join(__dirname, '..', 'svg_recolore.svg');
writeFileSync(sortie, svg, 'utf8');
console.log('SVG recoloré écrit :', sortie, `(${svg.length} caractères)`);

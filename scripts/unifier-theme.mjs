import { readdir, readFile, writeFile } from 'node:fs/promises';

// Palette unique de l'application : olive, crème, sauge, or et argile.
// Les cours HTML sont affichés dans des iframes : ils portent donc eux-mêmes
// la palette au lieu de dépendre du CSS React parent.
const palette = [
  '#1c1914', '#3f3a32', '#6b6458', '#a79c8a',
  '#143d2e', '#1f5c45', '#d7e6dc', '#ebf2ed',
  '#fbf8f1', '#f3eee4', '#e4d9c5',
  '#9a7a2c', '#f3e6c4', '#6b5320',
  '#8a5a3c', '#6b3926', '#f0e2d6',
].map(hexToRgb);

function hexToRgb(hex) {
  const value = hex.slice(1);
  return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16));
}
function distance(a, b) {
  return Math.sqrt(a.reduce((sum, value, i) => sum + (value - b[i]) ** 2, 0));
}
function nearest(hex) {
  const rgb = hexToRgb(hex);
  return palette.reduce((best, candidate) => distance(rgb, candidate) < distance(rgb, best) ? candidate : best, palette[0]);
}
const targets = new Map(palette.map((rgb) => [`#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`, true]));

const files = (await readdir('public/lecons')).filter((name) => name.endsWith('.html'));
for (const name of files) {
  const path = `public/lecons/${name}`;
  let text = await readFile(path, 'utf8');
  text = text.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => {
    const normalized = hex.toLowerCase();
    return targets.has(normalized) ? normalized : nearest(normalized);
  });
  // Neutralise the few remaining blue/red translucent shadows while preserving opacity.
  text = text
    .replaceAll('rgba(6, 12, 9, .95)', 'rgba(20, 61, 46, .95)')
    .replace(/rgba\(\s*37\s*,\s*99\s*,\s*235\s*,/g, 'rgba(31, 92, 69,')
    .replace(/rgba\(\s*59\s*,\s*130\s*,\s*246\s*,/g, 'rgba(31, 92, 69,')
    .replace(/rgba\(\s*22\s*,\s*163\s*,\s*74\s*,/g, 'rgba(31, 92, 69,')
    .replace(/rgba\(\s*251\s*,\s*191\s*,\s*36\s*,/g, 'rgba(154, 122, 44,');
  await writeFile(path, text);
}
console.log(`Palette unifiée dans ${files.length} fichiers HTML.`);

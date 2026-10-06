// تحميل بنك التدريبات — ثلاثة أجزاء تُحمّل عند الطلب فقط (لا شيء يُحمّل دفعة واحدة).
// كل جزء يغطي مجالًا من البرنامج؛ `ITEMS` تصفّ البنك نفسه (صحيح دائمًا في o[0]).

import type { ItemDrill } from '../data/drills/types';

export type NumeroDomaine = 1 | 2 | 3;

const PARTIES: Record<NumeroDomaine, () => Promise<{ ITEMS: ItemDrill[] }>> = {
  1: () => import('../data/drills/domaine1'),
  2: () => import('../data/drills/domaine2'),
  3: () => import('../data/drills/domaine3'),
};

const cache: Partial<Record<NumeroDomaine, Promise<ItemDrill[]>>> = {};

export function chargerDomaine(n: NumeroDomaine): Promise<ItemDrill[]> {
  if (!cache[n]) cache[n] = PARTIES[n]().then((m) => m.ITEMS);
  return cache[n] as Promise<ItemDrill[]>;
}

// المجال الذي تنتمي إليه وحدة (1..11)
export function domaineDeUnite(u: number): NumeroDomaine {
  if (u <= 5) return 1;
  if (u <= 8) return 2;
  return 3;
}

export async function chargerDomaineDeUnite(u: number): Promise<ItemDrill[]> {
  return chargerDomaine(domaineDeUnite(u));
}

// بناء جولة: العناصر غير المُجابة أولًا، ثم الباقي، بلا تكرار داخل الجولة.
export function composerJoueur(tous: ItemDrill[], dejaFait: Set<string>, taille: number): ItemDrill[] {
  const restants = tous.filter((i) => !dejaFait.has(i.id));
  const base = restants.length > 0 ? restants : tous;
  const melange = [...base];
  for (let i = melange.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [melange[i], melange[j]] = [melange[j], melange[i]];
  }
  return melange.slice(0, taille);
}

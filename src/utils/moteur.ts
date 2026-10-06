// src/utils/moteur.ts — محرّك الطريق المُرشد (Next Best Action)
//
// أولوية مهمّة اليوم (مهمّة واحدة تُعرض):
//   1. استئناف الدرس المبدوء؛
//   2. استرجاع مستحق (قبل أي جديد)؛
//   3. حصّة جديدة إن لم يُبلغ الحصّة اليومية (1 + إضافية)؛
//   4. وإلا: راحة (« يكفي اليوم »).
//
// لا نسبة مئوية، لا عدّ تنازلي، لا سلسلة قابلة للكسر (OPUS: مضاد للقلق).

import {
  CHEMIN,
  DEBUT_ANNEE,
  UNITE_PAR_ID,
  UNITES,
  cleItem,
  uniteDeItem,
  type ItemChemin,
} from '../data/programme';
import type { Etat } from '../types';
import { ajouterJours, aujourdhui, differenceJours } from './dates';
import { aReviserAujourdhui } from './srs';

export type ActionJour =
  | { type: 'reprise'; item: ItemChemin }
  | { type: 'rappel'; lessonIds: string[] }
  | { type: 'nouvelle'; item: ItemChemin }
  | { type: 'repos'; bonusDispo: boolean; prochaineItem: ItemChemin | null }
  | { type: 'fini' };

// ───────────── حالة بنود الطريق ─────────────

export function itemFait(etat: Etat, item: ItemChemin): boolean {
  if (item.type === 'lecon') return etat.progression[item.id]?.statut === 'terminee';
  return Boolean(etat.jalons[item.uniteId]?.fait);
}

export function itemVerrouille(etat: Etat, item: ItemChemin): boolean {
  const idx = CHEMIN.findIndex((c) => cleItem(c) === cleItem(item));
  return CHEMIN.slice(0, idx).some((c) => !itemFait(etat, c));
}

export function prochainItem(etat: Etat): ItemChemin | null {
  return CHEMIN.find((c) => !itemFait(etat, c)) ?? null;
}

export function itemsFaits(etat: Etat): number {
  return CHEMIN.filter((c) => itemFait(etat, c)).length;
}

// درس مبدوء لم يكتمل (للاستئناف): نأخذ الأحدث
export function leconEnCours(etat: Etat): ItemChemin | null {
  const enCours = CHEMIN.filter(
    (c): c is { type: 'lecon'; id: string } =>
      c.type === 'lecon' && etat.progression[c.id]?.statut === 'en_cours'
  );
  if (!enCours.length) return null;
  const plusRecente = enCours.reduce((a, b) => {
    const da = etat.progression[a.id]?.derniereSession ?? '';
    const db = etat.progression[b.id]?.derniereSession ?? '';
    return db > da ? b : a;
  });
  return plusRecente;
}

export function revisionsDues(etat: Etat): string[] {
  return Object.keys(etat.progression).filter((id) => aReviserAujourdhui(etat.progression[id]));
}

// ───────────── الحصّة اليومية ─────────────

export function seancesAujourdhui(etat: Etat): number {
  return etat.seancesJour === aujourdhui() ? etat.seancesComptees : 0;
}

export function bonusDispoAujourdhui(etat: Etat): boolean {
  return etat.bonusJour !== aujourdhui();
}

export function enregistrerSeance(etat: Etat): Etat {
  const auj = aujourdhui();
  const comptees = etat.seancesJour === auj ? etat.seancesComptees + 1 : 1;
  return {
    ...etat,
    seancesJour: auj,
    seancesComptees: comptees,
    journal: etat.journal.includes(auj) ? etat.journal : [...etat.journal, auj],
  };
}

export function enregistrerActivite(etat: Etat): Etat {
  const auj = aujourdhui();
  if (etat.journal.includes(auj)) return etat;
  return { ...etat, journal: [...etat.journal, auj] };
}

// ───────────── إيقاع الأسبوع 5/7 ─────────────

export function rythmeSemaine(etat: Etat): { jours: number; cible: number } {
  const auj = aujourdhui();
  const debut = ajouterJours(auj, -6);
  const jours = etat.journal.filter((j) => differenceJours(debut, j) >= 0).length;
  return { jours: Math.min(jours, 7), cible: 5 };
}

// ───────────── موضع القسم (التدرّج السنوي) ─────────────

export function semaineActuelle(): number {
  return Math.floor(differenceJours(DEBUT_ANNEE, aujourdhui()) / 7) + 1;
}

export function uniteDeLaClasse(): string | null {
  const s = semaineActuelle();
  const u = UNITES.find((x) => s >= x.fenetre.debut && s <= x.fenetre.fin);
  return u?.id ?? null;
}

export type PositionClasse = {
  statut: 'aligne' | 'avance' | 'retard' | 'termine';
  texteAr: string;
  uniteId: string | null;
};

export function positionClasse(etat: Etat): PositionClasse {
  const prochUnite = prochainItem(etat);
  const prochaineUniteId = prochUnite ? uniteDeItem(prochUnite)?.id : null;
  const classeId = uniteDeLaClasse();

  if (!prochaineUniteId) {
    return {
      statut: 'termine',
      uniteId: null,
      texteAr: 'أنهيت كل البرنامج. الآن وقت الاسترجاع والامتحان التجريبي فقط.',
    };
  }
  if (!classeId) {
    return {
      statut: 'termine',
      uniteId: prochaineUniteId,
      texteAr: 'انتهى التدرّج السنوي في القسم. ركّز على الاسترجاع والأسابيع الأخيرة قبل البكالوريا.',
    };
  }
  if (classeId === prochaineUniteId) {
    return {
      statut: 'aligne',
      uniteId: classeId,
      texteAr: 'أنت في نفس وحدة قسمك تمامًا. خطوة واحدة كل يوم تبقيك هناك.',
    };
  }
  const np = UNITE_PAR_ID[prochaineUniteId].numero;
  const nc = UNITE_PAR_ID[classeId].numero;
  if (np > nc) {
    return {
      statut: 'avance',
      uniteId: prochaineUniteId,
      texteAr: 'أنت متقدّم على التدرّج السنوي. لا تتسرّع: ثبّت ما تعلّمته قبل الانتقال.',
    };
  }
  return {
    statut: 'retard',
    uniteId: prochaineUniteId,
    texteAr: 'تأخّرت قليلاً عن التدرّج السنوي. الخطة: حصّة واحدة كل يوم تكفي لتلحق قبل البكالوريا.',
  };
}

// ───────────── المهمّة الواحدة ─────────────

export function prochaineAction(etat: Etat): ActionJour {
  // 0. كل شيء أُنجز
  if (!prochainItem(etat)) return { type: 'fini' };

  // 1. استئناف
  const enCours = leconEnCours(etat);
  if (enCours) return { type: 'reprise', item: enCours };

  // 2. استرجاع مستحق قبل أي جديد
  const dues = revisionsDues(etat);
  if (dues.length) return { type: 'rappel', lessonIds: dues };

  // 3. حصّة جديدة ضمن الحصّة اليومية
  if (seancesAujourdhui(etat) === 0) {
    const item = prochainItem(etat);
    if (item) return { type: 'nouvelle', item };
  }

  // 4. راحة (مع إمكانية حصّة إضافية واحدة)
  return {
    type: 'repos',
    bonusDispo: bonusDispoAujourdhui(etat),
    prochaineItem: prochainItem(etat),
  };
}

// ───────────── مساعدات الوحدة ─────────────

export function leconsUniteFaites(etat: Etat, uniteId: string): number {
  const u = UNITE_PAR_ID[uniteId];
  return u.lessonIds.filter((id) => etat.progression[id]?.statut === 'terminee').length;
}

export function uniteTerminee(etat: Etat, uniteId: string): boolean {
  const u = UNITE_PAR_ID[uniteId];
  return u.lessonIds.every((id) => etat.progression[id]?.statut === 'terminee');
}

/** أضعف دروس الوحدة (هشّ أو أقل تقييم) — يُسمّى في الجسر */
export function leconLaPlusFragile(etat: Etat, uniteId: string): string | null {
  const u = UNITE_PAR_ID[uniteId];
  let candidate: string | null = null;
  let pire = 99;
  for (const id of u.lessonIds) {
    const p = etat.progression[id];
    if (!p || p.statut !== 'terminee') continue;
    const score = p.fragile ? -10 + (p.note ?? 6) : p.note ?? 6;
    if (score < pire) {
      pire = score;
      candidate = id;
    }
  }
  return candidate;
}

export function questionsGardees(etat: Etat, uniteId: string): number {
  return etat.notes.filter((n) => n.kind === 'question' && n.uniteId === uniteId).length;
}

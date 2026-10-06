import type { LessonGoldSummary } from '../data/lessonGoldSummaries';
import { QCM_LECONS, type QcmDeLecon } from '../data/qcmLecons';

/**
 * Retourne le QCM dédié d'une leçon, ou null si la banque ne le couvre pas.
 *
 * Les 58 leçons du programme ont chacune un QCM écrit à la main dans
 * `qcmLecons.ts` (choix unique, 4 propositions, une seule réponse exacte).
 * Pas de fallback généré automatiquement : il risquait de produire des QCM
 * à seulement 3 options, voire avec deux réponses correctes (une étape
 * vraie de la chaîne causale prise comme distracteur).
 *
 * Les composants appellent doivent donc gérer le cas `null` en sautant
 * l'étape QCM au lieu de crasher.
 */
export function qcmPourLecon(lessonId: string, _lecon?: LessonGoldSummary | null | undefined): QcmDeLecon | null {
  return QCM_LECONS[lessonId] ?? null;
}

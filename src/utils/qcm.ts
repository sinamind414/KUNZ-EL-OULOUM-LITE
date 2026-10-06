import type { LessonGoldSummary } from '../data/lessonGoldSummaries';
import { QCM_LECONS, type QcmDeLecon } from '../data/qcmLecons';

/** Retourne toujours un QCM utilisable, y compris pour les leçons ajoutées récemment. */
export function qcmPourLecon(lessonId: string, lecon: LessonGoldSummary | null | undefined): QcmDeLecon | null {
  const existant = QCM_LECONS[lessonId];
  if (existant) return existant;
  if (!lecon) return null;

  const bonneReponse = lecon.evidenceAr || lecon.mechanismAr[0];
  const distracteurs = [
    lecon.commonErrorAr,
    lecon.mechanismAr[lecon.mechanismAr.length - 1],
    lecon.vocabulary.slice(0, 2).join(' و '),
  ].filter((value, index, values) => value && values.indexOf(value) === index && value !== bonneReponse);
  const options = [bonneReponse, ...distracteurs].slice(0, 4);

  const fabriquer = (prefixe: string) => ({
    question: `${prefixe}: ${lecon.missionAr}`,
    options,
    explication: `الجواب يعتمد على الدليل: ${bonneReponse}`,
  });

  return {
    rappel: fabriquer('استرجع الفكرة الأساسية للدرس'),
    synthese: fabriquer('ما الخلاصة الصحيحة التي تكتبها في البكالوريا'),
  };
}

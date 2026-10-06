// جسر الوحدة — يُفتح بعد إنهاء كل دروس الوحدة.
// سؤال واحد باختيار من متعدد (تركيب الوحدة)، ثم مواجهة الفخّين الرسميين، ثم تشخيص أضعف درس.

import { useState } from 'react';
import { UNITE_PAR_ID } from '../data/programme';
import { leconLaPlusFragile, uniteTerminee } from '../utils/moteur';
import { titreLecon } from '../data/programme';
import { qcmPourLecon } from '../utils/qcm';
import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { nb, formatJourAr } from '../utils/dates';
import type { Etat } from '../types';
import { ChoixUnique, Morceau, OptionsMcq } from './Communs';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  uniteId: string;
  etat: Etat;
  onEnregistrer: (synthese: string) => void;
  onRelireLecon: (lessonId: string) => void;
  onFermer: () => void;
}

export default function JalonUnite({
  uniteId,
  etat,
  onEnregistrer,
  onRelireLecon,
  onFermer,
}: Props) {
  const u = UNITE_PAR_ID[uniteId];
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [qcmFait, setQcmFait] = useState(false);
  const [evite, setEvite] = useState<'oui' | 'non' | null>(null);
  const [gardeesVues, setGardeesVues] = useState<Record<string, boolean>>({});

  if (!uniteTerminee(etat, uniteId)) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-10">
        <div className="card p-7 text-center">
          <span className="text-4xl">🔒</span>
          <h1 className="font-naskh mt-3 text-xl font-bold">الجسر مقفل</h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            أنجز كل دروس الوحدة {nb(u.numero)} أولًا، ثم يُفتح الجسر.
          </p>
          <button onClick={onFermer} className="btn btn-ghost mt-5">
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const fragile = leconLaPlusFragile(etat, uniteId);
  // درس التركيب المختار للسؤال: أضعف درس إن وُجد، وإلّا آخر درس في الوحدة
  const cible = fragile ?? u.lessonIds[u.lessonIds.length - 1];
  const qcm = qcmPourLecon(cible, getLessonGoldSummary(cible))?.synthese;
  const questions = etat.notes.filter(
    (n) => n.kind === 'question' && n.uniteId === uniteId && !gardeesVues[n.id]
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-6 pt-5">
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onFermer}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute transition-colors hover:bg-sage-soft"
            aria-label="إغلاق"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-mute">الجسر · الوحدة {nb(u.numero)}</p>
            <h1 className="truncate font-naskh text-lg font-bold">{u.titre}</h1>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[1, 2, 3].map((k) => (
            <span
              key={k}
              className={`h-1.5 w-8 rounded-full ${
                k < etape ? 'bg-forest' : k === etape ? 'bg-gold' : 'bg-line'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="card flex-1 p-5">
        <p className="eyebrow">الخطوة {nb(etape)} من 3</p>

        {etape === 1 && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-sage bg-sage-soft p-4">
              <p className="text-[11px] font-bold text-forest">سؤال الوحدة</p>
              <p className="mt-1.5 text-base font-bold leading-relaxed">{u.questionAr}</p>
            </div>
            <p className="text-xs font-bold text-ink-soft">
              بوّابة الجسر: اختر الجواب التركيبي الصحيح — من ذاكرتك وحدك، لا درس مفتوح. إن
              أخطأت أعد المحاولة حتى تصيب.
            </p>
            {qcm && <ChoixUnique qcm={qcm} fait={qcmFait} onValide={() => setQcmFait(true)} />}
            <button
              onClick={() => setEtape(2)}
              disabled={!qcmFait}
              className="btn btn-primary w-full"
            >
              التالي: مواجهة الفخّين
            </button>
          </div>
        )}

        {etape === 2 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-bold text-ink-soft">الفخّان الرسميان للوحدة</p>
            {u.piegesAr.map((piege, i) => (
              <div
                key={i}
                className="rounded-2xl border border-clay-soft bg-clay-soft/50 p-3.5"
              >
                <p className="text-[11px] font-bold text-clay">فخّ {nb(i + 1)}</p>
                <p className="mt-1 text-sm leading-relaxed">{piege}</p>
              </div>
            ))}
            <p className="text-xs font-bold text-ink-soft">هل تجنّبت هذين الفخّين في إجابتك؟</p>
            <OptionsMcq
              nom="تجنّب الفخّين"
              options={[
                { key: 'oui', label: 'نعم — تجنّبتهما' },
                { key: 'non', label: 'وقعت في أحدهما' },
              ]}
              value={evite}
              onChange={(k) => setEvite(k as 'oui' | 'non')}
            />
            {evite === 'non' && (
              <Morceau ton="gold">
                الوقوع في الفخّ خبر جيد الآن — أفضل من الوقوع فيه يوم البكالوريا. راجع
                الفخّين أعلاه، وتأكّد من فهمك لهما، ثم واصل.
              </Morceau>
            )}
            {evite && (
              <button onClick={() => setEtape(3)} className="btn btn-primary w-full">
                التالي: آخر تفتيش
              </button>
            )}
          </div>
        )}

        {etape === 3 && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-line bg-cream/60 p-4">
              <p className="text-[11px] font-bold text-mute">سؤال التركيب الذي أجبت عنه</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed">
                {qcm?.question ?? '—'}
              </p>
            </div>

            {fragile && (
              <div className="rounded-2xl border border-gold-soft bg-gold-soft/50 p-4">
                <p className="text-[11px] font-bold text-[#6b5320]">أضعف دروسك في هذه الوحدة</p>
                <p className="mt-1.5 text-sm font-bold">{titreLecon(fragile)}</p>
                <button
                  onClick={() => onRelireLecon(fragile)}
                  className="btn btn-gold mt-3 w-full text-sm"
                >
                  إعادة قراءة سريعة لهذا الدرس
                </button>
              </div>
            )}

            {questions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-ink-soft">
                  أسئلة أجّلتها أثناء دروس هذه الوحدة ({nb(questions.length)})
                </p>
                <div className="mt-2 space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-start gap-2 rounded-2xl border border-line bg-paper p-3"
                    >
                      <p className="flex-1 text-sm leading-relaxed">{q.texte}</p>
                      <button
                        onClick={() => setGardeesVues((p) => ({ ...p, [q.id]: true }))}
                        className="shrink-0 rounded-lg bg-sage px-2 py-1 text-[10px] font-bold text-forest-deep"
                      >
                        حُلّ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Morceau>
              أنهيت الوحدة {nb(u.numero)}: {u.titre}. ثقلها في البكالوريا{' '}
              {nb(u.poidsBac)} من 5. الوحدة التالية تنتظرك في الطريق — بعد راحة.
            </Morceau>

            <button
              onClick={() => onEnregistrer('')}
              className="btn btn-primary w-full text-base"
            >
              عبور الجسر ✓
            </button>
          </div>
        )}
      </main>

      <footer className="mt-4">
        <p className="text-center text-xs text-mute">
          الجسر يُسجّل تاريخًا: {formatJourAr(new Date().toISOString().slice(0, 10))}
        </p>
      </footer>
    </div>
  );
}

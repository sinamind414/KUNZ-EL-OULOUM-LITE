// جلسة استرجاع — تُطلق من بطاقة مهمّة اليوم حين يكون هناك استرجاع مستحق
// 3 خطوات: سؤال الاسترجاع → فحص المصطلحات → سؤال تركيبي (اختيار من متعدد)
// ثم تقييم واحد (سهل/متوسط/صعب) يُغذّي SM-2. لا عرض للنقاط، لا نسب.

import { useEffect, useState } from 'react';
import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { QCM_LECONS } from '../data/qcmLecons';
import { uniteDeLecon, titreLecon } from '../data/programme';
import type { Qualite } from '../utils/srs';
import { ChoixUnique, Morceau, OptionsMcq } from './Communs';
import { IcoRetour, IcoVerifie } from './Icones';

interface Props {
  lessonIds: string[];
  onResultat: (lessonId: string, qualite: Qualite) => void;
  onFermer: () => void;
}

export default function SessionRevision({ lessonIds, onResultat, onFermer }: Props) {
  const [i, setI] = useState(0);
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [montre, setMontre] = useState(false);
  const [rappel, setRappel] = useState<'oui' | 'non' | null>(null);
  const [termes, setTermes] = useState<Record<string, boolean>>({});
  const [qcmFait, setQcmFait] = useState(false);
  const [rating, setRating] = useState<'easy' | 'mid' | 'hard' | null>(null);
  const [termine, setTermine] = useState(false);

  const lessonId = lessonIds[i];
  const lecon = lessonId ? getLessonGoldSummary(lessonId) : null;
  const unite = lessonId ? uniteDeLecon(lessonId) : undefined;

  const frag = rating === 'hard';

  useEffect(() => {
    setEtape(1);
    setMontre(false);
    setRappel(null);
    setTermes({});
    setQcmFait(false);
    setRating(null);
  }, [i]);

  if (!lecon) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-20 text-center">
        <p className="text-mute">لا توجد دروس مستحقة لهذا الاسترجاع.</p>
        <button onClick={onFermer} className="btn btn-ghost mt-4">
          رجوع
        </button>
      </div>
    );
  }

  const termesOublies = lecon.vocabulary.filter((v) => termes[v] === false).length;

  function calculerQualite(): Qualite {
    if (rating === 'easy' && rappel === 'oui' && termesOublies === 0) return 5;
    if (rating === 'easy') return 4;
    if (rating === 'mid') return 3;
    return 1;
  }

  // ───────────── شاشة النهاية ─────────────
  if (termine) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-10">
        <div className="card animate-pop-in p-7 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-forest">
            <span className="block h-7 w-7">
              <IcoVerifie />
            </span>
          </span>
          <p className="eyebrow mt-4">استرجاع أُنجز</p>
          <h1 className="font-naskh mt-2 text-2xl font-bold">{titreLecon(lessonId)}</h1>
          <div className="mt-5">
            <Morceau ton={frag ? 'gold' : 'sage'}>
              {frag
                ? 'هذا الدرس صعب عليك الآن — سنعود إليه غدًا. تكرار الاسترجاع الصعب هو ما يصنع التثبيت.'
                : 'استرجاع سلس. سترى هذا الدرس مجددًا في مهمّة اليوم حين يحين موعده — كلما طال الفاصل، كان التثبيت أعمق.'}
            </Morceau>
          </div>
          <button
            onClick={() => {
              onResultat(lessonId, calculerQualite());
              if (i + 1 < lessonIds.length) {
                setI(i + 1);
                setTermine(false);
              } else {
                onFermer();
              }
            }}
            className="btn btn-primary mt-6 w-full"
          >
            {i + 1 < lessonIds.length ? 'الدرس المستحق التالي' : 'تم — العودة إلى المسار'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-6 pt-5">
      <header className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onFermer}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute transition-colors hover:bg-sage-soft"
            aria-label="إغلاق"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[11px] text-mute">
              {unite ? `الوحدة ${unite.numero}: ${unite.titre}` : 'استرجاع'}
            </p>
            <h1 className="truncate text-base font-bold">{titreLecon(lessonId)}</h1>
          </div>
          <div className="w-9 text-center text-[11px] font-bold text-mute">
            {i + 1}/{lessonIds.length}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {lessonIds.map((_, k) => (
            <span
              key={k}
              className={`h-1.5 w-6 rounded-full ${k < i ? 'bg-forest' : k === i ? 'bg-gold' : 'bg-line'}`}
            />
          ))}
        </div>
      </header>

      <main className="card animate-pop-in flex-1 p-5">
        <p className="eyebrow">
          الاسترجاع {i + 1} من {lessonIds.length} · الخطوة {etape} من 3
        </p>

        {/* الخطوة 1: سؤال الاسترجاع */}
        {etape === 1 && (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-gold-soft bg-gold-soft/50 p-3.5">
              <p className="text-[11px] font-bold text-[#6b5320]">سؤال الاسترجاع</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed">{lecon.recallQuestionAr}</p>
            </div>
            {!montre && (
              <button onClick={() => setMontre(true)} className="btn btn-gold w-full">
                حاولتُ — أظهر الجواب
              </button>
            )}
            {montre && (
              <>
                <p className="text-[11px] font-bold text-forest">الجواب — الخطوات السببية</p>
                <div className="space-y-2">
                  {lecon.mechanismAr.map((etapeTexte, k) => (
                    <div
                      key={k}
                      className="flex items-start gap-3 rounded-xl border border-line bg-cream/50 px-3 py-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-paper">
                        {k + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{etapeTexte}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-ink-soft">هل تذكّرت جوهر الجواب من نفسك؟</p>
                <OptionsMcq
                  nom="التذكّر"
                  options={[
                    { key: 'oui', label: 'تذكّرته من نفسي' },
                    { key: 'non', label: 'لم أتذكّره — احتجت الجواب' },
                  ]}
                  value={rappel}
                  onChange={(k) => setRappel(k as 'oui' | 'non')}
                />
                {rappel && (
                  <button onClick={() => setEtape(2)} className="btn btn-primary w-full">
                    التالي: فحص المصطلحات
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* الخطوة 2: فحص المصطلحات */}
        {etape === 2 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-bold text-ink-soft">
              لكلّ كلمة مفتاحية: هل تستطيع شرحها بكلماتك الآن؟ (صدق — لا أحد يراك)
            </p>
            <div className="space-y-2">
              {lecon.vocabulary.map((v) => {
                const c = termes[v];
                return (
                  <button
                    key={v}
                    onClick={() => setTermes((p) => ({ ...p, [v]: p[v] === undefined ? true : !p[v] }))}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${
                      c === true
                        ? 'border-sage bg-sage-soft text-forest-deep'
                        : c === false
                          ? 'border-clay-soft bg-clay-soft/50 text-clay'
                          : 'border-line bg-paper text-ink-soft'
                    }`}
                  >
                    <span>{v}</span>
                    <span className="text-[11px]">
                      {c === true ? 'أستطيع شرحها' : c === false ? 'لا أتذكّرها' : 'اضغط'}
                    </span>
                  </button>
                );
              })}
            </div>
            {termesOublies > 0 && (
              <p className="text-xs font-bold text-clay">
                {termesOublies} مصطلح لا تتذكّره — ستراجعهم في الجلسة القادمة.
              </p>
            )}
            <button onClick={() => setEtape(3)} className="btn btn-primary w-full">
              التالي: سؤال التركيب
            </button>
          </div>
        )}

        {/* الخطوة 3: سؤال تركيبي + التقييم */}
        {etape === 3 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-bold text-ink-soft">
              سؤال التركيب — اختر الجواب الصحيح بكلماتك أنت (لا مساعدة)
            </p>
            <ChoixUnique
              qcm={QCM_LECONS[lessonId]?.synthese}
              fait={qcmFait}
              onValide={() => setQcmFait(true)}
            />
            {qcmFait && (
              <>
                <p className="text-xs font-bold text-ink-soft">كيف سار هذا الاسترجاع؟</p>
                <OptionsMcq
                  nom="تقييم الاسترجاع"
                  options={[
                    { key: 'easy', label: 'سهل — تذكّرت كل شيء' },
                    { key: 'mid', label: 'متوسط — فيه ثغرات' },
                    { key: 'hard', label: 'صعب — كثير منه نسيته' },
                  ]}
                  value={rating}
                  onChange={(k) => setRating(k as 'easy' | 'mid' | 'hard')}
                />
                {rating && (
                  <button onClick={() => setTermine(true)} className="btn btn-primary w-full">
                    إنهاء الاسترجاع ✓
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="mt-4">
        <p className="text-center text-xs text-mute">
          الاسترجاع قبل الجديد — هذه هي القاعدة الأولى للطريقة.
        </p>
      </footer>
    </div>
  );
}

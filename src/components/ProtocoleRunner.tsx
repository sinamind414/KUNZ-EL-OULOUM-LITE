// مشغّل البروتوكول — 6 مراحل مع بوّابة تحقّق لكل مرحلة (لا زر تخطّي)
// المُرشد يتكلّم في 4 لحظات فقط. صمّام «أنا عالق» يُعطي تلميحين لكل مرحلة.
// كل شيء يُحفظ بعد كل مرحلة (localStorage) فلا تُفقد الدقائق.

import { useEffect, useMemo, useState } from 'react';
import { getLessonGoldSummary } from '../data/lessonGoldSummaries';
import { DIAGNOSTICS, PROTOCOLE, type PhaseProtocole } from '../data/protocole';
import { UNITE_PAR_ID, titreLecon, uniteDeLecon } from '../data/programme';
import { aContenuLecon, questionLecon } from '../data/leconsPassives';
import { ajouterJours, aujourdhui, enArabe, formatJourAr, minutesEnArabe } from '../utils/dates';
import { premiereRevision } from '../utils/srs';
import type { ProgressionLecon } from '../types';
import { ChoixUnique, Minuteur, Morceau, OptionsMcq, ValveAide } from './Communs';
import { IcoRetour, IcoVerifie } from './Icones';
import { qcmPourLecon } from '../utils/qcm';

interface Props {
  lessonId: string;
  progression: ProgressionLecon | undefined;
  onProgresse: (p: ProgressionLecon) => void;
  onTerminer: (p: ProgressionLecon, minutes: number) => void;
  onLireLecon: () => void;
  leconLue: boolean;
  onFermer: () => void;
}

// المراحل التي يتكلّم فيها المُرشد (الباقي: صمت)
const PHASES_PARLANTES = new Set([1, 3, 5, 6]);

// اختيار ثابت لكل درس (لا يتغيّر بين الجلسات)
function hache(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function progressionBase(p: ProgressionLecon | undefined): ProgressionLecon {
  return (
    p ?? {
      statut: 'en_cours',
      phases: [],
      minutes: 0,
      repetitions: 0,
      intervalle: 0,
      facilite: 2.5,
    }
  );
}

export default function ProtocoleRunner({
  lessonId,
  progression,
  onProgresse,
  onTerminer,
  onLireLecon,
  leconLue,
  onFermer,
}: Props) {
  const lecon = getLessonGoldSummary(lessonId);
  const unite = uniteDeLecon(lessonId);
  const qcmLecon = qcmPourLecon(lessonId, lecon);

  const faites = progression?.phases ?? [];
  const [index, setIndex] = useState<number>(Math.min(faites.length, PROTOCOLE.length - 1));
  const phase: PhaseProtocole = PROTOCOLE[index];

  const [secondes, setSecondes] = useState(phase.dureeMin * 60);
  const [enMarche, setEnMarche] = useState(false);
  const [cloture, setCloture] = useState(false);
  const [recompense, setRecompense] = useState(false);

  // حالات البوّابات
  const [revele, setRevele] = useState(false);
  const [mcq, setMcq] = useState<string | null>(null);
  const [echecs, setEchecs] = useState(0);
  const [echecMax, setEchecMax] = useState(false);
  const [classes, setClasses] = useState<Record<string, 'avant' | 'nouveau'>>({});
  const [lectureFaite, setLectureFaite] = useState(false);
  // «العودة إلى مراحل المراجعة»: شاشة فهرس المراحل يملكها التلميذ
  const [vue, setVue] = useState<'phase' | 'sommaire'>('phase');
  const [qcmFait, setQcmFait] = useState(false);
  const [auto, setAuto] = useState<'plein' | 'partiel' | 'non' | null>(null);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [aides, setAides] = useState(2);

  // متى فُتحت الجلسة (لحساب الدقائق عند الإنهاء)
  const [minutesDepart] = useState(() => progression?.minutes ?? 0);

  // إعادة الضبط عند تغيير المرحلة
  useEffect(() => {
    setSecondes(phase.dureeMin * 60);
    setEnMarche(false);
    setRevele(false);
    setMcq(null);
    setEchecs(0);
    setEchecMax(false);
    setClasses({});
    setLectureFaite(false);
    setQcmFait(false);
    setAuto(null);
    setDiagnostic(null);
    setAides(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // المؤقّت
  useEffect(() => {
    if (!enMarche || secondes <= 0) return;
    const t = setTimeout(() => setSecondes((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [enMarche, secondes]);

  // ───────────── أسئلة البوّابات المُولّدة من المحتوى ─────────────

  const qEtapes = useMemo(() => {
    if (!lecon) return null;
    const n = lecon.mechanismAr.length;
    const options = Array.from(new Set([n - 1, n, n + 1, n + 2].filter((x) => x >= 1)))
      .sort((a, b) => a - b)
      .slice(0, 4)
      .map((x) => ({ key: String(x), label: `${enArabe(x)} خطوات` }));
    return { n, options };
  }, [lecon]);

  const qSequence = useMemo(() => {
    if (!lecon || lecon.mechanismAr.length < 3) return null;
    const i = hache(lessonId) % (lecon.mechanismAr.length - 1);
    const juste = lecon.mechanismAr[i + 1];
    const autres = lecon.mechanismAr.filter((_, j) => j !== i + 1);
    const distracteurs = [autres[0], autres[autres.length - 1]];
    const options = [juste, ...distracteurs].map((s, k) => ({ key: String(k), label: s }));
    // ترتيب ثابت يبدأ من العدد الصحيح
    const ordre = options.map((_, k) => k).sort((a, b) => (hache(lessonId + a) % 10) - (hache(lessonId + b) % 10));
    return {
      indice: i,
      options: ordre.map((k) => options[k]),
      reponse: String(options.findIndex((o) => o.label === juste)),
    };
  }, [lecon, lessonId]);

  // ───────────── هل تجاوزت بوّابة المرحلة؟ ─────────────

  function verrouPasse(): boolean {
    if (!lecon) return false;
    // مرحلة أنجزتها من قبل: تُفتح لك دائمًا حين تعود إليها (لا إعادة إجبارية)
    if (faites.includes(phase.id)) return true;
    switch (phase.id) {
      case 1:
        return lectureFaite && (echecMax || mcq === String(qEtapes?.n));
      case 2:
        return lecon.vocabulary.every((v) => classes[v]);
      case 3:
        return qcmFait;
      case 4:
        return revele;
      case 5:
        return echecMax || mcq === qSequence?.reponse;
      case 6:
        return qcmFait && auto !== null && (auto === 'plein' || diagnostic !== null);
      default:
        return false;
    }
  }

  function fragile(): boolean {
    return echecMax || auto === 'partiel' || auto === 'non';
  }

  // ───────────── الانتقال ─────────────

  function phaseSuivante(): void {
    const base = progressionBase(progression);
    const reponses = { ...base.reponses };

    const maj: ProgressionLecon = {
      ...base,
      statut: 'en_cours',
      phases: Array.from(new Set([...faites, phase.id])),
      minutes: minutesDepart + PROTOCOLE.slice(0, index + 1).reduce((s, p) => s + p.dureeMin, 0),
      derniereSession: aujourdhui(),
      reponses,
      diagnostic: phase.id === 6 && diagnostic ? diagnostic : base.diagnostic,
    };

    if (index === PROTOCOLE.length - 1) {
      const frag = fragile();
      const minutes = maj.minutes;
      setCloture(true);
      onProgresse({ ...maj, fragile: frag });
      void minutes;
      return;
    }

    // مكافأة المرحلة 1: الملخّص الذهبي يُفتح بعد القراءة الكاملة
    if (phase.id === 1) {
      onProgresse(maj);
      setRecompense(true);
      return;
    }

    onProgresse(maj);
    setIndex(index + 1);
  }

  if (!lecon) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-20 text-center">
        <p className="text-mute">الدرس المطلوب غير متوفّر في قاعدة البيانات.</p>
        <button onClick={onFermer} className="btn btn-ghost mt-4">
          رجوع
        </button>
      </div>
    );
  }

  function formatTemps(s: number): string {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  // ───────────── شاشة الإغلاق (كلام المُرشد الأخير) ─────────────

  if (cloture) {
    const frag = fragile();
    const prochaine = ajouterJours(aujourdhui(), frag ? 1 : 3);
    const minutes = minutesDepart + PROTOCOLE.reduce((s, p) => s + p.dureeMin, 0);
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-10">
        <div className="card animate-pop-in p-7 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-forest">
            <span className="block h-7 w-7">
              <IcoVerifie />
            </span>
          </span>
          <p className="eyebrow mt-4">أنهيت الدرس</p>
          <h1 className="font-naskh mt-2 text-2xl font-bold">{titreLecon(lessonId)}</h1>
          <p className="mt-2 text-sm text-mute">
            {minutesEnArabe(minutes)} من التركيز — هذا هو الاستثمار الحقيقي.
          </p>

          <div className="mt-5 space-y-3 text-right">
            <Morceau>
              {frag
                ? `كانت المراجعة صعبة قليلًا — وهذا خبر جيد: سنعود إلى هذا الدرس غدًا ${formatJourAr(
                    prochaine
                  )}. هكذا تُردم الثغرات.`
                : `سنعود إلى هذا الدرس يوم ${formatJourAr(prochaine)} (بعد ٣ أيام). الاسترجاع المتباعد هو ما يثبّت.`}
            </Morceau>
            <p className="text-xs leading-relaxed text-mute">
              المراجعات التالية: J+3 ثم J+7 ثم J+14 ثم J+28. كلما صعُب عليك الاسترجاع، أرسلنا المراجعة
              أقرب — وهذه علامة تعلّم لا فشل.
            </p>
          </div>

          <button
            onClick={() => {
              const base = progressionBase(progression);
              const minutesFinales = minutesDepart + PROTOCOLE.reduce((s, p) => s + p.dureeMin, 0);
              onTerminer(
                premiereRevision(
                  {
                    ...base,
                    statut: 'terminee',
                    phases: [1, 2, 3, 4, 5, 6],
                    minutes: minutesFinales,
                    derniereSession: aujourdhui(),
                    fragile: frag,
                  },
                  frag
                ),
                minutesFinales
              );
            }}
            className="btn btn-primary mt-6 w-full"
          >
            تم — العودة إلى المسار
          </button>
        </div>
      </div>
    );
  }

  // ───────────── شاشة المكافأة: الملخّص الذهبي (بعد المرحلة 1) ─────────────

  if (recompense && lecon) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-10">
        <div className="card animate-pop-in overflow-hidden p-0">
          <div className="bg-gradient-to-b from-forest to-forest-deep px-6 py-8 text-center text-paper">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-soft text-3xl shadow-lg">
              🏅
            </span>
            <p className="mt-3 text-[11px] font-bold tracking-wide text-gold-soft">
              مكافأة إتمام المرحلة 1
            </p>
            <h2 className="font-naskh mt-1 text-2xl font-bold">الملخّص الذهبي</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-paper/80">
              أنهيتَ قراءة الدرس كاملةً، فانفتح لك قلب الدرس. هذا الملخّص هو ثروتك نحو البكالوريا —
              اقرأه مرّتين ثم تابع.
            </p>
          </div>

          <div className="space-y-5 p-6">
            <section>
              <p className="eyebrow">إشكالية الدرس</p>
              <p className="mt-1.5 text-sm font-bold leading-relaxed text-ink">{lecon.missionAr}</p>
            </section>

            <section>
              <p className="eyebrow">السلسلة السببية للدرس</p>
              <ol className="mt-2 space-y-2">
                {lecon.mechanismAr.map((etape, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-2xl border border-line bg-cream/60 p-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-paper">
                      {enArabe(i + 1)}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-soft">{etape}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <p className="eyebrow">الدليل الوثائقي</p>
              <p className="mt-1.5 rounded-2xl border border-sage bg-sage-soft p-3 text-sm leading-relaxed text-forest-deep">
                {lecon.evidenceAr}
              </p>
            </section>

            <section>
              <p className="eyebrow">الكلمات المفتاحية</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lecon.vocabulary.map((v) => (
                  <span
                    key={v}
                    className="rounded-full border border-gold-soft bg-gold-soft/50 px-3 py-1 text-xs font-bold text-[#6b5320]"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </section>

            <button
              onClick={() => {
                setRecompense(false);
                setIndex(index + 1);
              }}
              className="btn btn-primary w-full text-base"
            >
              متابعة إلى المرحلة ٢ ←
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────── شاشة فهرس المراحل (ملك التلميذ: يعود متى شاء) ─────────────

  if (vue === 'sommaire') {
    const maxAtteint = Math.max(phase.id, ...faites);
    return (
      <div className="mx-auto max-w-2xl px-4 pb-6 pt-5">
        <header className="mb-4 flex items-center justify-between gap-2">
          <button
            onClick={onFermer}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute transition-colors hover:bg-sage-soft"
            aria-label="خروج من الدرس"
            title="خروج من الدرس"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[11px] text-mute">
              {unite ? `الوحدة ${unite.numero}: ${unite.titre}` : 'درس'}
            </p>
            <h1 className="truncate text-base font-bold">{titreLecon(lessonId)}</h1>
          </div>
          <div className="h-9 w-9" aria-hidden="true" />
        </header>

        <h2 className="font-naskh text-xl font-bold">مراحل المراجعة</h2>
        <p className="mt-1 text-xs leading-relaxed text-mute">
          اختر أي مرحلة تريد العودة إليها — لا شيء يُفقد، ولا مرحلة تُحذف.
        </p>

        <ol className="mt-4 space-y-2.5" dir="rtl">
          {PROTOCOLE.map((p) => {
            const faite = faites.includes(p.id) || p.id < phase.id;
            const actuelle = p.id === phase.id;
            const atteignable = p.id <= maxAtteint;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={!atteignable}
                  onClick={() => {
                    setIndex(p.id - 1);
                    setVue('phase');
                  }}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-right transition-colors ${
                    actuelle
                      ? 'border-forest bg-sage-soft'
                      : faite
                        ? 'border-line bg-paper'
                        : 'border-dashed border-line bg-cream/50'
                  } ${atteignable ? 'hover:bg-sage-soft' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      faite ? 'bg-forest text-paper' : 'bg-cream text-mute'
                    }`}
                  >
                    {enArabe(p.id)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{p.titre}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-mute">
                      {p.but} · {enArabe(p.dureeMin)} دقائق
                    </span>
                    {!atteignable && (
                      <span className="mt-1 block text-[11px] text-mute">
                        تُفتح بعد إنهاء المرحلة السابقة
                      </span>
                    )}
                  </span>
                  {actuelle && (
                    <span className="chip shrink-0 text-[10px]">الحالية</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        <button onClick={() => setVue('phase')} className="btn btn-primary mt-5 w-full text-base">
          العودة إلى المرحلة {enArabe(phase.id)} ←
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-6 pt-5">
      {/* رأس */}
      <header className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setVue('sommaire')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute transition-colors hover:bg-sage-soft"
            aria-label="العودة إلى مراحل المراجعة"
            title="العودة إلى مراحل المراجعة"
          >
            <span className="block h-5 w-5">
              <IcoRetour />
            </span>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[11px] text-mute">
              {unite ? `الوحدة ${unite.numero}: ${unite.titre}` : 'درس'}
            </p>
            <h1 className="truncate text-base font-bold">{titreLecon(lessonId)}</h1>
          </div>
          <div className="h-9 w-9" aria-hidden="true" />
        </div>

        {/* نقاط المراحل */}
        <div className="mt-4 flex items-center justify-between" dir="rtl">
          {PROTOCOLE.map((p) => {
            const faite = faites.includes(p.id) || p.id < phase.id;
            const actuelle = p.id === phase.id;
            return (
              <div key={p.id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    faite
                      ? 'bg-forest text-paper'
                      : actuelle
                        ? 'bg-sage text-forest-deep ring-2 ring-forest/40'
                        : 'bg-paper text-mute border border-line'
                  }`}
                >
                  {faite ? '✓' : p.id}
                </div>
                <span
                  className={`hidden text-[9px] leading-tight text-center sm:block ${
                    actuelle ? 'font-bold text-forest' : faite ? 'text-mute' : 'text-mute/60'
                  }`}
                >
                  {p.titre.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {/* بطاقة المرحلة */}
      <main key={phase.id} className="animate-pop-in card flex-1 p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-lg bg-sage px-2 py-0.5 text-[11px] font-bold text-forest-deep">
            المرحلة {phase.id} من 6
          </span>
          <span className="text-[11px] text-mute">الهدف: {phase.but}</span>
        </div>
        <h2 className="font-naskh text-xl font-bold">{phase.titre}</h2>

        <Minuteur
          secondes={secondes}
          enMarche={enMarche}
          onToggle={() => setEnMarche((m) => !m)}
          finMessage="انتهى وقت المرحلة — تابع بلطف، الوقت ليس سيّدك"
        />

        <p className="mt-4 rounded-2xl bg-cream/70 p-3 text-sm leading-relaxed text-ink-soft">
          {phase.instruction}
        </p>

        {/* محتوى المرحلة */}
        <div className="mt-5">
          {phase.id === 1 && qEtapes && (
            <div className="space-y-3">
              {questionLecon(lessonId) && (
                <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5">
                  <p className="text-[11px] font-bold text-[#6b5320]">سؤال الدرس</p>
                  <p className="mt-1.5 text-sm font-bold leading-relaxed">
                    {questionLecon(lessonId)}
                  </p>
                </div>
              )}
              <div className="rounded-2xl border border-sage bg-sage-soft p-3.5">
                <p className="text-[11px] font-bold text-forest">إشكالية الدرس</p>
                <p className="mt-1.5 text-sm font-bold leading-relaxed">{lecon.missionAr}</p>
              </div>
              <button
                type="button"
                onClick={onLireLecon}
                className="btn btn-primary w-full text-sm"
              >
                📖 افتح الدرس واقرأه كاملًا (من أوله إلى آخره)
              </button>
              <button
                onClick={() => setLectureFaite(true)}
                disabled={lectureFaite || !leconLue}
                className={`btn w-full text-sm ${
                  lectureFaite ? 'btn-gold' : 'btn-ghost border border-line'
                }`}
              >
                {lectureFaite
                  ? '✓ تمّت قراءة الدرس'
                  : aContenuLecon(lessonId)
                    ? 'أنهيتُ قراءة الدرس كاملًا ✓'
                    : 'راجعتُ الدرس في الكتاب الورقي ✓'}
              </button>
              {!lectureFaite && !leconLue && (
                <p className="rounded-xl border border-dashed border-line bg-cream/60 p-2.5 text-center text-xs leading-relaxed text-mute">
                  بوّابة القراءة: افتح الدرس أولًا واقرأه من أوله إلى آخره، ثم عُد إلى هنا.
                  لا يُفتح هذا الزر قبل ذلك.
                </p>
              )}
              {lectureFaite && (
                <p className="text-xs text-mute">
                  يتكوّن الدرس من {enArabe(lecon.mechanismAr.length)} خطوات سببية و{' '}
                  {enArabe(lecon.vocabulary.length)} كلمات مفتاحية. صفرها ذهنيًا الآن.
                </p>
              )}
              {lectureFaite && (
                <div className="space-y-2">
                  {lecon.mechanismAr.map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-cream/50 px-3 py-2.5"
                    >
                      <span className="text-xs font-bold text-mute">{i + 1}</span>
                      <span className="h-3 flex-1 rounded bg-line/70" />
                    </div>
                  ))}
                </div>
              )}
              {lectureFaite && (
                <p className="text-xs font-bold text-ink-soft">
                  بوّابة المرحلة: كم خطوة سببية في الدرس؟
                </p>
              )}
              {lectureFaite && (
                <OptionsMcq
                  nom="عدد الخطوات السببية"
                  options={qEtapes.options}
                  value={mcq}
                  onChange={(k) => {
                    setMcq(k);
                    if (k !== String(qEtapes.n)) {
                      const e = echecs + 1;
                      setEchecs(e);
                      if (e >= 2) setEchecMax(true);
                    }
                  }}
                />
              )}
              {echecs === 1 && !echecMax && (
                <p className="text-xs font-bold text-clay">ليست الإجابة — حاول مرة أخرى.</p>
              )}
              {echecMax && (
                <p className="text-xs font-bold text-clay">
                  الإجابة الصحيحة: {enArabe(qEtapes.n)} خطوات. سُجّلت هذه المرحلة كـ«هشّة» — لا بأس،
                  سنراجعها غدًا.
                </p>
              )}
            </div>
          )}

          {phase.id === 2 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-ink-soft">الكلمات المفتاحية — صنّف كل واحدة</p>
              <div className="space-y-2">
                {lecon.vocabulary.map((v) => {
                  const c = classes[v];
                  return (
                    <button
                      key={v}
                      onClick={() =>
                        setClasses((prev) => ({ ...prev, [v]: prev[v] === 'avant' ? 'nouveau' : 'avant' }))
                      }
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-colors ${
                        c === 'avant'
                          ? 'border-sage bg-sage-soft text-forest-deep'
                          : c === 'nouveau'
                            ? 'border-gold-soft bg-gold-soft/60 text-[#6b5320]'
                            : 'border-line bg-paper text-ink-soft'
                      }`}
                    >
                      <span>{v}</span>
                      <span className="text-[11px] font-bold">
                        {c === 'avant' ? 'مرتبطة بدرس سابق' : c === 'nouveau' ? 'جديدة' : 'اضغط للتصنيف'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs leading-relaxed text-mute">
                التي تعرفها من قبل هي الجسر، والتي لا تعرفها هي ثغرتك — ستركّز عليها في القراءة.
              </p>
            </div>
          )}

          {phase.id === 3 && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-sage bg-sage-soft p-3.5">
                <p className="text-[11px] font-bold text-forest">إشكالية الدرس</p>
                <p className="mt-1.5 text-sm font-bold leading-relaxed">{lecon.missionAr}</p>
              </div>
              <p className="text-xs font-bold text-ink-soft">
                بوّابة المرحلة: استرجع الجواب من ذاكرتك، اختره، ثم تحقّق — إن أخطأت أعد المحاولة.
              </p>
              {qcmLecon?.rappel && (
                <ChoixUnique
                  qcm={qcmLecon.rappel}
                  fait={qcmFait}
                  onValide={() => setQcmFait(true)}
                />
              )}
            </div>
          )}

          {phase.id === 4 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-ink-soft">
                الهيكل العظمي — {enArabe(lecon.mechanismAr.length)} صناديق سببية
              </p>
              <div className="space-y-2">
                {lecon.mechanismAr.map((etape, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-dashed border-line bg-cream/50 px-3 py-2.5"
                  >
                    <span className="text-xs font-bold text-mute">{i + 1}</span>
                    {revele ? (
                      <span className="text-sm leading-relaxed">{etape}</span>
                    ) : (
                      <span className="h-3 flex-1 rounded bg-line/70" />
                    )}
                  </div>
                ))}
              </div>
              {!revele && (
                <button
                  onClick={() => setRevele(true)}
                  className="btn btn-gold w-full"
                >
                  حاولتُ — اكشف الهيكل العظمي
                </button>
              )}
              {revele && (
                <p className="text-xs text-mute">
                  قارن هيكلك بهذا: ما الصندوق الذي نسيته؟ إنه ثغرتك الأولى — ستردمها في المرحلة 6.
                </p>
              )}
            </div>
          )}

          {phase.id === 5 && qSequence && (
            <div className="space-y-3">
              {aContenuLecon(lessonId) && (
                <button
                  type="button"
                  onClick={onLireLecon}
                  className="btn btn-ghost w-full text-sm"
                >
                  📖 أعد قراءة الدرس بانتباه للعلاقات (قراءة موجَّهة)
                </button>
              )}
              <div className="space-y-2">
                {lecon.mechanismAr.map((etape, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-line bg-cream/50 px-3 py-2.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-paper">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{etape}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-sage bg-sage-soft p-3.5">
                <p className="text-[11px] font-bold text-forest">الدليل الوثائقي — ما تُصنع به النقطة في البكالوريا</p>
                <p className="mt-1.5 text-sm leading-relaxed">{lecon.evidenceAr}</p>
              </div>
              <p className="text-xs font-bold text-ink-soft">
                بوّابة المرحلة: ما الخطوة التي تأتي مباشرة بعد الخطوة {qSequence.indice + 1}؟
              </p>
              <OptionsMcq
                nom="الخطوة التالية"
                options={qSequence.options}
                value={mcq}
                onChange={(k) => {
                  setMcq(k);
                  if (k !== qSequence.reponse) {
                    const e = echecs + 1;
                    setEchecs(e);
                    if (e >= 2) setEchecMax(true);
                  }
                }}
              />
              {echecs === 1 && !echecMax && (
                <p className="text-xs font-bold text-clay">ليست الإجابة — اقرأ الخطوات من جديد.</p>
              )}
              {echecMax && (
                <p className="text-xs font-bold text-clay">
                  الإجابة الصحيحة هي الخطوة {qSequence.indice + 2}. سُجّلت المرحلة كـ«هشّة» — سنراجعها
                  غدًا.
                </p>
              )}
            </div>
          )}

          {phase.id === 6 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-ink-soft">
                جملة البكالوريا — اقرأها، ثم اختر التكملة الصحيحة
              </p>
              <div className="rounded-2xl border border-line bg-cream/60 p-4 text-center text-base font-bold leading-loose">
                {lecon.bacSentenceFrameAr?.split('______').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="mx-1 inline-block min-w-[64px] border-b-2 border-dashed border-forest/60 pb-0.5 text-forest">
                        ‥‥‥
                      </span>
                    )}
                  </span>
                ))}
              </div>
              {qcmLecon?.synthese && (
                <ChoixUnique
                  qcm={qcmLecon.synthese}
                  fait={qcmFait}
                  onValide={() => setQcmFait(true)}
                />
              )}

              {qcmFait && (
                <>
                  <div className="rounded-2xl border border-clay-soft bg-clay-soft/50 p-3.5">
                    <p className="text-[11px] font-bold text-clay">الخطأ النووي الشائع — تصحيح ذرّي</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{lecon.commonErrorAr}</p>
                  </div>
                  <p className="text-xs font-bold text-ink-soft">قارن اختيارك بهذا الخطأ:</p>
                  <OptionsMcq
                    nom="التقييم الذاتي مقابل الخطأ النووي"
                    options={[
                      { key: 'plein', label: 'تجنّبته تمامًا' },
                      { key: 'partiel', label: 'فيه بعض الخلل' },
                      { key: 'non', label: 'لم أتجنّبه' },
                    ]}
                    value={auto}
                    onChange={(k) => setAuto(k as 'plein' | 'partiel' | 'non')}
                  />
                  {auto && auto !== 'plein' && (
                    <>
                      <p className="text-xs font-bold text-clay">نوع الثغرة (التشخيص):</p>
                      <OptionsMcq
                        nom="تشخيص الثغرة"
                        options={DIAGNOSTICS.map((d) => ({ key: d.id, label: d.ar }))}
                        value={diagnostic}
                        onChange={setDiagnostic}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* المُرشد: 4 لحظات فقط */}
        {PHASES_PARLANTES.has(phase.id) && (
          <div className="mt-5">
            <Morceau ton={phase.id === 6 ? 'gold' : 'sage'}>{phase.morchidAr}</Morceau>
          </div>
        )}

        <div className="mt-4">
          <ValveAide
            restant={aides}
            indice={phase.indiceAr}
            onUtiliser={() => setAides((a) => a - 1)}
          />
        </div>
      </main>

      {/* أزرار التنقل — لا تخطّي */}
      <footer className="mt-4">
        <button
          onClick={phaseSuivante}
          disabled={!verrouPasse()}
          className="btn btn-primary w-full text-base"
        >
          {index === PROTOCOLE.length - 1 ? 'إنهاء الدرس ✓' : 'انتهيت من هذه المرحلة'}
        </button>
        {!verrouPasse() && (
          <p className="mt-2 text-center text-xs text-mute">البوّابة: {phase.verrouAr}</p>
        )}
      </footer>

    </div>
  );
}

// شاشة الاحتفال — عند إنهاء كل مرحلة يخرج شخصية «كنز العلوم» يصفّق ويشجّع،
// مع ألعاب نارية وصوت تصفيق (Web Audio، بلا ملفات) والملخّص الذهبي جاهزًا للطباعة
// والحفظ. لا نسبة، لا عدّ تنازلي، لا لوم — تشجيع فقط ثم متابعة الباقي.

import { useEffect, useRef } from 'react';
import type { LessonGoldSummary } from '../data/lessonGoldSummaries';
import { nb } from '../utils/dates';
import { sonApplaudissement } from '../utils/son';

// ───────────── الشخصية: كنز العلوم (شخصية مرسومة داخل SVG — تعمل دون إنترنت) ─────────────

export function PersonnageKunz({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 300" className={className} role="img" aria-label="شخصية كنز العلوم">
      <title>شخصية كنز العلوم</title>

      {/* ظلّ الأرض */}
      <ellipse cx="120" cy="284" rx="68" ry="9" fill="#143d2e" opacity="0.14" />

      {/* الذراع المرفوعة يلوّح (خلف الجسم) */}
      <g className="bras-salue">
        <path
          d="M164 190 C198 184 214 152 210 118"
          fill="none"
          stroke="#e4d9c5"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path
          d="M164 190 C198 184 214 152 210 118"
          fill="none"
          stroke="#fbf8f1"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <circle cx="209" cy="108" r="16" fill="#e8b98f" stroke="#d9a377" strokeWidth="3" />
      </g>

      {/* الرقبة */}
      <rect x="106" y="148" width="28" height="36" rx="13" fill="#e0a87e" />

      {/* الجسم: معطف المختبر */}
      <path
        d="M120 176 C96 176 78 186 72 206 C64 232 62 258 64 282 L176 282 C178 258 176 232 168 206 C162 186 144 176 120 176 Z"
        fill="#fbf8f1"
        stroke="#e4d9c5"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* قميص أخضر تحت المعطف */}
      <path d="M104 178 L120 214 L136 178 Z" fill="#1f5c45" />
      {/* خطّ فتح المعطف والأزرار */}
      <line x1="120" y1="214" x2="120" y2="282" stroke="#e4d9c5" strokeWidth="3" />
      <circle cx="128" cy="236" r="3.5" fill="#9a7a2c" />
      <circle cx="128" cy="258" r="3.5" fill="#9a7a2c" />
      {/* شارة ADN صغيرة على الجيب */}
      <g stroke="#1f5c45" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M150 224 C160 232 146 244 156 252" />
        <path d="M156 224 C146 232 160 244 150 252" />
        <line x1="151" y1="231" x2="155" y2="231" />
        <line x1="151" y1="245" x2="155" y2="245" />
      </g>

      {/* الذراع الماثلة يحمل كتابًا */}
      <path
        d="M84 196 C70 216 68 244 76 264"
        fill="none"
        stroke="#e4d9c5"
        strokeWidth="28"
        strokeLinecap="round"
      />
      <path
        d="M84 196 C70 216 68 244 76 264"
        fill="none"
        stroke="#fbf8f1"
        strokeWidth="22"
        strokeLinecap="round"
      />
      {/* الكتاب الذهبي */}
      <g>
        <rect x="42" y="252" width="68" height="40" rx="6" fill="#9a7a2c" />
        <rect x="47" y="257" width="58" height="30" rx="3" fill="#f3e6c4" />
        <line x1="76" y1="257" x2="76" y2="287" stroke="#9a7a2c" strokeWidth="2.5" />
        <line x1="54" y1="266" x2="69" y2="266" stroke="#9a7a2c" strokeWidth="2" opacity="0.55" />
        <line x1="54" y1="274" x2="69" y2="274" stroke="#9a7a2c" strokeWidth="2" opacity="0.55" />
      </g>
      {/* اليد تمسك الكتاب */}
      <circle cx="78" cy="254" r="13" fill="#e8b98f" stroke="#d9a377" strokeWidth="3" />

      {/* الرأس */}
      <circle cx="120" cy="104" r="54" fill="#e8b98f" stroke="#d9a377" strokeWidth="3" />
      <circle cx="66" cy="110" r="9" fill="#e8b98f" stroke="#d9a377" strokeWidth="3" />
      <circle cx="174" cy="110" r="9" fill="#e8b98f" stroke="#d9a377" strokeWidth="3" />
      {/* الشعر */}
      <path
        d="M66 100 C66 62 88 44 120 44 C152 44 174 62 174 100 C166 80 150 70 120 70 C90 70 74 80 66 100 Z"
        fill="#3a342c"
      />
      {/* الحاجبان */}
      <g stroke="#3a342c" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M88 84 Q99 78 110 83" />
        <path d="M130 83 Q141 78 152 84" />
      </g>
      {/* النظّارة */}
      <g fill="none" stroke="#1f5c45" strokeWidth="4">
        <circle cx="99" cy="104" r="16" />
        <circle cx="141" cy="104" r="16" />
        <path d="M115 104 h10" />
        <path d="M83 102 L71 106" />
        <path d="M157 102 L169 106" />
      </g>
      {/* العينان */}
      <circle cx="99" cy="105" r="4.5" fill="#1c1914" />
      <circle cx="141" cy="105" r="4.5" fill="#1c1914" />
      {/* الأنف والابتسامة والخدّان */}
      <path
        d="M120 112 Q125 122 118 125"
        fill="none"
        stroke="#d9a377"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M102 132 Q120 146 138 132"
        fill="none"
        stroke="#8a5a3c"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <ellipse cx="84" cy="126" rx="8" ry="5" fill="#d98a5f" opacity="0.4" />
      <ellipse cx="156" cy="126" rx="8" ry="5" fill="#d98a5f" opacity="0.4" />
    </svg>
  );
}

// ───────────── الألعاب النارية (canvas خفيف، بلا مكتبات) ─────────────

const COULEURS_FETE = ['#34d399', '#a7f3d0', '#fbbf24', '#f59e0b', '#ecfeff', '#f3e6c4'];

function FeuxArtifice() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const c2d = cv.getContext('2d');
    if (!c2d) return;
    const canvas: HTMLCanvasElement = cv;
    const ctx: CanvasRenderingContext2D = c2d;
    const doux =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let largeur = 0;
    let hauteur = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function redim() {
      largeur = canvas.clientWidth || window.innerWidth;
      hauteur = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.round(largeur * dpr));
      canvas.height = Math.max(1, Math.round(hauteur * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    redim();
    window.addEventListener('resize', redim);

    interface Etincelle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      vie: number;
      max: number;
      c: string;
    }
    const etincelles: Etincelle[] = [];
    const debut = performance.now();
    let dernierLancement = 0;

    function eclater() {
      const x = largeur * (0.12 + Math.random() * 0.76);
      const y = hauteur * (0.1 + Math.random() * 0.45);
      const c = COULEURS_FETE[Math.floor(Math.random() * COULEURS_FETE.length)];
      const n = 26 + Math.floor(Math.random() * 22);
      const force = 2.2 + Math.random() * 2.4;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const v = force * (0.55 + Math.random() * 0.65);
        etincelles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          vie: 0,
          max: 55 + Math.random() * 40,
          c,
        });
      }
    }

    function boucle(t: number) {
      ctx.clearRect(0, 0, largeur, hauteur);
      const ecoule = t - debut;
      if (!doux && ecoule < 5000 && t - dernierLancement > 430) {
        dernierLancement = t;
        eclater();
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = etincelles.length - 1; i >= 0; i--) {
        const e = etincelles[i];
        e.vie++;
        e.vy += 0.045;
        e.vx *= 0.985;
        e.vy *= 0.985;
        e.x += e.vx;
        e.y += e.vy;
        const alpha = Math.max(0, 1 - e.vie / e.max);
        if (alpha <= 0) {
          etincelles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = e.c;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // انتهت الألعاب: نوقف الحلقة حتى لا تُستهلك البطارية
      if (ecoule > 5200 && etincelles.length === 0) return;
      raf = requestAnimationFrame(boucle);
    }
    raf = requestAnimationFrame(boucle);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', redim);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

// ───────────── شاشة الاحتفال ─────────────

interface Props {
  lecon: LessonGoldSummary;
  titre: string;
  numero: number;
  total: number;
  derniere: boolean;
  onContinuer: () => void;
}

export default function EcranCelebration({
  lecon,
  titre,
  numero,
  total,
  derniere,
  onContinuer,
}: Props) {
  // التصفيق يبدأ لحظة ظهور الشاشة (紧接着 نقرة التلميذ — مسموح بتشغيل الصوت)
  useEffect(() => {
    sonApplaudissement();
  }, []);

  return (
    <div className="ecran-fete fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#0b2a1f] via-forest-deep to-forest">
      <FeuxArtifice />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* بطاقة الاحتفال */}
        <div className="animate-pop-in rounded-3xl border border-gold-soft/50 bg-paper/95 p-6 text-center shadow-2xl">
          <PersonnageKunz className="animate-salue mx-auto h-44 w-auto" />

          <p className="eyebrow mt-3 text-gold">
            أنهيتَ المرحلة {nb(numero)} من {nb(total)}
          </p>
          <h1 className="font-naskh mt-1.5 text-2xl font-bold text-forest-deep">
            {derniere ? 'أنهيتَ الدرس كاملًا!' : 'أحسنت — واصِل، الباقي أقرب ممّا تظن'}
          </h1>

          {/* فقاعة كلام الشخصية */}
          <div className="relative mx-auto mt-4 w-fit max-w-sm rounded-2xl border border-sage bg-sage-soft px-4 py-3">
            <span className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-t border-l border-sage bg-sage-soft" />
            <p className="text-sm font-bold leading-relaxed text-forest-deep">
              {derniere
                ? 'أنا فخور بك! هذه ثروتك نحو البكالوريا — اطبع الملخّص الذهبي واحفظه، وسنراجعه معًا.'
                : 'تصفيق لك! كل مرحلة تُنجزها تبني استعدادك — خذ نفسًا ثم تابع بقية المراحل، أنا معك.'}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <button onClick={onContinuer} className="btn btn-primary w-full text-base">
              {derniere ? 'إنهاء الدرس ←' : `متابعة ← المرحلة ${nb(numero + 1)}`}
            </button>
            <button onClick={() => window.print()} className="btn btn-ghost w-full">
              🖨️ اطبع الملخّص الذهبي لاحفظه
            </button>
          </div>
        </div>

        {/* الملخّص الذهبي — هذا ما يُطبع وحده */}
        <section
          id="zone-impression"
          className="mt-4 rounded-3xl border border-gold-soft bg-paper p-5 text-right shadow-xl"
        >
          <div className="mb-4 border-b-2 border-gold-soft pb-3 text-center">
            <p className="text-[11px] font-bold tracking-wide text-gold">كنز العلوم Lite</p>
            <h2 className="font-naskh mt-1 text-xl font-bold text-forest-deep">
              الملخّص الذهبي · {titre}
            </h2>
          </div>

          <section>
            <p className="eyebrow">إشكالية الدرس</p>
            <p className="mt-1.5 text-sm font-bold leading-relaxed text-ink">{lecon.missionAr}</p>
          </section>

          <section className="mt-5">
            <p className="eyebrow">السلسلة السببية للدرس</p>
            <ol className="mt-2 space-y-2">
              {lecon.mechanismAr.map((etape, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-2xl border border-line bg-cream/60 p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-paper">
                    {nb(i + 1)}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-soft">{etape}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-5">
            <p className="eyebrow">الدليل الوثائقي</p>
            <p className="mt-1.5 rounded-2xl border border-sage bg-sage-soft p-3 text-sm leading-relaxed text-forest-deep">
              {lecon.evidenceAr}
            </p>
          </section>

          {lecon.bacSentenceFrameAr && (
            <section className="mt-5">
              <p className="eyebrow">بنية الإجابة في البكالوريا</p>
              <p className="mt-1.5 rounded-2xl border border-line bg-cream/60 p-3 text-sm leading-relaxed text-ink-soft">
                {lecon.bacSentenceFrameAr}
              </p>
            </section>
          )}

          <section className="mt-5">
            <p className="eyebrow">الخطأ الشائع</p>
            <p className="mt-1.5 rounded-2xl border border-clay-soft bg-clay-soft/50 p-3 text-sm leading-relaxed text-clay">
              {lecon.commonErrorAr}
            </p>
          </section>

          <section className="mt-5">
            <p className="eyebrow">سؤال الاسترجاع</p>
            <p className="mt-1.5 text-sm font-bold leading-relaxed text-ink">
              {lecon.recallQuestionAr}
            </p>
          </section>

          <section className="mt-5">
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
        </section>
      </div>
    </div>
  );
}

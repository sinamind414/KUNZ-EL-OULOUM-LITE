// شاشة الإقلاع — فيديو افتتاحي «كنز العلوم» (صامت) ثم زر البدء.
// يُظهر مرة واحدة عند فتح التطبيق (مفتاح sessionStorage)، ثم يختفي بلطف.

import { useEffect, useRef, useState } from 'react';

interface Props {
  onTerminer: () => void;
}

export default function EcranDemarrage({ onTerminer }: Props) {
  const [phase, setPhase] = useState<'video' | 'fin'>('video');
  const [enSortie, setEnSortie] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  function afficherFin() {
    setPhase((p) => (p === 'fin' ? p : 'fin'));
  }

  // محاولة تشغيل الفيديو (الصمت مسموح بالتشغيل التلقائي عادةً، لكن قد يفشل
  // إذا لم يكن التبويب نشطًا بعد → نعيد المحاولة عند التركيز/التفاعل).
  function essayerLecture() {
    const v = videoRef.current;
    if (!v) return;
    void v.play().catch(() => {
      /* سنحاول مجددًا عند حدث التركيز أو التحميل */
    });
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onEnded = () => afficherFin();
    const onCanPlay = () => essayerLecture();

    v.addEventListener('ended', onEnded, { once: true });
    v.addEventListener('canplay', onCanPlay, { once: true });
    v.addEventListener('loadeddata', onCanPlay, { once: true });

    essayerLecture();

    // إعادة المحاولة عند تفعيل التبويب (حالات فشل التشغيل التلقائي)
    const onFocus = () => essayerLecture();
    window.addEventListener('focus', onFocus);

    // احتياطي: إن لم يُطلِق الفيديو حدث النهاية (تشغيل محظور تمامًا)
    const t = setTimeout(afficherFin, 6500);

    return () => {
      clearTimeout(t);
      window.removeEventListener('focus', onFocus);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('loadeddata', onCanPlay);
    };
  }, []);

  function terminer() {
    if (enSortie) return;
    setEnSortie(true);
    setTimeout(onTerminer, 600);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black transition-opacity duration-600 ${
        enSortie ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={phase === 'video' ? afficherFin : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') && (phase === 'video' ? afficherFin() : terminer())
      }
      aria-label="كنز العلوم Lite — اضغط للمتابعة"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        autoPlay
        muted
        playsInline
        preload="auto"
        onClick={phase === 'video' ? afficherFin : undefined}
        aria-hidden="true"
      >
        <source src="/ouverture.mp4" type="video/mp4" />
      </video>

      {phase === 'video' && (
        <p className="pointer-events-none absolute bottom-8 animate-pulse text-xs font-medium text-white/55">
          اضغط للمتابعة
        </p>
      )}

      {phase === 'fin' && (
        <div className="relative z-10 flex flex-col items-center px-6">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl"
            style={{ width: '70vmin', height: '70vmin' }}
          />
          <h1
            className="relative text-center text-4xl font-extrabold tracking-tight text-gold-soft drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] md:text-5xl kunz-entre"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.85)' }}
          >
            كنز العلوم
            <span className="ms-2 align-middle text-2xl font-bold text-sage md:text-3xl">Lite</span>
          </h1>

          <p className="relative mt-2 text-sm font-medium text-sage/90 kunz-entre md:text-base">
            مراجعة البكالوريا — علوم الطبيعة والحياة
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              terminer();
            }}
            className="relative mt-10 rounded-full bg-gold px-10 py-3.5 text-base font-bold text-forest-deep shadow-lg shadow-black/40 transition active:scale-95 kunz-entre"
          >
            ابدأ ←
          </button>
        </div>
      )}

      <style>{`
        .kunz-entre {
          opacity: 0;
          animation: kunzApparait 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes kunzApparait {
          from { opacity: 0; transform: translateY(18px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

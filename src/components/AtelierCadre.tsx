// إطار الورشات الثلاث: رأس موحّد (رجوع + عنوان + فتح الدرس) + نقاط التقدّم.
// مكتوب مرة واحدة حتى تبقى الورشات متطابقة بصريًا وسلوكيًا.

import type { ReactNode } from 'react';
import { IcoCarnet, IcoRetour } from './Icones';

interface CadreProps {
  surtitre: string;
  titre: string;
  onFermer: () => void;
  /** فتح الدرس المرتبط بالورشة داخل القارئ (بدون فقدان تقدّم الورشة). */
  onVoirLecon?: () => void;
  etapes?: { total: number; courante: number };
  /** classes de la carte principale (animation éventuelle) */
  carte?: string;
  children: ReactNode;
}

export function CadreAtelier({
  surtitre,
  titre,
  onFermer,
  onVoirLecon,
  etapes,
  carte = 'card p-5',
  children,
}: CadreProps) {
  return (
    <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl">
      <header className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          onClick={onFermer}
          aria-label="رجوع"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-mute"
        >
          <span className="block h-5 w-5">
            <IcoRetour />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{surtitre}</p>
          <h1 className="font-naskh truncate text-xl font-bold">{titre}</h1>
        </div>
        {onVoirLecon && (
          <button
            onClick={onVoirLecon}
            aria-label="افتح الدرس"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-paper px-3 text-xs font-bold text-forest"
          >
            <span className="block h-4 w-4">
              <IcoCarnet />
            </span>
            <span className="hidden sm:inline">الدرس</span>
          </button>
        )}
      </header>

      <div className="mx-auto mt-5 max-w-3xl">
        {etapes && <PointsEtape total={etapes.total} courante={etapes.courante} />}
        <main className={`${carte} mt-5`}>{children}</main>
      </div>
    </div>
  );
}

/** نقاط التقدّم — بلا أرقام ولا نِسَب مئوية (قاعدة عدم التوتّر). */
export function PointsEtape({ total, courante }: { total: number; courante: number }) {
  return (
    <div className="mb-5 flex gap-2" aria-label="مراحل الورشة">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 flex-1 rounded-full ${i < courante ? 'bg-forest' : 'bg-line'}`}
        />
      ))}
    </div>
  );
}

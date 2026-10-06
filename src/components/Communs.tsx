// عناصر مشتركة — صندوق المُرشد، خيارات الاختيار، الحقول، المؤقّت اللطيف، درج التدوين

import { useState, type ReactNode } from 'react';
import type { QcmLecon } from '../data/qcmLecons';
import { noterReponse, type SourceReponse } from '../utils/stats';
import { IcoAide } from './Icones';

// ───────────── كلام المُرشد (لحظات محددة فقط) ─────────────
export function Morceau({ children, ton = 'sage' }: { children: ReactNode; ton?: 'sage' | 'gold' }) {
  const styles =
    ton === 'gold'
      ? 'border-gold-soft bg-gold-soft/60 text-[#6b5320]'
      : 'border-sage bg-sage-soft text-forest-deep';
  return (
    <div className={`flex gap-3 rounded-2xl border p-3.5 ${styles}`}>
      <span className="mt-0.5 text-base">🌿</span>
      <p className="text-sm font-semibold leading-relaxed">{children}</p>
    </div>
  );
}

// ───────────── خيارات الاختيار (radio group) ─────────────
export function OptionsMcq({
  options,
  value,
  onChange,
  nom,
  disabled,
}: {
  options: { key: string; label: string }[];
  value: string | null;
  onChange: (key: string) => void;
  nom: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 grid gap-2" role="radiogroup" aria-label={nom}>
      {options.map((o) => {
        const choisi = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={choisi}
            disabled={disabled}
            onClick={() => onChange(o.key)}
            className={`rounded-2xl border px-4 py-3 text-right text-sm font-semibold transition-colors disabled:opacity-50 ${
              choisi
                ? 'border-forest bg-sage text-forest-deep'
                : 'border-line bg-paper text-ink-soft hover:border-sage'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ───────────── اختيار من متعدد: اختيار → تحقّق → إعادة المحاولة حتى الإصابة ─────────────
// لا كتابة، لا نسبة مئوية. الجواب الصحيح أول عنصر في `options`.
// المحاولات يقيسها المُرشد جانبيًا (utils/stats) بلا ضغط وبلا كشف للجواب.
function melanger(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export function ChoixUnique({
  qcm,
  fait,
  onValide,
  source,
}: {
  qcm: QcmLecon;
  fait?: boolean;
  onValide: () => void;
  source: SourceReponse;
}) {
  const [ordre, setOrdre] = useState<number[]>(() => melanger(qcm.options.length));
  const [choix, setChoix] = useState<number | null>(null);
  const [erreur, setErreur] = useState(false);
  const [juste, setJuste] = useState(Boolean(fait));

  if (juste) {
    return (
      <div className="rounded-2xl border border-forest bg-sage p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-forest-deep">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest text-paper">
            ✓
          </span>
          إجابة صحيحة
        </p>
        <p className="mt-2 text-sm leading-relaxed text-forest-deep">{qcm.explication}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold leading-relaxed text-ink">{qcm.question}</p>
      <div className="grid gap-2" role="radiogroup" aria-label="اختر الجواب الصحيح">
        {ordre.map((idx, pos) => {
          const choisi = choix === pos;
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={choisi}
              onClick={() => {
                setChoix(pos);
                setErreur(false);
              }}
              className={`rounded-2xl border px-4 py-3.5 text-right text-sm font-semibold transition-colors ${
                choisi
                  ? 'border-forest bg-sage text-forest-deep'
                  : 'border-line bg-paper text-ink-soft hover:border-sage'
              }`}
            >
              {qcm.options[idx]}
            </button>
          );
        })}
      </div>
      {erreur && (
        <p className="text-sm font-bold text-clay">ليس الجواب الصحيح — أعد المحاولة. خذ وقتك، لا عجلة.</p>
      )}
      <button
        onClick={() => {
          if (choix === null) return;
          if (choix === ordre.indexOf(0)) {
            noterReponse(source, true);
            setJuste(true);
            setErreur(false);
            onValide();
          } else {
            noterReponse(source, false);
            setErreur(true);
            setOrdre(melanger(qcm.options.length));
            setChoix(null);
          }
        }}
        disabled={choix === null}
        className="btn btn-primary w-full"
      >
        تحقّق
      </button>
    </div>
  );
}

// ───────────── مؤقّت لطيف: لا عدّ تنازلي حادّ، لا لون أحمر ─────────────
export function Minuteur({
  secondes,
  enMarche,
  onToggle,
  finMessage,
}: {
  secondes: number;
  enMarche: boolean;
  onToggle: () => void;
  finMessage: string;
}) {
  const t = `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-paper/70 p-3">
      <span className="font-science text-3xl font-black tabular-nums text-forest">{t}</span>
      <div className="flex-1">
        <p className="text-[11px] text-mute">
          {secondes === 0 ? finMessage : 'الوقت المخصص لهذه المرحلة — يمكنك إيقافه'}
        </p>
      </div>
      <button
        onClick={onToggle}
        disabled={secondes === 0}
        className={`btn text-sm ${enMarche ? 'btn-ghost' : 'btn-primary'}`}
      >
        {enMarche ? 'إيقاف' : 'بدء'}
      </button>
    </div>
  );
}

// ───────────── زرّ صمّام «أنا عالق» ─────────────
export function ValveAide({
  restant,
  indice,
  onUtiliser,
}: {
  restant: number;
  indice: string;
  onUtiliser: () => void;
}) {
  const [revele, setRevele] = useState(false);
  if (restant <= 0) {
    return (
      <p className="mt-3 text-xs text-mute">
        استعملت تلميحي هذه المرحلة. حاول بنفسك الآن — ثم اكشف.
      </p>
    );
  }
  if (!revele) {
    return (
      <button
        onClick={() => {
          setRevele(true);
          onUtiliser();
        }}
        className="mt-3 flex items-center gap-2 text-sm font-bold text-clay"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-clay-soft">
          <span className="block h-3.5 w-3.5">
            <IcoAide />
          </span>
        </span>
        أنا عالق ({restant} متبقّي)
      </button>
    );
  }
  return <Morceau ton="gold">{indice}</Morceau>;
}

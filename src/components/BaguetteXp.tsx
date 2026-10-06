// شارة الخبرة (XP) وسُلّم الأيام المتتالية — أعلى يسار الشاشة.
// أرقام بالحروف العربية، بلا نسبة مئوية، وبلا عرض «خسارة سلسلة» (القاعدة المضادة للقلق).

import { useEffect, useRef, useState } from 'react';
import type { Etat } from '../types';
import { nb, joursNb } from '../utils/dates';
import { WILAYA_PAR_CODE } from '../data/wilayas';
import { VALEURS, joursConsecutifs, niveauDe, xpDe, xpTexte } from '../utils/xp';

interface Props {
  etat: Etat;
  onDeconnexion?: () => void;
}

// آخر قيمة XP عُرضت (في مستوى الوحدة — تبقى بعد إخفاء الشارة أو إعادة تركيبها)
let dernierXpVu: number | null = null;

export default function BaguetteXp({ etat, onDeconnexion }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [gain, setGain] = useState<string | null>(null);
  const xp = xpDe(etat);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  // وميض خفيف عند ربح نقاط — بلا ضغط ولا صوت.
  // القيمة تبقى في مستوى الوحدة حتى لو اختفت الشارة داخل وضع كامل الشاشة.
  useEffect(() => {
    const av = dernierXpVu;
    dernierXpVu = xp;
    if (av === null || xp <= av) return;
    setGain(`+ ${xpTexte(xp - av)}`);
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setGain(null), 2800);
    return () => {
      if (minuteur.current) clearTimeout(minuteur.current);
    };
  }, [xp]);

  const jours = joursConsecutifs(etat.journal);
  const niveau = niveauDe(xp);
  const wilaya = etat.compte ? WILAYA_PAR_CODE[etat.compte.wilaya] : undefined;

  const phases = Object.values(etat.progression).reduce((s, p) => s + p.phases.length, 0);
  const lecons = Object.values(etat.progression).filter((p) => p.statut === 'terminee').length;
  const jalons = Object.values(etat.jalons).filter((j) => j.fait).length;
  const ateliers = Object.values(etat.ateliers ?? {}).filter((a) => a.fait).length;
  const drills = Object.keys(etat.drills ?? {}).length;

  const lignes: { label: string; valeur: string }[] = [
    { label: 'مراحل مُنجزة', valeur: `${nb(phases)} × ${nb(VALEURS.phase)}` },
    { label: 'دروس مُتمّمة', valeur: `${nb(lecons)} × ${nb(VALEURS.lecon)}` },
    { label: 'جسور مكتوبة', valeur: `${nb(jalons)} × ${nb(VALEURS.jalon)}` },
    { label: 'ورشات منجزة', valeur: `${nb(ateliers)} × ${nb(VALEURS.atelier)}` },
    { label: 'تدريبات مُجابة', valeur: `${nb(drills)} × ${nb(VALEURS.drill)}` },
    {
      label: 'تركيز مسجّل',
      valeur: `${nb(Math.floor(etat.minutesTotales / 30))} × ${nb(VALEURS.demiHeure)}`,
    },
  ];

  return (
    <div className="fixed left-3 top-3 z-40">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-label="نقاط الخبرة وأيام النشاط"
        className="flex items-center gap-2.5 rounded-2xl border border-gold/45 bg-forest-deep/95 px-3 py-2 text-start shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur transition active:scale-[0.97]"
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-[#c9a24a] text-sm"
          aria-hidden="true"
        >
          ⚡
        </span>
        <span className="leading-tight">
          <span className="block max-w-[7.5rem] text-[13px] font-black text-gold-soft">
            {xpTexte(xp)}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-sage/90">
            <span>{jours > 0 ? `🔥 ${joursNb(jours)}` : '🔥 ابدأ اليوم'}</span>
            <span className="text-[9px] text-sage/70" aria-hidden="true">
              {ouvert ? '▲' : '▼'}
            </span>
          </span>
        </span>
      </button>

      {gain && (
        <span className="animate-pop-in pointer-events-none absolute left-0 top-full mt-1.5 rounded-full border border-gold/50 bg-gold-soft px-2.5 py-1 text-[11px] font-black text-[#6b5320] shadow-lg">
          {gain}
        </span>
      )}

      {ouvert && (
        <div className="animate-pop-in absolute left-0 top-full mt-2 w-[19rem] rounded-3xl border border-line bg-paper p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-forest text-lg font-black text-paper">
              {(etat.compte?.email ?? '؟').trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{etat.compte?.email ?? 'بدون حساب'}</p>
              <p className="truncate text-[11px] text-mute">
                {wilaya ? `${wilaya.nom} — ${etat.compte?.daira}` : 'لم تُحدَّد الولاية بعد'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip text-[11px] font-bold text-forest-deep">{niveau.nom}</span>
            <span className="chip text-[11px] font-bold text-forest-deep">
              🔥 {joursNb(jours)}
            </span>
            <span className="chip text-[11px] font-bold text-[#6b5320]">{xpTexte(xp)}</span>
          </div>

          <p className="eyebrow mt-4">من أين تأتي نقاطك</p>
          <ul className="mt-2 space-y-1.5">
            {lignes.map((l) => (
              <li key={l.label} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-mute">{l.label}</span>
                <span className="font-bold text-ink-soft">{l.valeur}</span>
              </li>
            ))}
          </ul>

          {onDeconnexion && (
            <button
              type="button"
              onClick={() => {
                setOuvert(false);
                onDeconnexion();
              }}
              className="btn btn-ghost mt-4 w-full text-sm"
            >
              تسجيل الخروج
            </button>
          )}
        </div>
      )}
    </div>
  );
}

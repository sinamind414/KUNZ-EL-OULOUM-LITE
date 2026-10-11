interface Props {
  message: string;
  compact?: boolean;
  tone?: 'forest' | 'gold' | 'paper';
}

/**
 * القبطان مفتاح — le guide pédagogique de كنز العلوم Lite (port des commits arena
 * e73a484/41b5695, adapté maison) : la mascotte est personnage-pirate.png (convention
 * de la maison), pas le logo.
 */
export default function MascotteKunz({ message, compact = false, tone = 'forest' }: Props) {
  const tones = {
    forest: 'border-sage bg-sage-soft text-forest-deep',
    gold: 'border-gold-soft bg-gold-soft/60 text-[#6b5320]',
    paper: 'border-line bg-paper text-ink',
  };
  return (
    <div
      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 shadow-[0_6px_18px_-14px_rgba(20,61,46,0.5)] ${tones[tone]}`}
      dir="rtl"
    >
      {/* هالة ذهبية خفيفة تتبع الشخصية */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-6 h-20 w-20 rounded-full bg-gold/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-70"
        style={{ insetInlineStart: '0.25rem' }}
      />
      <img
        src="/personnage-pirate.png"
        alt="مستكشف كنز العلوم"
        className={`${
          compact ? 'h-14 w-14' : 'h-20 w-20'
        } relative shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105`}
      />
      <div className="relative min-w-0 flex-1">
        <p className="text-[10px] font-extrabold tracking-wide opacity-70">
          القبطان مفتاح · كنز العلوم
        </p>
        <p className={`${compact ? 'text-xs' : 'text-sm'} mt-1 font-bold leading-relaxed`}>
          {message}
        </p>
      </div>
    </div>
  );
}

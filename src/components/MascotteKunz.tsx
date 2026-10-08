interface Props {
  message: string;
  compact?: boolean;
  tone?: 'forest' | 'gold' | 'paper';
}

export default function MascotteKunz({ message, compact = false, tone = 'forest' }: Props) {
  const tones = {
    forest: 'border-sage bg-sage-soft text-forest-deep',
    gold: 'border-gold-soft bg-gold-soft/60 text-[#6b5320]',
    paper: 'border-line bg-paper text-ink',
  };
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${tones[tone]}`} dir="rtl">
      <img
        src="/logo.png"
        alt="مستكشف كنز العلوم"
        className={`${compact ? 'h-14 w-14' : 'h-20 w-20'} shrink-0 object-contain`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-wide opacity-70">القبطان مفتاح · كنز العلوم</p>
        <p className={`${compact ? 'text-xs' : 'text-sm'} mt-1 font-bold leading-relaxed`}>{message}</p>
      </div>
    </div>
  );
}

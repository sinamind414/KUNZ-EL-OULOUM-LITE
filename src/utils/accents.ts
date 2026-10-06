// ألوان المجالات الثلاثة على الخلفية الكريمية

export interface Accent {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  dot: string;
}

export const ACCENTS: Record<string, Accent> = {
  forest: {
    text: 'text-forest',
    bg: 'bg-forest',
    bgSoft: 'bg-sage-soft',
    border: 'border-sage',
    dot: 'bg-forest',
  },
  gold: {
    text: 'text-[#8a6a1e]',
    bg: 'bg-[#9a7a2c]',
    bgSoft: 'bg-gold-soft',
    border: 'border-gold-soft',
    dot: 'bg-[#9a7a2c]',
  },
  clay: {
    text: 'text-clay',
    bg: 'bg-clay',
    bgSoft: 'bg-clay-soft',
    border: 'border-clay-soft',
    dot: 'bg-clay',
  },
};

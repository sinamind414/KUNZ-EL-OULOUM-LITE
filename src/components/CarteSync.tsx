// بطاقة المزامنة — إعداد دائم في «أنا». تختفي تمامًا إذا لم تُفعَّل المزامنة (لا مفاتيح Supabase).
// المزامنة مفعّلة افتراضيًّا من إنشاء الحساب؛ هذه البطاقة هي مخرج التلميذ إن رغب.

import { consentementEtat, syncActive } from '../utils/sync';
import type { Etat } from '../types';

interface Props {
  etat: Etat;
  onChoix: (ok: boolean) => void;
}

// الإعداد الدائم — يُظهر الحالة الحالية ويزرّ التبديل.
export function ReglageSync({ etat, onChoix }: Props) {
  if (!syncActive()) return null;
  const c = consentementEtat(etat);
  return (
    <section className="card mt-5 p-5">
      <p className="eyebrow">المزامنة مع المطوّر</p>
      <p className="mt-2 text-xs leading-relaxed text-mute">
        {c === 'oui'
          ? 'يُرسَل ملخّص تقدّمك دوريًّا في الخلفية عند توفّر الإنترنت. لا كلمات مرور ولا ملاحظات شخصية، وتُحفَظ كل بياناتك على هاتفك أولًا.'
          : 'لن يُرسَل شيء أبدًا. تقدّمك يبقى على هاتفك وحدك — وهذا حقّك كاملًا.'}
      </p>
      <button
        onClick={() => onChoix(c !== 'oui')}
        className={`btn mt-4 w-full text-sm ${c === 'oui' ? 'btn-ghost' : 'btn-primary'}`}
      >
        {c === 'oui' ? 'إيقاف المزامنة' : 'تفعيل المزامنة'}
      </button>
    </section>
  );
}

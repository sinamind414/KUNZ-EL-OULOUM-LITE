// بطاقة المزامنة — دعوة لمرة واحدة في «اليوم»، وإعداد دائم في «أنا».
// تختفي تمامًا إذا لم تُفعَّل المزامنة (لا مفاتيح Supabase) أو رفض التلميذ.

import { consentementEtat, syncActive } from '../utils/sync';
import type { Etat } from '../types';

interface Props {
  etat: Etat;
  onChoix: (ok: boolean) => void;
}

// الدعوة — تظهر ما دام التلميذ لم يُقرّر بعد، ولا تظهر مرّتين أبدًا.
export function InviteSync({ etat, onChoix }: Props) {
  if (!syncActive()) return null;
  if (consentementEtat(etat) !== 'indecis') return null;
  return (
    <section className="card mt-5 border-sage p-5">
      <p className="eyebrow">ساعدنا على التحسين — اختياري</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        يُرسَل ملخّص تقدّمك (الدروس المُنجزة، نقاط الخبرة، الولاية) إلى مطوّر التطبيق ليعرف ما
        يفيد التلاميذ أكثر. <span className="font-bold">لا كلمات مرور، لا ملاحظات شخصية</span> —
        ويمكنك التراجع متى شئت من تبويب «أنا». رفضك لا يغيّر شيئًا في التطبيق.
      </p>
      <div className="mt-4 flex gap-3">
        <button onClick={() => onChoix(true)} className="btn btn-primary flex-1 text-sm">
          أوافق
        </button>
        <button onClick={() => onChoix(false)} className="btn btn-ghost flex-1 text-sm">
          ليس الآن
        </button>
      </div>
    </section>
  );
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
          : c === 'non'
            ? 'لن يُرسَل شيء أبدًا. تقدّمك يبقى على هاتفك وحدك — وهذا حقّك كاملًا.'
            : 'لم تُقرّر بعد. لا يُرسَل شيء حتى توافق.'}
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

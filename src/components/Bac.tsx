// البكالوريا — تاريخ الامتحان، الوزن النسبي للوحدات، الامتحان التجريبي، نسخ البكالوريا، والجسور المكتوبة.

import { UNITES, UNITE_PAR_ID, idUniteDeJalon } from '../data/programme';
import { leconsUniteFaites, uniteTerminee } from '../utils/moteur';
import { differenceJours, enArabe, formatCourteAr } from '../utils/dates';
import type { Etat } from '../types';
import { Morceau } from './Communs';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  onCopie: () => void;
  onOuvrirMethodologie: () => void;
}

export default function Bac({ etat, onCopie, onOuvrirMethodologie }: Props) {
  const dateBac = etat.dateBac ?? '2027-06-10';
  const restant = differenceJours(new Date().toISOString().slice(0, 10), dateBac);
  const copies = etat.copies ?? 0;
  const blanc = restant <= 56;

  const jalons = Object.entries(etat.jalons).filter(([, j]) => j.fait);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-6">
        <p className="eyebrow">الهدف</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">البكالوريا</h1>
      </header>
      <MascotteKunz compact tone="gold" message="الامتحان ليس جزيرة مجهولة. خذ معك مفتاحك: افهم الفعل، استخرج الدليل، ثم افحص جوابك." />

      <section className="card mb-5 overflow-hidden border-forest/30">
        <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper">
          <p className="text-[11px] font-bold text-sage">مهارة الامتحان</p>
          <h2 className="font-naskh mt-1 text-xl font-bold">منهجية حل التمرين</h2>
          <p className="mt-2 text-sm leading-relaxed text-paper/80">تعلم قراءة التعليمة، استغلال الوثيقة، بناء الاستدلال وكتابة الاستنتاج العلمي.</p>
          <button onClick={onOuvrirMethodologie} className="btn mt-4 w-full bg-paper text-forest-deep hover:bg-sage">ابدأ التشخيص والمنهجية</button>
        </div>
      </section>

      <section className="card mb-5 overflow-hidden border-forest/30">
        <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper">
          <p className="text-[11px] font-bold text-sage">مهارة الامتحان</p>
          <h2 className="font-naskh mt-1 text-xl font-bold">منهجية حل التمرين</h2>
          <p className="mt-2 text-sm leading-relaxed text-paper/80">تعلم قراءة التعليمة، استغلال الوثيقة، بناء الاستدلال وكتابة الاستنتاج العلمي.</p>
          <button onClick={onOuvrirMethodologie} className="btn mt-4 w-full bg-paper text-forest-deep hover:bg-sage">ابدأ التشخيص والمنهجية</button>
        </div>
      </section>

      {/* العدّ التنازلي — بالحروف، بدون قلق */}
      <section className="card overflow-hidden p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">امتحان علوم الطبيعة والحياة</p>
            <p className="font-naskh mt-1 text-2xl font-bold">
              {new Date(dateBac + 'T12:00:00').toLocaleDateString('ar-DZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="shrink-0 text-left">
            <p className="font-naskh text-4xl font-black text-forest">{enArabe(Math.max(0, restant))}</p>
            <p className="text-[11px] font-bold text-mute">يومًا متبقّيًا</p>
          </div>
        </div>
        <div className="mt-4">
          <Morceau>
            {restant > 200
              ? 'الوقت طويل — لكنه يُهدر دقيقة دقيقة. حصّة واحدة كل يوم تصنع الفرق.'
              : restant > 90
                ? 'دخلنا المرحلة الحاسمة. لا جديد الآن: استرجاع، جسور، ونسخ بكالوريا.'
                : 'العدّ النهائي. كل دقيقة استرجاع الآن نقطة في الورقة.'}
          </Morceau>
        </div>
      </section>

      {/* الامتحان التجريبي */}
      <section className={`card mt-5 p-5 ${blanc ? 'ring-2 ring-forest/30' : ''}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div className="flex-1">
            <p className="eyebrow">المعلم الكبير</p>
            <h2 className="font-naskh mt-0.5 text-lg font-bold">الامتحان التجريبي</h2>
          </div>
        </div>
        {blanc ? (
          <div className="mt-3">
            <Morceau ton="gold">
              حان وقته. كلّف نفسك 3 ساعات كاملة، ورقة وقلم، هاتف مغلق — في بيتك. النتيجة هنا لا
              تهمّ، الذي يهمّ هو أن تعرف شكل الورقة قبل يومها.
            </Morceau>
            <p className="mt-3 text-sm font-bold text-forest">أنجزتَ الامتحان التجريبي؟ سجّله كنسخة:</p>
            <button onClick={onCopie} className="btn btn-primary mt-2 w-full">
              سجّل كنسخة بكالوريا
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-mute">
            يُفتح هذا المعلم قبل البكالوريا بثمانية أسابيع (يوم{' '}
            {formatCourteAr(
              new Date(new Date(dateBac + 'T12:00:00').getTime() - 56 * 86_400_000)
                .toISOString()
                .slice(0, 10)
            )}
            ). حتى ذلك الحين: البروتوكول والاسترجاع.
          </p>
        )}
      </section>

      {/* نسخ البكالوريا */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">تدريب على الورق</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {copies === 0
                ? 'لم تُنجز أي نسخة بعد'
                : copies === 1
                  ? 'نسخة مُنجزة'
                  : copies === 2
                    ? 'نسختان مُنجزتان'
                    : `${enArabe(copies)} نسخ مُنجزة`}
            </p>
          </div>
          <button
            onClick={onCopie}
            className="btn btn-ghost px-4 py-2 text-sm"
            aria-label="إضافة نسخة"
          >
            + نسخة
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          ورقة كاملة، توقيت كامل، تصحيح ذاتي صارم. كل نسخة تكشف ثغرة لا يكشفها أي درس.
        </p>
        {copies > 0 && (
          <div className="mt-3 flex gap-1.5" dir="rtl">
            {Array.from({ length: Math.min(copies, 10) }).map((_, k) => (
              <span key={k} className="h-7 w-7 rounded-full bg-forest" aria-hidden />
            ))}
          </div>
        )}
      </section>

      {/* الوزن النسبي للوحدات */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">أين تُصنع النقاط</p>
        <p className="mt-1 text-xs leading-relaxed text-mute">
          الوزن ملاحَظ من البكالوريات السابقة — يعينك على ترتيب أولويات الاسترجاع.
        </p>
        <ul className="mt-4 space-y-3">
          {UNITES.map((u) => {
            const faites = leconsUniteFaites(etat, u.id);
            const terminee = uniteTerminee(etat, u.id);
            return (
              <li key={u.id} className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${
                    terminee ? 'bg-forest text-paper' : 'bg-cream text-mute'
                  }`}
                >
                  {terminee ? '✓' : enArabe(u.numero)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{u.titre}</p>
                  <div className="mt-1 flex gap-1" dir="rtl" aria-label={`الوزن ${u.poidsBac} من 5`}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <span
                        key={k}
                        className={`h-2 w-6 rounded-full ${
                          k < u.poidsBac
                            ? terminee
                              ? 'bg-forest'
                              : 'bg-gold'
                            : 'bg-line'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-mute">
                  {enArabe(faites)}/{enArabe(u.lessonIds.length)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* الجسور المكتوبة */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">إنتاجك المكتوب</p>
        <p className="mt-1 text-sm font-bold text-ink-soft">
          {jalons.length === 0
            ? 'لم تكتب أي جسر بعد'
            : `${enArabe(jalons.length)} ${jalons.length === 1 ? 'جسر' : 'جسور'} مكتوبة`}
        </p>
        {jalons.length === 0 ? (
          <p className="mt-3 text-xs leading-relaxed text-mute">
            الجسر هو إجابتك التركيبية عن سؤال كل وحدة. تُحفظ هنا كأرشيف لإنتاجك — ومرجعك الأخير
            قبل الامتحان.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jalons.map(([uniteId, j]) => {
              const u = UNITE_PAR_ID[idUniteDeJalon(uniteId)];
              return (
                <li
                  key={uniteId}
                  className="rounded-2xl border border-line bg-cream/50 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">
                      {u ? `الوحدة ${enArabe(u.numero)}: ${u.titre}` : uniteId}
                    </p>
                    {j.ts && (
                      <span className="shrink-0 text-[10px] text-mute">
                        {formatCourteAr(j.ts.slice(0, 10))}
                      </span>
                    )}
                  </div>
                  {j.synthese && (
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-ink-soft">
                      {j.synthese}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

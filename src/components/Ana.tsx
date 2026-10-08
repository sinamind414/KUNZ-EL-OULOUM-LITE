// أنا — الكرّاسة، الهوية، الإحصاء بالحروف (لا نسب مئوية)، وسجلّ النشاط.

import { useState } from 'react';
import type { Etat, NoteCarnet } from '../types';
import { itemsFaits } from '../utils/moteur';
import { aujourdhui, differenceJours, enArabe, enArabeMin, formatCourteAr, formatJourAr } from '../utils/dates';
import { CHEMIN } from '../data/programme';
import { Morceau } from './Communs';
import MascotteKunz from './MascotteKunz';

interface Props {
  etat: Etat;
  onNom: (nom: string) => void;
  onDateBac: (iso: string) => void;
  onSupprimerNote: (id: string) => void;
  onReinitialiser: () => void;
}

export default function Ana({ etat, onNom, onDateBac, onSupprimerNote, onReinitialiser }: Props) {
  const [confirme, setConfirme] = useState(false);
  const notes = [...etat.notes].sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const faits = itemsFaits(etat);
  const jalons = Object.values(etat.jalons).filter((j) => j.fait).length;

  const h = Math.floor(etat.minutesTotales / 60);
  const m = etat.minutesTotales % 60;
  const tempsAr =
    h === 0
      ? `${enArabe(m)} دقيقة`
      : m === 0
        ? `${enArabe(h)} ساعة`
        : `${enArabe(h)} ساعة و${enArabe(m)} دقيقة`;

  const derniersJours = [...etat.journal].sort().slice(-12);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-6">
        <p className="eyebrow">الكرّاسة</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">أنا</h1>
      </header>
      <MascotteKunz compact tone="paper" message="هذه كراستك يا مستكشف. سجّل تقدمك، راجع أخطاءك، وابنِ عادتك العلمية خطوة بعد خطوة." />

      {/* الهوية */}
      <section className="card p-5">
        <p className="eyebrow">هويتي</p>
        <label className="mt-3 block text-xs font-bold text-ink-soft" htmlFor="nom">
          اسمي
        </label>
        <input
          id="nom"
          type="text"
          dir="rtl"
          value={etat.nom}
          onChange={(e) => onNom(e.target.value)}
          placeholder="اكتب اسمك..."
          className="field mt-1.5 disabled:opacity-50"
        />
        <label className="mt-4 block text-xs font-bold text-ink-soft" htmlFor="datebac">
          تاريخ امتحاني
        </label>
        <input
          id="datebac"
          type="date"
          value={etat.dateBac ?? ''}
          onChange={(e) => e.target.value && onDateBac(e.target.value)}
          className="field mt-1.5 disabled:opacity-50"
        />
        {etat.dateBac && (
          <p className="mt-2 text-[11px] text-mute">
            متبقّيًا {enArabe(Math.max(0, differenceJours(aujourdhui(), etat.dateBac)))} يومًا — يُستعمل
            لمعلم الامتحان التجريبي.
          </p>
        )}
      </section>

      {/* الإحصاء بالحروف */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">رحلتي بالأرقام</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-sage bg-sage-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest">{tempsAr}</p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">من التركيز المنظّم</p>
          </div>
          <div className="rounded-2xl border border-sage bg-sage-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-forest">
              {enArabeMin(faits)} من {enArabeMin(CHEMIN.length)}
            </p>
            <p className="mt-1 text-[11px] font-bold text-forest-deep">بنية في الطريق</p>
          </div>
          <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-[#6b5320]">{enArabe(etat.revisions)}</p>
            <p className="mt-1 text-[11px] font-bold text-[#6b5320]">جلسات استرجاع</p>
          </div>
          <div className="rounded-2xl border border-gold-soft bg-gold-soft/60 p-3.5">
            <p className="font-naskh text-2xl font-black text-[#6b5320]">{enArabe(jalons)}</p>
            <p className="mt-1 text-[11px] font-bold text-[#6b5320]">جسور مكتوبة</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-mute">
          لا نسبة مئوية، لا سلسلة قابلة للكسر. الأرقام هنا لتحفيذك فقط — والمقارنة الوحيدة المسموح
          بها هي مع نفسك بالأمس.
        </p>
      </section>

      {/* سجلّ النشاط */}
      {derniersJours.length > 0 && (
        <section className="card mt-5 p-5">
          <p className="eyebrow">أيام نشاطي</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {derniersJours.map((j) => (
              <span
                key={j}
                className="chip text-[11px] font-bold text-forest-deep"
                title={formatJourAr(j)}
              >
                {formatCourteAr(j)}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* الكرّاسة */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">دوّن</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {notes.length === 0
                ? 'لا ملاحظات بعد'
                : notes.length === 1
                  ? 'ملاحظة واحدة'
                  : notes.length === 2
                    ? 'ملاحظتان'
                    : `${enArabe(notes.length)} ملاحظات`}
            </p>
          </div>
          <span className="text-2xl">📓</span>
        </div>

        {notes.length === 0 ? (
          <div className="mt-4">
            <Morceau>
              هنا تظهر الملاحظات والأسئلة التي سجّلتها سابقًا. يمكنك حذفها متى شئت — لا جديد
              يُسجَّل الآن، فالتركيز كله على الاختيار الصحيح.
            </Morceau>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {notes.map((n: NoteCarnet) => (
              <li
                key={n.id}
                className="rounded-2xl border border-line bg-cream/50 p-3.5"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      n.kind === 'question'
                        ? 'bg-gold-soft text-[#6b5320]'
                        : 'bg-sage text-forest-deep'
                    }`}
                  >
                    {n.kind === 'question' ? 'سؤال' : 'فكرة'}
                  </span>
                  <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">{n.texte}</p>
                  <button
                    onClick={() => onSupprimerNote(n.id)}
                    className="shrink-0 text-xs font-bold text-mute transition-colors hover:text-clay"
                    aria-label="حذف"
                  >
                    ✕
                  </button>
                </div>
                {n.ts && (
                  <p className="mt-1.5 text-[10px] text-mute">{formatCourteAr(n.ts.slice(0, 10))}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* منطقة الخطر */}
      <section className="card mt-5 border-clay-soft p-5">
        <p className="eyebrow text-clay">إعادة الضبط</p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          تحذف كل التقدّم، الملاحظات، الجسور، وجدول التكرار. لا يمكن التراجع.
        </p>
        {!confirme ? (
          <button
            onClick={() => setConfirme(true)}
            className="btn btn-ghost mt-3 w-full text-sm text-clay"
          >
            مسح كل بياناتي
          </button>
        ) : (
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                setConfirme(false);
                onReinitialiser();
              }}
              className="btn flex-1 bg-clay text-paper"
            >
              نعم، امسح كل شيء
            </button>
            <button
              onClick={() => setConfirme(false)}
              className="btn btn-ghost flex-1"
            >
              تراجع
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

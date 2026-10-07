// ورشة بنية الأرض — ترتيب أغلفة الكرة الأرضية حسب العمق ثم استرجاع نشط (3 أسئلة).
// مُسترجَعة من فرع arena/7a3f2e84 (976428f) — مُعرَّبة بالكامل (كانت بالفرنسية)
// ومضافة بها أصوات sonJuste/sonFaux كباقي الورشات، والإنجاز يُسجَّل في etat.ateliers.structure.

import { useState } from 'react';
import { IcoRetour } from './Icones';
import { sonFaux, sonJuste } from '../utils/son';

interface Props {
  onFermer: () => void;
  onTerminer: () => void;
}

const couches: [string, string, string, string][] = [
  ['litho', 'الليثوسفير', '0–120 km', 'صلبة ومتماسكة'],
  ['upper', 'المانتو الفوقي (اللاهوائية)', '120–700 km', 'صلبة قابلة للتشوّه'],
  ['lower', 'المانتو السفلي', '700–2900 km', 'صلبة'],
  ['outer', 'النواة الخارجية', '2900–5100 km', 'سائلة'],
  ['inner', 'النواة الداخلية', '5100–6375 km', 'صلبة'],
];

const questions: [string, string][] = [
  [
    'لماذا تُعتبر النواة الخارجية سائلة؟',
    'لا تتجاوزها الموجات الجيبية S، ما يدلّ على وسطٍ سائل.',
  ],
  ['ماذا تكشف الانقطاعات السيزمية؟', 'تغيّر سرعة أو مسار الموجات بين غلّافتين.'],
  [
    'ما الفرق بين التصنيف الكيميائي والفيزيائي؟',
    'الكيميائي يميّز القشرة والمانتو والنواة، والفيزيائي يميّز الليثوسفير والمانتو والنواة حسب سلوك كل غلاف.',
  ],
];

export default function AtelierStructureTerre({ onFermer, onTerminer }: Props) {
  const [placees, setPlacees] = useState<string[]>([]);
  const [choisie, setChoisie] = useState<string | null>(null);
  const [erreur, setErreur] = useState('');
  const [repondues, setRepondues] = useState<boolean[]>([]);
  const attendue = couches[placees.length]?.[0];
  const complete = placees.length === couches.length;
  const toutesRepondues = questions.every((_, i) => repondues[i]);

  function valider(): void {
    if (!choisie) return;
    if (choisie !== attendue) {
      const guide = couches.find(([id]) => id === attendue);
      sonFaux();
      setErreur(`هذا ليس الغلاف التالٍ. دليلك: ${guide?.[2]} — ${guide?.[3]}.`);
      return;
    }
    sonJuste();
    setPlacees((old) => [...old, choisie]);
    setChoisie(null);
    setErreur('');
  }

  return (
    <div className="min-h-dvh bg-cream px-4 pb-10 pt-5" dir="rtl">
      <header className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          onClick={onFermer}
          aria-label="رجوع"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-mute"
        >
          <span className="block h-5 w-5">
            <IcoRetour />
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">ورشة موجهة · بنية الأرض</p>
          <h1 className="font-naskh truncate text-xl font-bold">بناء مقطع الكرة الأرضية</h1>
        </div>
      </header>

      <main className="card mx-auto mt-5 max-w-3xl p-5">
        <p className="text-sm leading-relaxed text-mute">
          رتّب الأغلفة حسب العمق، ثم اربط كل غلاف بحالته الفيزيائية والدليل الزلزالي المناسب.
        </p>

        <div className="mt-5 space-y-2">
          {couches.map(([id, titre, profondeur, etat], i) => (
            <div
              key={id}
              className={`rounded-2xl border p-3 ${
                placees.includes(id)
                  ? 'border-sage bg-sage-soft'
                  : 'border-dashed border-line bg-paper'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-bold text-paper">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold">
                    {placees.includes(id) ? titre : 'غلاف مخفي'}
                  </p>
                  {placees.includes(id) && (
                    <p className="text-xs text-mute">
                      {profondeur} · {etat}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!complete && (
          <>
            <p className="mt-5 text-xs font-bold text-ink-soft">اختر الغلاف التالي حسب العمق</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {couches
                .filter(([id]) => !placees.includes(id))
                .map(([id, titre, profondeur]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setChoisie(id);
                      setErreur('');
                    }}
                    className={`rounded-2xl border p-3 text-right text-sm font-bold ${
                      choisie === id
                        ? 'border-forest bg-sage text-forest-deep'
                        : 'border-line bg-paper'
                    }`}
                  >
                    {titre}
                    <span className="mt-1 block text-xs font-normal text-mute">{profondeur}</span>
                  </button>
                ))}
            </div>
            {erreur && (
              <p className="mt-3 rounded-2xl bg-clay-soft p-3 text-sm font-bold text-clay">
                {erreur}
              </p>
            )}
            <button
              onClick={valider}
              disabled={!choisie}
              className="btn btn-primary mt-4 w-full"
            >
              تثبيت الغلاف
            </button>
          </>
        )}

        {complete && (
          <section className="mt-5 border-t border-line pt-5">
            <p className="eyebrow">الاسترجاع النشط</p>
            {questions.map(([question, reponse], i) => (
              <button
                key={question}
                onClick={() =>
                  setRepondues((old) => {
                    const next = [...old];
                    next[i] = true;
                    return next;
                  })
                }
                className="mt-2 w-full rounded-2xl border border-line bg-paper p-3 text-right text-sm font-bold"
              >
                {question}
                <span className="mt-1 block text-xs text-forest">
                  {repondues[i] ? reponse : 'حاول ثم أظهر الجواب'}
                </span>
              </button>
            ))}
            <button
              onClick={onTerminer}
              disabled={!toutesRepondues}
              className="btn btn-primary mt-5 w-full"
            >
              أنهيت الورشة ✓
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

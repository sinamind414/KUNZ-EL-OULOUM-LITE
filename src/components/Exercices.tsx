// التدريبات — 620 سؤالًا (500 اختيار + 120 تعريفًا محوّلًا) موزّعة على 49 محورًا.
// جولة من 10 أسئلة لكل محور. لا مؤقّت ولا نسبة مئوية:
// الإجابة الخاطئة رسالة لطيفة + إعادة ترتيب الخيارات، والصحيحة تُسجَّل في الحالة.

import { useState } from 'react';
import type { Etat } from '../types';
import { DOMAINES, UNITES, UNITE_PAR_ID, type ItemChemin } from '../data/programme';
import { AXES, TOTAL_QCM, TOTAL_DEFS } from '../data/drills/axes';
import type { AxeDrill } from '../data/drills/axes';
import type { ItemDrill } from '../data/drills/types';
import type { QcmLecon } from '../data/qcmLecons';
import { nb } from '../utils/dates';
import { itemFait, itemVerrouille } from '../utils/moteur';
import {
  chargerDomaineDeUnite,
  composerJoueur,
} from '../utils/drills';
import { ChoixUnique } from './Communs';
import { IcoCible, IcoOutils, IcoRetour, IcoVerrou } from './Icones';

interface Props {
  etat: Etat;
  onItemReussi: (id: string) => void;
  onOuvrirAtelier: () => void;
  onOuvrirImmunite: () => void;
  onOuvrirOrogenese: () => void;
}

type Portee = { kind: 'axe'; axe: AxeDrill };
type Vue =
  | { type: 'choix' }
  | { type: 'ateliers' }
  | { type: 'liste' }
  | { type: 'seance'; portee: Portee; file: ItemDrill[]; index: number };

const TAILLE_JOUR = 10;

export default function Exercices({
  etat,
  onItemReussi,
  onOuvrirAtelier,
  onOuvrirImmunite,
  onOuvrirOrogenese,
}: Props) {
  const [vue, setVue] = useState<Vue>({ type: 'choix' });
  const [enCharge, setEnCharge] = useState(false);
  const reussis = new Set(Object.keys(etat.drills ?? {}));
  // القفل الخطّي مثل مساري تمامًا: محاور الوحدة تُفتح حين يُفتح أوّل بند منها في الطريق.
  const debloquees = unitesDebloquees(etat);

  async function demarrer(portee: Portee): Promise<void> {
    setEnCharge(true);
    try {
      const tous = await chargerDomaineDeUnite(portee.axe.u);
      const cible = tous.filter((i) => i.a === portee.axe.id);
      const file = composerJoueur(cible, reussis, TAILLE_JOUR);
      setVue({ type: 'seance', portee, file, index: 0 });
    } finally {
      setEnCharge(false);
    }
  }

  if (vue.type === 'seance') {
    return (
      <Seance
        vue={vue}
        etat={etat}
        onItemReussi={onItemReussi}
        onSuivant={() =>
          setVue((v) =>
            v.type === 'seance' && v.index + 1 < v.file.length
              ? { ...v, index: v.index + 1 }
              : { type: 'liste' }
          )
        }
        onArreter={() => setVue({ type: 'liste' })}
      />
    );
  }

  // ───────────── شاشة الاختيار: QCM أم ورشات ─────────────
  if (vue.type === 'choix') {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        <header className="mb-6">
          <p className="eyebrow">التدريبات</p>
          <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">
            ماذا تريد أن تدرّب اليوم؟
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            مساران للتدريب: أسئلة QCM من البرنامج الرسمي، أو ورشات تركيبية تبني فيها المعلومة
            بيدك ثم تسترجعها من الذاكرة.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setVue({ type: 'liste' })}
            className="card p-5 text-right transition-colors hover:border-sage"
          >
            <span className="block h-10 w-10 text-forest">
              <IcoCible />
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">أسئلة QCM</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              {nb(TOTAL_QCM + TOTAL_DEFS)} سؤالًا على {nb(AXES.length)} محورًا · جولات من{' '}
              {nb(TAILLE_JOUR)} أسئلة، بلا مؤقّت.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest">ابدأ ←</span>
          </button>

          <button
            type="button"
            onClick={() => setVue({ type: 'ateliers' })}
            className="card p-5 text-right transition-colors hover:border-gold"
          >
            <span className="block h-10 w-10 text-gold">
              <IcoOutils />
            </span>
            <h2 className="font-naskh mt-3 text-lg font-bold">الورشات التطبيقية</h2>
            <p className="mt-1 text-sm leading-relaxed text-mute">
              {nb(3)} ورشات: المجال الأول، المناعة، التكتونية — ترتيب، ربط، استرجاع نشط.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-forest">ابدأ ←</span>
          </button>
        </div>
      </div>
    );
  }

  // ───────────── الورشات الثلاث ─────────────
  if (vue.type === 'ateliers') {
    const domaine1Pret = DOMAINES[0].unites.every((uid) =>
      itemFait(etat, { type: 'jalon', uniteId: uid })
    );
    const immunitePret = itemFait(etat, { type: 'jalon', uniteId: 'u4' });
    const orogenesePret = itemFait(etat, { type: 'jalon', uniteId: 'u11' });

    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
        <button
          type="button"
          onClick={() => setVue({ type: 'choix' })}
          className="btn btn-ghost mb-4 gap-1.5 px-3 py-1.5 text-xs"
        >
          <span className="block h-4 w-4">
            <IcoRetour />
          </span>
          رجوع للاختيار
        </button>

        <header className="mb-6">
          <p className="eyebrow">التدريبات</p>
          <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">الورشات التطبيقية</h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            {nb(3)} ورشات: ترتيب البطاقات وربط المفاهيم ثم استرجاع نشط — بلا كتابة، وبلا خطأ
            يُعاقَب عليه.
          </p>
        </header>

        <section className="card overflow-hidden border-forest/30">
          <div className="bg-gradient-to-l from-forest to-forest-deep p-5 text-paper">
            <p className="text-[11px] font-bold text-sage">محطة تركيبية جديدة</p>
            <h2 className="font-naskh mt-1 text-xl font-bold">ورشة تركيب المجال الأول</h2>
            <p className="mt-2 text-sm leading-relaxed text-paper/80">
              اربط بين المعلومة الوراثية، بنية البروتين ووظيفته في خريطة واحدة، ثم استرجعها من
              الذاكرة.
            </p>
            {domaine1Pret ? (
              <button
                type="button"
                onClick={onOuvrirAtelier}
                className="btn mt-4 w-full bg-paper text-forest-deep hover:bg-sage"
              >
                {etat.ateliers?.d1 ? 'إعادة فتح الورشة ✓' : 'ابدأ الورشة'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-paper/75">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                تُفتح بعد إنهاء جسور الوحدات الخمس في المجال الأول.
              </p>
            )}
          </div>
        </section>

        <section className="card mt-4 overflow-hidden border-clay/30">
          <div className="bg-sage-soft p-5">
            <p className="text-[11px] font-bold text-forest">
              ورشة تطبيقية · الوحدة {nb(4)}
            </p>
            <h2 className="font-naskh mt-1 text-xl font-bold">آلية الدفاع عن الذات</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              رتّب استجابة LB وLT4 وLT8 من التعرف إلى التكاثر ثم النتيجة المناعية.
            </p>
            {immunitePret ? (
              <button
                type="button"
                onClick={onOuvrirImmunite}
                className="btn btn-primary mt-4 w-full"
              >
                {etat.ateliers?.immunite ? 'إعادة فتح ورشة المناعة ✓' : 'ابدأ ورشة المناعة'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-mute">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                {`تُفتح بعد إنهاء جسر الوحدة ${nb(4)} (الدفاع عن الذات).`}
              </p>
            )}
          </div>
        </section>

        <section className="card mt-4 overflow-hidden border-gold/30">
          <div className="bg-gold-soft/50 p-5">
            <p className="text-[11px] font-bold text-[#6b5320]">ورشة تركيبية · التكتونية</p>
            <h2 className="font-naskh mt-1 text-xl font-bold">من التباعد إلى السلسلة الجبلية</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              رتّب المراحل الخمس لتشكل الأوروجينيز: التمدد، اتساع الحوض، التقارب ثم التصادم.
            </p>
            {orogenesePret ? (
              <button
                type="button"
                onClick={onOuvrirOrogenese}
                className="btn btn-primary mt-4 w-full"
              >
                {etat.ateliers?.orogenese
                  ? 'إعادة فتح ورشة الأوروجينيز ✓'
                  : 'ابدأ ورشة الأوروجينيز'}
              </button>
            ) : (
              <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-mute">
                <span className="mt-0.5 block h-4 w-4 shrink-0">
                  <IcoVerrou />
                </span>
                {`تُفتح بعد إنهاء جسر الوحدة ${nb(11)} (البنيات الجيولوجية).`}
              </p>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ───────────── قائمة المحاور (QCM) ─────────────
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <button
        type="button"
        onClick={() => setVue({ type: 'choix' })}
        className="btn btn-ghost mb-4 gap-1.5 px-3 py-1.5 text-xs"
      >
        <span className="block h-4 w-4">
          <IcoRetour />
        </span>
        رجوع للاختيار
      </button>
      <header className="mb-6">
        <p className="eyebrow">التدريبات</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">تمارين البرنامج</h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          {nb(TOTAL_QCM)} سؤال اختيار و{nb(TOTAL_DEFS)} تعريفًا موزّعة على {nb(AXES.length)} محورًا من
          البرنامج الرسمي. جولة واحدة = {nb(TAILLE_JOUR)} أسئلة، بلا مؤقّت وبلا حساب نسبة. الخطأ يُعيد
          ترتيب الخيارات فقط، وكل محاولة تُعلّم.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-mute">
          🔒 القفل خطّي مثل «مساري»: لا تُفتح محاور الوحدة إلا بعد إنهاء جسر الوحدة التي قبلها — هكذا
          تبقى التدريبات مواكبة لدراستك، لا سابقة لها.
        </p>
      </header>

      <section className="card p-5">
        <p className="eyebrow">حصيلتك</p>
        <p className="mt-1 text-lg font-bold text-ink-soft">
          أجبت {nb(reussis.size)} من {nb(TOTAL_QCM + TOTAL_DEFS)}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-sage/40" aria-hidden="true">
          <div
            className="h-full rounded-full bg-forest transition-all"
            style={{ width: `${Math.min(100, (reussis.size / (TOTAL_QCM + TOTAL_DEFS)) * 100)}%` }}
          />
        </div>
      </section>

      <div className="mt-6 space-y-5">
        {DOMAINES.map((d) => (
          <section key={d.id} className="card overflow-hidden">
            <div className="border-b border-line bg-paper px-5 py-3">
              <p className="font-naskh text-base font-bold">{d.titre}</p>
            </div>
            <div className="divide-y divide-line">
              {d.unites.map((uid) => {
                const u = UNITE_PAR_ID[uid];
                const verrouillee = !debloquees.has(u.numero);
                const axes = AXES.filter((a) => a.u === u.numero);
                const items = axes.reduce((s, a) => s + a.qcm + a.defs, 0);
                const faits = axes.reduce((s, a) => s + compteFaitsAxe(etat, a), 0);
                return (
                  <div key={uid} className="px-5 py-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-sm font-bold ${verrouillee ? 'text-mute' : 'text-ink'}`}>
                        {nb(u.numero)}. {u.titre}
                      </p>
                      {verrouillee ? (
                        <span className="grid h-5 w-5 shrink-0 place-items-center text-mute">
                          <span className="block h-4 w-4">
                            <IcoVerrou />
                          </span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] text-mute">
                          {nb(faits)} / {nb(items)}
                        </span>
                      )}
                    </div>
                    {verrouillee ? (
                      <p className="mt-2 text-[11px] leading-relaxed text-mute">
                        {`يُفتح هذا القسم بعد إنهاء جسر الوحدة ${nb(u.numero - 1)} — تمامًا كما في مساري.`}
                      </p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {axes.map((a) => {
                          const f = compteFaitsAxe(etat, a);
                          const total = a.qcm + a.defs;
                          const complet = f === total;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              disabled={enCharge}
                              onClick={() => demarrer({ kind: 'axe', axe: a })}
                              className={`chip text-[11px] font-bold transition-colors ${
                                complet
                                  ? 'border-forest bg-sage text-forest-deep'
                                  : 'border-line bg-paper text-ink-soft hover:border-sage'
                              }`}
                            >
                              {a.titre.replace(/^\d+\.\d+\s*—?\s*/, '')}{' '}
                              <span className="font-normal opacity-70">
                                ({complet ? '✓' : `${nb(f)}/${nb(total)}`})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// عناصر المحور المُجابة — نقرأها من قائمة المعرّفات الثابتة في البنك (بلا تحميل الجزء)
function compteFaitsAxe(etat: Etat, a: AxeDrill): number {
  const faits = etat.drills ?? {};
  return a.ids.filter((id) => faits[id]).length;
}

// أرقام الوحدات المُفتوحة — نفس قاعدة مساري: أوّل بند للوحدة غير مقفل في الطريق.
function unitesDebloquees(etat: Etat): Set<number> {
  const ok = new Set<number>();
  for (const u of UNITES) {
    const items: ItemChemin[] = [
      ...(u.prerequis ?? []).map((id) => ({ type: 'lecon' as const, id })),
      ...u.lessonIds.map((id) => ({ type: 'lecon' as const, id })),
    ];
    if (!itemVerrouille(etat, items[0])) ok.add(u.numero);
  }
  return ok;
}

// ───────────── الجولة ─────────────

interface PropsSeance {
  vue: Extract<Vue, { type: 'seance' }>;
  etat: Etat;
  onItemReussi: (id: string) => void;
  onSuivant: () => void;
  onArreter: () => void;
}

function Seance({ vue, onItemReussi, onSuivant, onArreter }: PropsSeance) {
  const [repondu, setRepondu] = useState(false);
  const item = vue.file[vue.index];

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-16">
        <p className="text-sm text-mute">لا توجد عناصر في هذا المحور بعد.</p>
        <button type="button" onClick={onArreter} className="btn btn-ghost mt-4">
          رجوع
        </button>
      </div>
    );
  }

  const qcm: QcmLecon = {
    question: item.q,
    options: item.o,
    explication: item.e || `الجواب الصحيح: «${item.o[0]}».`,
  };

  const dernier = vue.index + 1 === vue.file.length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <button type="button" onClick={onArreter} className="btn btn-ghost px-3 py-1.5 text-xs">
          ← إنهاء الجولة
        </button>
        <p className="text-sm font-bold text-mute">
          {nb(vue.index + 1)} من {nb(vue.file.length)}
        </p>
      </header>

      <div className="h-1.5 overflow-hidden rounded-full bg-sage/40" aria-hidden="true">
        <div
          className="h-full rounded-full bg-forest transition-all"
          style={{ width: `${(vue.index / vue.file.length) * 100}%` }}
        />
      </div>

      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          {item.def ? (
            <span className="chip border-gold/50 bg-gold-soft/40 text-[10px] font-bold text-[#6b5320]">
              تعريف
            </span>
          ) : (
            <span className="chip border-line bg-paper text-[10px] font-bold text-mute">
              {item.n === 1 ? 'سهل' : item.n === 3 ? 'صعب' : 'متوسط'}
            </span>
          )}
        </div>
        <div key={item.id}>
          <ChoixUnique
            qcm={qcm}
            source="exercice"
            onValide={() => {
              onItemReussi(item.id);
              setRepondu(true);
            }}
          />
        </div>

        {repondu && (
          <button
            type="button"
            onClick={() => {
              setRepondu(false);
              onSuivant();
            }}
            className="btn btn-primary mt-5 w-full"
          >
            {dernier ? 'إنهاء الجولة ←' : 'السؤال التالي ←'}
          </button>
        )}
      </div>
    </div>
  );
}

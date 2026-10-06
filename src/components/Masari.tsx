// مساري — الطريق الكامل مقفلًا حتى يُنهى ما قبله. لا وصول مباشر للدروس المتقدّمة.

import {
  CHEMIN,
  DOMAINES,
  UNITE_PAR_ID,
  cleItem,
  idJalon,
  titreItem,
  type ItemChemin,
} from '../data/programme';
import { itemFait, itemVerrouille, leconsUniteFaites } from '../utils/moteur';
import { enArabe, compteLecons } from '../utils/dates';
import type { Etat } from '../types';
import { ACCENTS } from '../utils/accents';
import { IcoVerifie, IcoVerrou } from './Icones';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onVoirUnite: (uniteId: string) => void;
}

function itemsUnite(uniteId: string): ItemChemin[] {
  const u = UNITE_PAR_ID[uniteId];
  const items: ItemChemin[] = [
    ...(u.prerequis ?? []).map((id) => ({ type: 'lecon' as const, id })),
    ...u.lessonIds.map((id) => ({ type: 'lecon' as const, id })),
  ];
  return items;
}

export default function Masari({ etat, onOuvrirItem, onVoirUnite }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      <header className="mb-6">
        <p className="eyebrow">الطريق</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">مساري</h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          3 مجالات، 11 وحدة، 58 درسًا. كل بند مقفل حتى تنهي ما قبله — هذه الضمانة الوحيدة لعدم
          تراكم الثغرات.
        </p>
      </header>

      <div className="space-y-8">
        {DOMAINES.map((d) => {
          const accent = ACCENTS[d.accent] ?? ACCENTS.forest;
          return (
            <section key={d.id}>
              <div className={`mb-3 flex items-center gap-3 border-r-4 ${accent.border} pr-3`}>
                <span className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <h2 className="font-naskh text-lg font-bold leading-snug">{d.titre}</h2>
              </div>

              <div className="space-y-4">
                {d.unites.map((uniteId) => {
                  const u = UNITE_PAR_ID[uniteId];
                  const items = itemsUnite(uniteId);
                  const premierVerrouille = itemVerrouille(etat, items[0]);
                  const jalonVerrouille = itemVerrouille(etat, {
                    type: 'jalon',
                    uniteId,
                  });
                  const faites = leconsUniteFaites(etat, uniteId);
                  const jalonFait = itemFait(etat, { type: 'jalon', uniteId });
                  const uniteActuelle = !premierVerrouille && faites < u.lessonIds.length;

                  return (
                    <div
                      key={uniteId}
                      className={`card overflow-hidden ${
                        uniteActuelle ? 'ring-2 ring-forest/30' : ''
                      }`}
                    >
                      {/* رأس الوحدة */}
                      <button
                        onClick={() => onVoirUnite(uniteId)}
                        className="flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-sage-soft/50"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                            jalonFait
                              ? 'bg-forest text-paper'
                              : uniteActuelle
                                ? 'bg-sage text-forest-deep'
                                : premierVerrouille
                                  ? 'bg-cream text-mute'
                                  : 'bg-gold-soft text-[#6b5320]'
                          }`}
                        >
                          {jalonFait ? '✓' : enArabe(u.numero)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold">{u.titre}</h3>
                          <p className="mt-0.5 text-[11px] text-mute">
                            {compteLecons(faites)} من {compteLecons(u.lessonIds.length)} · {u.fenetreAr}
                          </p>
                        </div>
                        {premierVerrouille && (
                          <span className="grid h-6 w-6 shrink-0 place-items-center text-mute">
                            <span className="block h-4 w-4">
                              <IcoVerrou />
                            </span>
                          </span>
                        )}
                      </button>

                      {/* قائمة الدروس — تظهر إن فُتحت الوحدة */}
                      {!premierVerrouille && (
                        <div className="border-t border-line px-3 pb-3">
                          <ul className="divide-y divide-line/70">
                            {items.map((item) => {
                              const fait = itemFait(etat, item);
                              const enCours =
                                item.type === 'lecon' &&
                                etat.progression[item.id]?.statut === 'en_cours';
                              const verrouille = itemVerrouille(etat, item);
                              return (
                                <li key={cleItem(item)}>
                                  <button
                                    onClick={() => !verrouille && onOuvrirItem(item)}
                                    disabled={verrouille}
                                    className="flex w-full items-center gap-3 py-2.5 pr-1 text-right transition-colors hover:bg-sage-soft/40 disabled:opacity-60"
                                  >
                                    <span className="grid h-6 w-6 shrink-0 place-items-center">
                                      {fait ? (
                                        <span className="block h-4 w-4 text-forest">
                                          <IcoVerifie />
                                        </span>
                                      ) : enCours ? (
                                        <span className="h-3.5 w-3.5 rounded-full bg-gold" />
                                                      ) : verrouille ? (
                                                        <span className="block h-3.5 w-3.5 text-mute">
                                                          <IcoVerrou />
                                                        </span>
                                                      ) : (
                                                        <span className="h-3.5 w-3.5 rounded-full border-2 border-line" />
                                                      )}
                                    </span>
                                    <span
                                      className={`flex-1 text-sm ${
                                        fait
                                          ? 'font-semibold text-mute line-through decoration-line'
                                          : enCours
                                            ? 'font-bold text-forest'
                                            : 'font-medium text-ink-soft'
                                      }`}
                                    >
                                      {titreItem(item)}
                                    </span>
                                    {enCours && (
                                      <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold text-[#6b5320]">
                                        متابعة
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>

                          {/* جسر الوحدة */}
                          <div className="mt-3">
                            <button
                              onClick={() => !jalonVerrouille && onVoirUnite(uniteId)}
                              disabled={jalonVerrouille}
                              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition-colors disabled:opacity-60 ${
                                jalonFait
                                  ? 'border-sage bg-sage-soft'
                                  : jalonVerrouille
                                    ? 'border-line bg-cream/60'
                                    : 'border-gold-soft bg-gold-soft/50 hover:bg-gold-soft'
                              }`}
                            >
                              <span className="text-lg">🌉</span>
                              <div className="flex-1">
                                <p className="text-sm font-bold">
                                  جسر الوحدة {enArabe(u.numero)}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-mute">
                                  {jalonFait
                                    ? 'أَجَبْتَ عن سؤال الوحدة كتابةً من ذاكرتك.'
                                    : jalonVerrouille
                                      ? 'يُفتح بعد إنهاء كل دروس الوحدة.'
                                      : 'سؤال واحد، إجابة مكتوبة من الذاكرة — هذا هو الجسر.'}
                                </p>
                              </div>
                              {jalonFait && (
                                <span className="block h-5 w-5 text-forest">
                                  <IcoVerifie />
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {premierVerrouille && (
                        <div className="border-t border-line px-4 py-3">
                          <p className="text-[11px] leading-relaxed text-mute">
                            {u.numero === 1
                              ? 'يُفتح هذا القسم مع بداية الطريق.'
                              : `يُفتح هذا القسم بعد إنهاء جسر الوحدة ${enArabe(
                                  u.numero - 1
                                )}.`}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-mute">
        الطريق وحده يصل بك. {enArabe(CHEMIN.length)} بنية، واحدة في كل حصّة.
      </p>
    </div>
  );
}

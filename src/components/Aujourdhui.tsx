// اليوم — مهمّة واحدة فقط. أولوية: استئناف → استرجاع مستحق → حصّة جديدة → راحة.

import { competenceDue, prochaineAction, positionClasse, rythmeSemaine, itemsFaits } from '../utils/moteur';
import { CHEMIN, UNITE_PAR_ID, titreItem, uniteDeItem } from '../data/programme';
import { aujourdhui, compteLeconsAdj, nb, nbMin, formatJourAr, salue } from '../utils/dates';
import { DUREE_TOTALE_MIN } from '../data/protocole';
import CarteStats from './CarteStats';
import type { Etat } from '../types';
import type { ItemChemin } from '../data/programme';
import type { Qualite } from '../utils/srs';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onVoirUnite: (uniteId: string) => void;
  onResultatKafaa: (
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
    estRevue?: boolean
  ) => void;
  onOuvrirMethodologie: () => void;
}

export default function Aujourdhui({
  etat,
  onOuvrirItem,
  onDemarrerRevision,
  onVoirUnite,
  onResultatKafaa,
  onOuvrirMethodologie,
}: Props) {
  const action = prochaineAction(etat);
  const competence = competenceDue(etat);
  const rythme = rythmeSemaine(etat);
  const position = positionClasse(etat);
  const faits = itemsFaits(etat);

  function titreBouton(): string {
    switch (action.type) {
      case 'reprise':
        return 'متابعة الدرس';
      case 'rappel':
        return 'ابدأ الاسترجاع';
      case 'nouvelle':
        return 'ابدأ الحصّة';
      case 'repos':
        return action.bonusDispo ? 'حصّة إضافية (واحدة اليوم)' : 'حسنًا — راحة';
      case 'fini':
        return 'مراجعة ما أُنجز';
      default:
        return '';
    }
  }

  function principale() {
    switch (action.type) {
      case 'reprise':
      case 'nouvelle':
        onOuvrirItem(action.item);
        break;
      case 'rappel':
        onDemarrerRevision(action.lessonIds);
        break;
      case 'repos':
        if (action.bonusDispo && action.prochaineItem) onOuvrirItem(action.prochaineItem);
        break;
      case 'fini':
        onVoirUnite('u1');
        break;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8">
      {/* ترحيب */}
      <header className="mb-6 flex items-start gap-3">
        <img
          src="/personnage-pirate.png"
          alt="مستكشف كنز العلوم"
          className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
        />
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{formatJourAr(aujourdhui())}</p>
          <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">
            {salue()}، {etat.nom}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mute">
            {faits === 0
              ? 'كل شيء يبدأ بخطوة واحدة. مهمّة اليوم وحدها تكفي.'
              : `أنجزت ${nbMin(faits)} من ${nbMin(CHEMIN.length)} بنية في طريقك. مهمّة واحدة في كل مرة.`}
          </p>
        </div>
      </header>

      {/* بطاقة المهمّة الواحدة */}
      <section className="card overflow-hidden p-6">
        {action.type === 'reprise' && (
          <>
            <p className="eyebrow">استئناف</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold leading-snug">أكمل ما بدأته</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              «{titreItem(action.item)}» — توقّفت في المرحلة{' '}
              {nb((etat.progression[action.item.type === 'lecon' ? action.item.id : '']?.phases ?? []).length + 1)}{' '}
              من 6. أين توقّفت، نُحفظ.
            </p>
          </>
        )}

        {action.type === 'rappel' && (
          <>
            <p className="eyebrow">قبل الجديد</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold leading-snug">
              {compteLeconsAdj(
                action.lessonIds.length,
                'مستحقّ للاسترجاع',
                'مستحقّان للاسترجاع',
                'مستحقّة للاسترجاع',
                'مستحقًّا للاسترجاع'
              )}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {action.lessonIds.slice(0, 3).map((id) => (
                <li key={id} className="flex items-center gap-2 text-sm text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {titreItem({ type: 'lecon', id })}
                </li>
              ))}
              {action.lessonIds.length > 3 && (
                <li className="text-xs text-mute">و {nb(action.lessonIds.length - 3)} أخرى...</li>
              )}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-mute">
              الاسترجاع يأتي قبل أي جديد — هذه هي القاعدة الأولى للطريقة.
            </p>
          </>
        )}

        {action.type === 'nouvelle' && (
          <>
            <p className="eyebrow">حصّة اليوم</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold leading-snug">
              {titreItem(action.item)}
            </h2>
            {(() => {
              const u = uniteDeItem(action.item);
              if (!u) return null;
              return (
                <p className="mt-2 text-sm leading-relaxed text-mute">
                  الوحدة {nb(u.numero)}: {u.titre} · {u.fenetreAr}
                </p>
              );
            })()}
            <p className="mt-3 text-xs leading-relaxed text-mute">
              {nb(DUREE_TOTALE_MIN)} دقيقة، 6 مراحل، بوّابة في كل مرحلة. لا زر تخطّي — الجدية هي
              سرّ الطريقة.
            </p>
          </>
        )}

        {action.type === 'repos' && (
          <>
            <p className="eyebrow">يكفي اليوم</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold leading-snug">راحة مشروعة</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              أنجزت حصّة اليوم. النوم جزء من التثبيت — المراجعة الأولى بعد الحصّة تجلس في الذاكرة
              أثناء الراحة.
            </p>
            {action.bonusDispo && action.prochaineItem && (
              <p className="mt-3 text-xs leading-relaxed text-mute">
                عندك طاقة لحصّة إضافية؟ واحدة فقط، ولا تُحسب من حصص الغد.
              </p>
            )}
            {!action.bonusDispo && (
              <p className="mt-3 text-xs leading-relaxed text-mute">
                استعملت حصّتك الإضافية اليوم. نلتقي غدًا.
              </p>
            )}
          </>
        )}

        {action.type === 'fini' && (
          <>
            <p className="eyebrow">النهاية… والبداية</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold leading-snug">أتممت كل البرنامج</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              58 درسًا و11 جسرًا. الآن وقت الاسترجاع والتدريبات — 620 سؤالًا تنتظرك في تبويب
              «تدريبات».
            </p>
          </>
        )}

        <button onClick={principale} className="btn btn-primary mt-5 w-full text-base">
          {titreBouton()}
        </button>
        {action.type === 'rappel' && (
          <p className="mt-3 text-center text-xs text-mute">
            لن تُفتح أي حصّة جديدة قبل إنهاء الاسترجاع.
          </p>
        )}
      </section>

      {/* بطاقة كفاءة — مراجعة منهجية قصيرة (audit) : 1 à 2 fois par semaine */}
      {competence && (
        <section className="card mt-5 border-2 border-sage bg-sage-soft/40 p-5">
          <div className="flex items-center gap-3">
            <img
              src="/personnage-pirate.png"
              alt=""
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">بطاقة كفاءة · مراجعة منهجية</p>
              <p className="font-naskh mt-1 text-lg font-bold leading-snug text-forest-deep">
                «{competence.carte.verbe}» — {competence.carte.exercice}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mute">
                فخّ يجب تجنّبه: {competence.carte.erreur}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => onResultatKafaa(competence.key, 5, competence.carte, true)}
              className="btn btn-primary"
            >
              أتقنتها — أراجعها لاحقًا
            </button>
            <button
              onClick={() => onResultatKafaa(competence.key, 3, competence.carte, true)}
              className="btn btn-ghost"
            >
              كافحت قليلًا — أراجعها غدًا
            </button>
          </div>
          <button
            onClick={onOuvrirMethodologie}
            className="mt-2 w-full text-center text-xs font-black text-forest"
          >
            أتدرّب على التمرين في تبويب المنهجية ←
          </button>
          <p className="mt-2 text-center text-[11px] text-mute">
            دقيقتان، لا أكثر. الاسترجاع القصير يثبّت الإجراء في الذاكرة — بلا نسبة مئوية وبلا عدوّ.
          </p>
        </section>
      )}

      {/* إيقاع الأسبوع — لا سلسلة قابلة للكسر */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">إيقاع الأسبوع</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {rythme.jours >= rythme.cible
                ? `${nb(rythme.cible)} من ${nb(rythme.cible)} أيام ✓`
                : `${nb(rythme.jours)} من ${nb(rythme.cible)} أيام`}
            </p>
          </div>
          <div className="flex items-start gap-1.5" dir="rtl">
            {rythme.sept.map((j) => (
              <div
                key={j.iso}
                className="flex w-7 flex-col items-center gap-1"
                title={formatJourAr(j.iso)}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-black ${
                    j.actif ? 'bg-forest text-paper' : 'border border-line bg-paper text-mute'
                  } ${j.aujourdhui ? 'ring-2 ring-gold ring-offset-1 ring-offset-paper' : ''}`}
                >
                  {j.actif ? '✓' : ''}
                </span>
                <span
                  className={`text-[10px] leading-none ${
                    j.aujourdhui ? 'font-black text-[#6b5320]' : 'text-mute'
                  }`}
                >
                  {new Date(j.iso + 'T12:00:00').getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          الهدف {nb(rythme.cible)} أيام من {nb(7)} — لا أكثر. الراحة جزء من الخطة، لا كسر فيها شيء.
        </p>
      </section>

      {/* إحصاء المُرشد — كم صحيحة وكم ليست صحيحة */}
      <div className="mt-5">
        <CarteStats />
      </div>

      {/* موضع القسم */}
      <section className="card mt-5 p-5">
        <p className="eyebrow">التدرّج السنوي</p>
        {position.uniteId ? (
          <>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {position.statut === 'retard'
                ? 'متأخّر قليلًا'
                : position.statut === 'avance'
                  ? 'متقدّم'
                  : 'محاذٍ لقسمك'}
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-sage"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(8, (UNITE_PAR_ID[position.uniteId].numero / 11) * 100)
                  )}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-mute">
              وحدتك الحالية: {UNITE_PAR_ID[position.uniteId].titre} · نافذتها{' '}
              {UNITE_PAR_ID[position.uniteId].fenetreAr}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm font-bold text-ink-soft">انتهى التدرّج السنوي</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-mute">{position.texteAr}</p>
      </section>
    </div>
  );
}

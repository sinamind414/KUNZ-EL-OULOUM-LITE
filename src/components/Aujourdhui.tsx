// اليوم — مهمّة واحدة فقط. أولوية: استئناف → استرجاع مستحق → حصّة جديدة → راحة.

import { prochaineAction, positionClasse, rythmeSemaine, itemsFaits } from '../utils/moteur';
import { CHEMIN, UNITE_PAR_ID, titreItem, uniteDeItem } from '../data/programme';
import { aujourdhui, compteLeconsAdj, enArabe, enArabeMin, formatJourAr, salue } from '../utils/dates';
import { DUREE_TOTALE_MIN } from '../data/protocole';
import type { Etat } from '../types';
import type { ItemChemin } from '../data/programme';

interface Props {
  etat: Etat;
  onOuvrirItem: (item: ItemChemin) => void;
  onDemarrerRevision: (lessonIds: string[]) => void;
  onVoirUnite: (uniteId: string) => void;
}

export default function Aujourdhui({ etat, onOuvrirItem, onDemarrerRevision, onVoirUnite }: Props) {
  const action = prochaineAction(etat);
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
      <header className="mb-6">
        <p className="eyebrow">{formatJourAr(aujourdhui())}</p>
        <h1 className="font-naskh mt-1 text-3xl font-bold leading-tight">
          {salue()}، {etat.nom}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          {faits === 0
            ? 'كل شيء يبدأ بخطوة واحدة. مهمّة اليوم وحدها تكفي.'
            : `أنجزت ${enArabeMin(faits)} من ${enArabeMin(CHEMIN.length)} بنية في طريقك. مهمّة واحدة في كل مرة.`}
        </p>
      </header>

      {/* بطاقة المهمّة الواحدة */}
      <section className="card overflow-hidden p-6">
        {action.type === 'reprise' && (
          <>
            <p className="eyebrow">استئناف</p>
            <h2 className="font-naskh mt-2 text-2xl font-bold leading-snug">أكمل ما بدأته</h2>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              «{titreItem(action.item)}» — توقّفت في المرحلة{' '}
              {enArabe((etat.progression[action.item.type === 'lecon' ? action.item.id : '']?.phases ?? []).length + 1)}{' '}
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
                <li className="text-xs text-mute">و {enArabe(action.lessonIds.length - 3)} أخرى...</li>
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
                  الوحدة {enArabe(u.numero)}: {u.titre} · {u.fenetreAr}
                </p>
              );
            })()}
            <p className="mt-3 text-xs leading-relaxed text-mute">
              {enArabe(DUREE_TOTALE_MIN)} دقيقة، 6 مراحل، بوّابة في كل مرحلة. لا زر تخطّي — الجدية هي
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
              58 درسًا و11 جسرًا. الآن وقت الاسترجاع والامتحان التجريبي في تبويب البكالوريا.
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

      {/* إيقاع الأسبوع — لا سلسلة قابلة للكسر */}
      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">إيقاع الأسبوع</p>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              {enArabe(rythme.jours)} من {enArabe(rythme.cible)} أيام
            </p>
          </div>
          <div className="flex gap-1.5" dir="rtl">
            {Array.from({ length: 7 }).map((_, k) => (
              <span
                key={k}
                className={`h-7 w-7 rounded-full ${
                  k < rythme.cible
                    ? k < rythme.jours
                      ? 'bg-forest'
                      : 'border border-line bg-paper'
                    : 'bg-sage-soft'
                }`}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-mute">
          الهدف 5 أيام من 7 — لا أكثر. الراحة جزء من الخطة، لاكسر فيها شيء.
        </p>
      </section>

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

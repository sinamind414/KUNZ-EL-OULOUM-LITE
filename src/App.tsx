// التطبيق — 5 تبويبات (اليوم / مساري / تدريبات / منهجية / أنا) + أوضاع جلسة كاملة الشاشة.
// كل الحالة في localStorage. لا خادم، لا تحليلات، لا تبعات ثقيلة.

import { useEffect, useRef, useState } from 'react';
import type { Etat, CarteKafaa } from './types';
import { chargerEtat, sauvegarderEtat, viderStockage } from './utils/storage';
import { ajouterJours, aujourdhui } from './utils/dates';
import { debutSemaine, enregistrerSeance } from './utils/moteur';
import { envoyerSnapshot, syncActive } from './utils/sync';
import type { ItemChemin } from './data/programme';
import type { Qualite } from './utils/srs';
import { mettreAJourSrs } from './utils/srs';
import Aujourdhui from './components/Aujourdhui';
import Masari from './components/Masari';
import Exercices from './components/Exercices';
import Methodologie from './components/Methodologie';
import Ana from './components/Ana';
import ProtocoleRunner from './components/ProtocoleRunner';
import SessionRevision from './components/SessionRevision';
import JalonUnite from './components/JalonUnite';
import LecteurLecon from './components/LecteurLecon';
import AtelierDomaine1 from './components/AtelierDomaine1';
import AtelierImmunite from './components/AtelierImmunite';
import AtelierOrogenese from './components/AtelierOrogenese';
import AtelierStructureTerre from './components/AtelierStructureTerre';
import EcranDemarrage from './components/EcranDemarrage';
import Inscription from './components/Inscription';
import BaguetteXp from './components/BaguetteXp';
import { fermerSession, ouvrirSession, sessionOuverte } from './utils/compte';
import type { Compte } from './types';
import {
  IcoCarnet,
  IcoCle,
  IcoDumbbell,
  IcoRoute,
  IcoSoleil,
} from './components/Icones';

type Onglet = 'aujourdhui' | 'masari' | 'exercices' | 'methodo' | 'ana';
type Mode =
  | { type: 'methodoExos' }
  | { type: 'structureTerre' }
  | { type: 'orogenese' }
  | { type: 'immunite' }
  | { type: 'atelier'; domaineId: string }
  | { type: 'protocole'; lessonId: string }
  | { type: 'revision'; lessonIds: string[] }
  | { type: 'jalon'; uniteId: string }
  | { type: 'lecture'; lessonId: string; retour?: Mode };

const ONGLETS: { id: Onglet; label: string; icone: typeof IcoSoleil }[] = [
  { id: 'aujourdhui', label: 'اليوم', icone: IcoSoleil },
  { id: 'masari', label: 'مساري', icone: IcoRoute },
  { id: 'methodo', label: 'منهجية', icone: IcoCle },
  { id: 'exercices', label: 'تدريبات', icone: IcoDumbbell },
  { id: 'ana', label: 'أنا', icone: IcoCarnet },
];

export default function App() {
  const [etat, setEtat] = useState<Etat>(() => chargerEtat());
  const [onglet, setOnglet] = useState<Onglet>('aujourdhui');
  const [mode, setMode] = useState<Mode | null>(null);
  const [ouverteLecon, setOuverteLecon] = useState<string | null>(null);
  // قراءة الدرس مُفروضة: لا تُفتح بوّابة المرحلة 1 قبل فتح القارئ وإغلاقه فعلًا
  const [leconLue, setLeconLue] = useState(false);
  const [demarrage, setDemarrage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('kunz_demarrage');
  });
  // جلسة الدخول: تبقى مفتوحة ما دام التبويب مفتوحًا (لا كلمة مرور في كل تحميل)
  const [session, setSession] = useState<boolean>(() => sessionOuverte(etat.compte?.email));

  function fermerDemarrage() {
    sessionStorage.setItem('kunz_demarrage', '1');
    setDemarrage(false);
  }

  // ───────────── الحساب ─────────────

  function onCompteValide(compte: Compte) {
    setEtat((prev) => ({ ...prev, compte, consentementSync: true }));
    ouvrirSession(compte.email);
    setSession(true);
  }

  function onDeconnexion() {
    fermerSession();
    setSession(false);
    setOnglet('aujourdhui');
    setMode(null);
  }

  function onSupprimerCompte() {
    fermerSession();
    setSession(false);
    setEtat((prev) => {
      const suivant = { ...prev };
      delete suivant.compte;
      return suivant;
    });
  }

  useEffect(() => {
    // إعادة حساب إجمالي الدقائق من كل الدروس (تفادي التراكم)
    const minutes = Object.values(etat.progression).reduce((s, p) => s + (p.minutes ?? 0), 0);
    sauvegarderEtat({ ...etat, minutesTotales: minutes });
  }, [etat]);

  // ───────────── المزامنة الاختيارية (صامتة، offline-first) ─────────────

  const etatRef = useRef(etat);
  etatRef.current = etat;

  useEffect(() => {
    if (!syncActive()) return;
    // بعد كل تغيير: انتظر 6 ثوانٍ ثم أرسل (تفادي الإرسال المتكرر)
    const delai = setTimeout(() => void envoyerSnapshot(etatRef.current), 6000);
    // عند تصغير التطبيق أو تبديل التبويب: أرسل فورًا
    const onVisibilite = () => {
      if (document.visibilityState === 'hidden') void envoyerSnapshot(etatRef.current);
    };
    // عند عودة الشبكة: أرسل ما تجمّع
    const onLigne = () => void envoyerSnapshot(etatRef.current);
    document.addEventListener('visibilitychange', onVisibilite);
    window.addEventListener('online', onLigne);
    return () => {
      clearTimeout(delai);
      document.removeEventListener('visibilitychange', onVisibilite);
      window.removeEventListener('online', onLigne);
    };
  }, [etat]);

  // ───────────── فتح بنود الطريق ─────────────

  function ouvrirItem(item: ItemChemin): void {
    if (item.type === 'jalon') {
      setMode({ type: 'jalon', uniteId: item.uniteId });
      return;
    }
    const terminee = etat.progression[item.id]?.statut === 'terminee';
    if (terminee) {
      setMode({ type: 'lecture', lessonId: item.id });
      return;
    }
    // حصّة جديدة تُحتسب في الحصّة اليومية (أو تُسجّل كإضافية)
    setEtat((prev) => {
      const comptees = prev.seancesJour === aujourdhui() ? prev.seancesComptees : 0;
      const suivant = enregistrerSeance(prev);
      if (comptees >= 1) suivant.bonusJour = aujourdhui();
      return suivant;
    });
    setLeconLue(false);
    setMode({ type: 'protocole', lessonId: item.id });
  }

  // ───────────── ردود البروتوكول ─────────────

  function onProgresse(lessonId: string, p: Etat['progression'][string]): void {
    setEtat((prev) => ({ ...prev, progression: { ...prev.progression, [lessonId]: p } }));
  }

  function onTerminer(lessonId: string, p: Etat['progression'][string]): void {
    setEtat((prev) => ({
      ...prev,
      progression: { ...prev.progression, [lessonId]: p },
      revisions: prev.revisions,
    }));
    setMode(null);
  }

  // ───────────── الاسترجاع ─────────────

  function onResultatRevision(lessonId: string, qualite: Qualite): void {
    setEtat((prev) => {
      const p = prev.progression[lessonId];
      if (!p) return prev;
      return {
        ...prev,
        progression: { ...prev.progression, [lessonId]: mettreAJourSrs(p, qualite) },
        revisions: prev.revisions + 1,
      };
    });
  }

  // ───────────── الجسر ─────────────

  function onEnregistrerJalon(uniteId: string, synthese: string): void {
    setEtat((prev) => ({
      ...prev,
      jalons: {
        ...prev.jalons,
        [uniteId]: { fait: true, synthese, ts: new Date().toISOString() },
      },
    }));
    setMode(null);
  }

  // ───────────── التدريبات ─────────────

  function onItemReussi(id: string): void {
    setEtat((prev) =>
      prev.drills?.[id]
        ? prev
        : { ...prev, drills: { ...(prev.drills ?? {}), [id]: true } }
    );
  }

  // ───────────── بطاقات الكفاءة (منهجية) — même SM-2 que les leçons ─────────────

  /** Réussite d'un exercice de منهجية ou auto-évaluation d'une revue : la carte كفاءة
   *  est programmée par mettreAJourSrs (réussite directe → J+3, réussite après erreurs → J+1).
   *  `estRevue` est réservé à la revue hebdomadaire de l'écran اليوم : seule une REVUE
   *  consomme le quota kafaaHebdo (≤ 2 par semaine). Une réussite d'exercice crée ou
   *  programme la carte SANS épuiser le quota (audit : sinon, plus on s'entraîne,
   *  plus vite le planificateur se désactive). */
  function onResultatKafaa(
    key: string,
    qualite: Qualite,
    meta: { verbe: string; exercice: string; erreur: string },
    estRevue = false
  ): void {
    setEtat((prev) => {
      const existante = prev.kafaa?.[key];
      const auj = aujourdhui();
      // Déjà programmée pour plus tard : pas d'accélération le même jour.
      if (existante?.prochaineRevision && existante.prochaineRevision > auj) return prev;
      const base: CarteKafaa = existante ?? {
        verbe: meta.verbe,
        exercice: meta.exercice,
        erreur: meta.erreur,
        repetitions: 0,
        intervalle: 0,
        facilite: 2.5,
      };
      const maj = mettreAJourSrs(base, qualite);
      // Réussite directe : premier palier J+3 (audit) ; réussite avec erreurs : J+1.
      if (maj.repetitions === 1 && qualite === 5) {
        maj.intervalle = 3;
        maj.prochaineRevision = ajouterJours(aujourdhui(), 3);
      }
      const debut = debutSemaine(aujourdhui());
      const hebdo = prev.kafaaHebdo?.debut === debut ? prev.kafaaHebdo.n : 0;
      return {
        ...prev,
        kafaa: { ...(prev.kafaa ?? {}), [key]: maj },
        // Seule une REVUE (écran اليوم) consomme le quota hebdomadaire (≤ 2) ;
        // une réussite d'exercice programme la carte sans l'épuiser.
        ...(estRevue ? { kafaaHebdo: { debut, n: hebdo + 1 } } : {}),
      };
    });
  }

  // ───────────── موافقة المزامنة ─────────────

  function onConsentementSync(ok: boolean): void {
    setEtat((prev) => ({ ...prev, consentementSync: ok }));
    if (ok) void envoyerSnapshot(etatRef.current);
  }

  // ───────────── الملاحظات والهوية ─────────────

  function onSupprimerNote(id: string): void {
    setEtat((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
  }

  function onReinitialiser(): void {
    viderStockage();
    setEtat(chargerEtat());
    setMode(null);
    setOnglet('aujourdhui');
  }

  function onTerminerAtelier(domaineId: string): void {
    setEtat((prev) => ({
      ...prev,
      ateliers: {
        ...(prev.ateliers ?? {}),
        [domaineId]: { fait: true, ts: new Date().toISOString() },
      },
    }));
    setMode(null);
  }

  // ───────────── الأوضاع كاملة الشاشة ─────────────

  if (mode) {
    // القارئ يُفتح فوق الورشة فلا يُفقد التقدّم المكتسب فيها
    const lecteurAtelier = ouverteLecon ? (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
        <LecteurLecon lessonId={ouverteLecon} onFermer={() => setOuverteLecon(null)} />
      </div>
    ) : null;

    // تمارين المنهجية: 3e porte de تدريبات — ouverte directement sur مستويات التدريب,
    // la fermeture (setMode(null)) retourne à l'onglet تدريبات.
    if (mode.type === 'methodoExos') {
      return (
        <Methodologie
          modeInitial="niveaux"
          onFermer={() => setMode(null)}
          onResultatKafaa={onResultatKafaa}
        />
      );
    }
    if (mode.type === 'structureTerre') {
      return (
        <AtelierStructureTerre
          onFermer={() => setMode(null)}
          onTerminer={() => onTerminerAtelier('structure')}
        />
      );
    }
    if (mode.type === 'orogenese') {
      return (
        <>
          <AtelierOrogenese
            onFermer={() => setMode(null)}
            onTerminer={() => onTerminerAtelier('orogenese')}
            onVoirLecon={() => setOuverteLecon('phase21_chapitres_41_42_2')}
          />
          {lecteurAtelier}
        </>
      );
    }
    if (mode.type === 'immunite') {
      return (
        <>
          <AtelierImmunite
            onFermer={() => setMode(null)}
            onTerminer={() => onTerminerAtelier('immunite')}
            onVoirLecon={() => setOuverteLecon('phase7_chapitres_13_14_2')}
          />
          {lecteurAtelier}
        </>
      );
    }
    if (mode.type === 'atelier') {
      return (
        <>
          <AtelierDomaine1
            fait={Boolean(etat.ateliers?.[mode.domaineId])}
            onTerminer={() => onTerminerAtelier(mode.domaineId)}
            onFermer={() => setMode(null)}
            onVoirLecon={() => setOuverteLecon('lecon_transcription')}
          />
          {lecteurAtelier}
        </>
      );
    }
    if (mode.type === 'protocole') {
      return (
        <>
          <ProtocoleRunner
            key={mode.lessonId}
            lessonId={mode.lessonId}
            progression={etat.progression[mode.lessonId]}
            onProgresse={(p) => onProgresse(mode.lessonId, p)}
            onTerminer={(p) => onTerminer(mode.lessonId, p)}
            onLireLecon={() => setOuverteLecon(mode.lessonId)}
            leconLue={leconLue}
            onFermer={() => setMode(null)}
          />
          {ouverteLecon && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
              <LecteurLecon
                lessonId={ouverteLecon}
                onFermer={() => {
                  setOuverteLecon(null);
                  setLeconLue(true);
                }}
              />
            </div>
          )}
        </>
      );
    }
    if (mode.type === 'revision') {
      return (
        <SessionRevision
          lessonIds={mode.lessonIds}
          onResultat={onResultatRevision}
          onFermer={() => setMode(null)}
        />
      );
    }
    if (mode.type === 'jalon') {
      return (
        <JalonUnite
          uniteId={mode.uniteId}
          etat={etat}
          onEnregistrer={(synthese) => onEnregistrerJalon(mode.uniteId, synthese)}
          onRelireLecon={(lessonId) =>
            setMode({ type: 'lecture', lessonId, retour: { type: 'jalon', uniteId: mode.uniteId } })
          }
          onFermer={() => setMode(null)}
        />
      );
    }
    return (
      <LecteurLecon
        lessonId={mode.lessonId}
        onFermer={() => setMode(mode.retour ?? null)}
      />
    );
  }

  const inscrit = Boolean(etat.compte) && session;
  // لا تبويبات ولا شارة قبل اكتمال شاشة الإقلاع وفتح حساب
  const pret = inscrit && !demarrage;

  return (
    <div className="min-h-dvh">
      {demarrage && <EcranDemarrage onTerminer={fermerDemarrage} />}
      {!demarrage && !inscrit && (
        <Inscription
          compte={etat.compte}
          onValide={onCompteValide}
          onSupprimerCompte={etat.compte ? onSupprimerCompte : undefined}
        />
      )}
      {pret && mode === null && <BaguetteXp etat={etat} onDeconnexion={onDeconnexion} />}
      {pret && onglet === 'aujourdhui' && (
        <Aujourdhui
          etat={etat}
          onOuvrirItem={ouvrirItem}
          onDemarrerRevision={(lessonIds) => setMode({ type: 'revision', lessonIds })}
          onVoirUnite={(uniteId) => setMode({ type: 'jalon', uniteId })}
          onResultatKafaa={onResultatKafaa}
          onOuvrirMethodologie={() => setOnglet('methodo')}
        />
      )}
      {pret && onglet === 'masari' && (
        <Masari
          etat={etat}
          onOuvrirItem={ouvrirItem}
          onVoirUnite={(uniteId) => setMode({ type: 'jalon', uniteId })}
        />
      )}
      {pret && onglet === 'exercices' && (
        <Exercices
          etat={etat}
          onItemReussi={onItemReussi}
          onOuvrirAtelier={() => setMode({ type: 'atelier', domaineId: 'd1' })}
          onOuvrirImmunite={() => setMode({ type: 'immunite' })}
          onOuvrirOrogenese={() => setMode({ type: 'orogenese' })}
          onOuvrirStructureTerre={() => setMode({ type: 'structureTerre' })}
          onOuvrirMethodo={() => setMode({ type: 'methodoExos' })}
        />
      )}
      {pret && onglet === 'methodo' && (
        <Methodologie
          onFermer={() => setOnglet('aujourdhui')}
          onResultatKafaa={onResultatKafaa}
        />
      )}
      {pret && onglet === 'ana' && (
        <Ana
          etat={etat}
          onNom={(nom) => setEtat((prev) => ({ ...prev, nom }))}
          onDateBac={(iso) => setEtat((prev) => ({ ...prev, dateBac: iso }))}
          onSupprimerNote={onSupprimerNote}
          onReinitialiser={onReinitialiser}
          onDeconnexion={onDeconnexion}
          onConsentementSync={onConsentementSync}
        />
      )}

      {/* شريط التنقّل السفلي */}
      {pret && (
        <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-3xl">
          {ONGLETS.map((o) => {
            const Ico = o.icone;
            const actif = o.id === onglet;
            return (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className="relative flex flex-1 flex-col items-center gap-1 px-2 py-2.5"
                aria-current={actif ? 'page' : undefined}
              >
                <span
                  className={`block h-6 w-6 transition-colors ${
                    actif ? 'text-forest' : 'text-mute'
                  }`}
                >
                  <Ico />
                </span>
                <span
                  className={`text-[10px] font-bold transition-colors ${
                    actif ? 'text-forest' : 'text-mute'
                  }`}
                >
                  {o.label}
                </span>
                {actif && (
                  <span className="absolute top-0 h-1 w-8 rounded-b-full bg-forest" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}

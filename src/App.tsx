// التطبيق — 4 تبويبات (اليوم / مساري / البكالوريا / أنا) + أوضاع جلسة كاملة الشاشة.
// كل الحالة في localStorage. لا خادم، لا تحليلات، لا تبعات ثقيلة.

import { useEffect, useState } from 'react';
import type { Etat } from './types';
import { chargerEtat, sauvegarderEtat, viderStockage } from './utils/storage';
import { aujourdhui } from './utils/dates';
import { enregistrerSeance } from './utils/moteur';
import type { ItemChemin } from './data/programme';
import type { Qualite } from './utils/srs';
import { mettreAJourSrs } from './utils/srs';
import Aujourdhui from './components/Aujourdhui';
import Masari from './components/Masari';
import Bac from './components/Bac';
import Ana from './components/Ana';
import ProtocoleRunner from './components/ProtocoleRunner';
import SessionRevision from './components/SessionRevision';
import JalonUnite from './components/JalonUnite';
import LecteurLecon from './components/LecteurLecon';
import AtelierDomaine1 from './components/AtelierDomaine1';
import AtelierImmunite from './components/AtelierImmunite';
import AtelierOrogenese from './components/AtelierOrogenese';
import AtelierStructureTerre from './components/AtelierStructureTerre';
import Methodologie from './components/Methodologie';
import EcranDemarrage from './components/EcranDemarrage';
import {
  IcoCarnet,
  IcoDiplome,
  IcoRoute,
  IcoSoleil,
} from './components/Icones';

type Onglet = 'aujourdhui' | 'masari' | 'bac' | 'ana';
type Mode =
  | { type: 'methodologie' }
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
  { id: 'bac', label: 'البكالوريا', icone: IcoDiplome },
  { id: 'ana', label: 'أنا', icone: IcoCarnet },
];

export default function App() {
  const [etat, setEtat] = useState<Etat>(() => chargerEtat());
  const [onglet, setOnglet] = useState<Onglet>('aujourdhui');
  const [mode, setMode] = useState<Mode | null>(null);
  const [ouverteLecon, setOuverteLecon] = useState<string | null>(null);
  const [demarrage, setDemarrage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('kunz_demarrage');
  });

  function fermerDemarrage() {
    sessionStorage.setItem('kunz_demarrage', '1');
    setDemarrage(false);
  }

  useEffect(() => {
    // إعادة حساب إجمالي الدقائق من كل الدروس (تفادي التراكم)
    const minutes = Object.values(etat.progression).reduce((s, p) => s + (p.minutes ?? 0), 0);
    sauvegarderEtat({ ...etat, minutesTotales: minutes });
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

  // ───────────── النسخ والملاحظات والهوية ─────────────

  function onCopie(): void {
    setEtat((prev) => ({ ...prev, copies: (prev.copies ?? 0) + 1 }));
  }

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
    if (mode.type === 'methodologie') {
      return <Methodologie onFermer={() => setMode(null)} />;
    }
    if (mode.type === 'structureTerre') {
      return <AtelierStructureTerre onFermer={() => setMode(null)} onTerminer={() => setMode(null)} />;
    }
    if (mode.type === 'orogenese') {
      return <AtelierOrogenese onFermer={() => setMode(null)} onTerminer={() => setMode(null)} />;
    }
    if (mode.type === 'immunite') {
      return <AtelierImmunite onFermer={() => setMode(null)} onTerminer={() => setMode(null)} />;
    }
    if (mode.type === 'atelier') {
      return (
        <AtelierDomaine1
          fait={Boolean(etat.ateliers?.[mode.domaineId])}
          onTerminer={() => onTerminerAtelier(mode.domaineId)}
          onFermer={() => setMode(null)}
        />
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
            onFermer={() => setMode(null)}
          />
          {ouverteLecon && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
              <LecteurLecon
                lessonId={ouverteLecon}
                onFermer={() => setOuverteLecon(null)}
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

  return (
    <div className="min-h-dvh">
      {demarrage && <EcranDemarrage onTerminer={fermerDemarrage} />}
      {onglet === 'aujourdhui' && (
        <Aujourdhui
          etat={etat}
          onOuvrirItem={ouvrirItem}
          onDemarrerRevision={(lessonIds) => setMode({ type: 'revision', lessonIds })}
          onVoirUnite={(uniteId) => setMode({ type: 'jalon', uniteId })}
        />
      )}
      {onglet === 'masari' && (
        <Masari
          etat={etat}
          onOuvrirItem={ouvrirItem}
          onVoirUnite={(uniteId) => setMode({ type: 'jalon', uniteId })}
          onOuvrirAtelier={() => setMode({ type: 'atelier', domaineId: 'd1' })}
          onOuvrirImmunite={() => setMode({ type: 'immunite' })}
          onOuvrirOrogenese={() => setMode({ type: 'orogenese' })}
          onOuvrirStructureTerre={() => setMode({ type: 'structureTerre' })}
        />
      )}
      {onglet === 'bac' && <Bac etat={etat} onCopie={onCopie} onOuvrirMethodologie={() => setMode({ type: 'methodologie' })} />}
      {onglet === 'ana' && (
        <Ana
          etat={etat}
          onNom={(nom) => setEtat((prev) => ({ ...prev, nom }))}
          onDateBac={(iso) => setEtat((prev) => ({ ...prev, dateBac: iso }))}
          onSupprimerNote={onSupprimerNote}
          onReinitialiser={onReinitialiser}
        />
      )}

      {/* شريط التنقّل السفلي */}
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
    </div>
  );
}

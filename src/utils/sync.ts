// المزامنة الاختيارية — تُرسل ملخّص تقدّم التلميذ إلى قاعدة بيانات المطوّر (Supabase)
// فقط عند موافقته الصريحة. لا كلمات مرور، لا ملاحظات شخصية، لا حظر عند انقطاع الشبكة:
// التطبيق يعمل offline دائمًا، والمزامنة مجرّد إضافة صامتة في الخلفية.

import type { Etat } from '../types';
import { xpDe, niveauDe } from './xp';
import { statsActuelles } from './stats';

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const CLE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const VERSION_APP = '0.5.0';

// المزامنة مفعّلة فقط إذا وُضعت مفاتيح Supabase في .env — وإلّا تتحوّل تلقائيًا إلى لا شيء.
export function syncActive(): boolean {
  return Boolean(URL_SUPABASE && CLE_ANON);
}

// ما يُرسَل: أرقام ومعرّفات الدروس/الجسور/التدريبات فقط. لا كلمات مرور ولا نصوص الملاحظات.
export interface Snapshot {
  email: string;
  wilaya: string;
  daira: string;
  cree_le: string;
  nom: string;
  date_bac: string | null;
  xp: number;
  niveau: string;
  lecons_terminees: string[];
  lecons_en_cours: string[];
  lecons_fragiles: string[];
  jalons_faits: string[];
  ateliers_faits: string[];
  drills_faits: number;
  minutes_totales: number;
  revisions: number;
  seances_comptees: number;
  jours_activite: string[];
  reponses_justes: number;
  reponses_fausses: number;
  notes_nombre: number;
  app_version: string;
  maj: string;
}

export function construireSnapshot(etat: Etat): Snapshot | null {
  if (!etat.compte) return null;
  const stats = statsActuelles();
  const lecons = Object.entries(etat.progression);
  const xp = xpDe(etat);
  return {
    email: etat.compte.email,
    wilaya: etat.compte.wilaya,
    daira: etat.compte.daira,
    cree_le: etat.compte.creeLe,
    nom: etat.nom,
    date_bac: etat.dateBac ?? null,
    xp,
    niveau: niveauDe(xp).nom,
    lecons_terminees: lecons.filter(([, p]) => p.statut === 'terminee').map(([id]) => id),
    lecons_en_cours: lecons.filter(([, p]) => p.statut === 'en_cours').map(([id]) => id),
    lecons_fragiles: lecons.filter(([, p]) => p.fragile).map(([id]) => id),
    jalons_faits: Object.entries(etat.jalons).filter(([, j]) => j.fait).map(([id]) => id),
    ateliers_faits: Object.entries(etat.ateliers ?? {}).filter(([, a]) => a.fait).map(([id]) => id),
    drills_faits: Object.keys(etat.drills ?? {}).length,
    minutes_totales: etat.minutesTotales,
    revisions: etat.revisions,
    seances_comptees: etat.seancesComptees,
    jours_activite: [...new Set(etat.journal)].sort(),
    reponses_justes: stats.justes,
    reponses_fausses: stats.fausses,
    notes_nombre: etat.notes.length,
    app_version: VERSION_APP,
    maj: new Date().toISOString(),
  };
}

// ───────────── العميل (يُحمّل عند أول إرسال فقط — لا يثقل حزمة التطبيق الأساسية) ─────────────

let client: import('@supabase/supabase-js').SupabaseClient | null = null;
let enCours = false;
let dernierEnvoye = '';

async function clientSupabase() {
  if (!syncActive()) return null;
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(URL_SUPABASE as string, CLE_ANON as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

// إرسال صامت: أي خطأ يُبتلع — التطبيق لا يعتمد على نجاحها أبدًا.
export async function envoyerSnapshot(etat: Etat): Promise<void> {
  if (!syncActive()) return;
  if (!etat.compte || etat.consentementSync === false) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  const snap = construireSnapshot(etat);
  if (!snap) return;
  const json = JSON.stringify(snap);
  if (json === dernierEnvoye) return; // لا شيء تغيّر منذ آخر إرسال
  if (enCours) return; // لا إرسالان متزامنان
  enCours = true;
  try {
    const sb = await clientSupabase();
    if (!sb) return;
    const { error } = await sb.from('eleves').upsert(
      {
        email: snap.email,
        wilaya: snap.wilaya,
        daira: snap.daira,
        cree_le: snap.cree_le,
        nom: snap.nom,
        date_bac: snap.date_bac,
        xp: snap.xp,
        niveau: snap.niveau,
        lecons_terminees: snap.lecons_terminees.length,
        lecons_en_cours: snap.lecons_en_cours.length,
        lecons_fragiles: snap.lecons_fragiles.length,
        jalons_faits: snap.jalons_faits.length,
        ateliers_faits: snap.ateliers_faits.length,
        drills_faits: snap.drills_faits,
        minutes_totales: snap.minutes_totales,
        revisions: snap.revisions,
        seances_comptees: snap.seances_comptees,
        jours_activite: snap.jours_activite.length,
        reponses_justes: snap.reponses_justes,
        reponses_fausses: snap.reponses_fausses,
        notes_nombre: snap.notes_nombre,
        app_version: snap.app_version,
        maj: snap.maj,
        charge_utile: snap as unknown as Record<string, unknown>,
      },
      { onConflict: 'email' },
    );
    if (!error) {
      dernierEnvoye = json;
    } else {
      console.warn('[sync] فشل الإرسال:', error.message);
    }
  } catch (e) {
    console.warn('[sync] استثناء:', e);
  } finally {
    enCours = false;
  }
}

// حالة المزامنة: مفعّلة افتراضيًّا — التلميذ يستطيع إيقافها من «أنا»
export function consentementEtat(etat: Etat): 'oui' | 'non' {
  return etat.consentementSync === false ? 'non' : 'oui';
}

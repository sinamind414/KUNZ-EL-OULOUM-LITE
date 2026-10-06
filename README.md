# كنز العلوم Lite — تطبيق مراجعة البكالوريا (الجزائر)

تطبيق ويب تقدّمي (**PWA**) 100% عربي (RTL)، يعمل دون اتصال، لتعليم التلميذ **كيف يراجع** مادة
علوم الطبيعة والحياة لشهادة البكالوريا — علوم تجريبية — وفق **بروتوكول المراجعة في 6 مراحل**،
مطبّقًا على البرنامج الرسمي كاملًا (3 مجالات → 11 وحدة → 58 درسًا).

> اللغة: التطبيق عربي بالكامل. الكلمات اللاتينية مخصصة للمصطلحات العلمية فقط (ADN، ATP، LTc،
> pH، CMH، HbS…). هذه الوثيقة موجّهة للمطوّر، لذلك هي بالفرنسية.

---

## 🏴‍☠️ Écran de démarrage (splash)

Au premier chargement de l'app (une fois par session d'onglet, via `sessionStorage['kunz_demarrage']`),
un écran plein écran noir joue la **vidéo d'ouverture officielle** (`public/ouverture.mp4`,
1080×1920, 5 s, muette) :

- la vidéo se lance en auto-play **muet** (aucun téléchargement supplémentaire, fichier local),
- à la fin de la vidéo (ou au clic n'importe où sur l'écran) apparaissent le titre
  « كنز العلوم Lite » et le bouton « ابدأ ← » (fondu échelonné),
- le clic sur le bouton ferme l'écran (fondu 600 ms) et révèle l'application.

> Pas de son : la vidéo est volontairement muette (choix de l'auteur).

---

## 🧭 Architecture « OPUS » (v0.3)

L'application n'est **pas** un sommaire de cours : c'est un **chemin**. Quatre onglets, un moteur qui
décide de la prochaine action, et des **portes verrouillées** qui empêchent l'élève de courir avant de
marcher.

### Les 4 onglets

| Onglet | Rôle |
|---|---|
| **اليوم** | L'écran d'accueil. Une seule carte : la *prochaine action* (Next Best Action), le rythme de la semaine, la position par rapport à la classe. |
| **مساري** | Le chemin complet : 11 unités verrouillées séquentiellement, chacune se terminant par un **جسر** (pont-jalon). |
| **البكالوريا** | La date du Bac, le compte des leçons, le diagnostic des leçons fragiles. |
| **أنا** | Le journal, les notes, les copies, les statistiques, le bouton de réinitialisation. |

### 🔮 Le moteur Next Best Action (`src/utils/moteur.ts`)

`prochaineAction(etat)` décide **toujours** la même chose, dans cet ordre de priorité :

1. **استئناف** — une leçon démarrée mais non terminée → on reprend à la phase exacte où l'élève s'est
   arrêté. Une séance interrompue n'est jamais perdue.
2. **الاسترجاع** — une leçon dont la date de révision SM-2 est arrivée → **priorité absolue**, elle
   bloque tout nouveau contenu (`retard bloquant`).
3. **حصّة جديدة** — une nouvelle leçon, **une seule par jour** (quota `seancesComptees`).
4. **حصّة إضافية** — un bonus par jour (`bonusJour`), pour l'élève qui veut aller plus loin.
5. **يكفي اليوم** — quota atteint → message de repos. Le repos fait partie de la méthode.
6. **النهاية** — les 58 leçons sont terminées.

### 🔒 Le chemin verrouillé (`CHEMIN` dans `programme.ts`)

Chaque unité est une liste ordonnée `[...prerequis, ...lecons, 'jalon:uX']`. **Un item n'est
accessible que si tout ce qui le précède est terminé.** Pas d'écran « liste des leçons », pas de
possibilité de sauter une unité. C'est la garantie anti-accumulation des lacunes.

### 🌉 Les jalons unités (`JalonUnite.tsx`)

À la fin de chaque unité, un **pont** à 3 étapes :
1. Question de synthèse de l'unité (frappe ≥ 30 caractères, écrite de mémoire).
2. **مواجهة الفخّين** — l'élève confronte les pièges officiels de l'unité (`piegésAr`).
3. **آخر تفتيش** — synthèse finale avant l'ouverture de l'unité suivante.

Le pont validé → l'unité suivante se déverrouille.

### 🚪 Les portes dures des 6 phases (`ProtocoleRunner.tsx`)

**Aucun bouton « passer ».** Chaque phase a une porte qui active le bouton suivant :

| Phase | Durée | Porte |
|---|---|---|
| 1 — سؤال الدرس والقراءة الكاملة | 8 min | **lecture du cours obligatoire** (lien vers le cours interactif) + QCM « combien d'étapes causales ? » |
| 2 — الأنماط | 3 min | classer 1 mot-clé par catégorie (avant/nouveau) |
| 3 — أول استرجاع بعد القراءة | 5 min | écrire un rappel de ≥ 15 caractères |
| 4 — الهيكل العظمي | 5 min | construire le squelette, puis le révéler |
| 5 — القراءة الموجهة | 15 min | QCM « quelle étape vient après la étape N ? » |
| 6 — الترسية | 10 min | écrire la phrase du Bac (≥ 25 caractères) + auto-évaluation contre l'erreur nucléaire |

**2 échecs à une porte QCM** → révélation de la réponse + la phase est marquée **هشّة** (fragile) et
reprogrammée à **J+1** au lieu de J+3. L'échec n'est pas puni, il est *utilisé*.

### 🌿 Le Mُرشد (Morchid)

Le Mُرشد parle **uniquement** aux phases 1, 3, 5, 6 + l'écran de clôture (`PHASES_PARLANTES`).
Partout ailleurs, l'élève est seul avec le contenu — la méthode se tait pour ne pas devenir du bruit.

La valve **« أنا عالق »** (je suis bloqué) donne **2 indices par phase**, pas plus. Demander de l'aide
est un droit, en abuser est impossible.

### 🧊 L'anti-stress

- **Aucun pourcentage** affiché nulle part.
- **Aucune série de jours** qui risque de se casser (le rythme est présenté en jours comptés, pas en
  série `🔥 12 jours`).
- **Aucun compte à rebours angoissant** : le minuteur par phase est soft, désactivable.
- **Les nombres en lettres arabes** (`enArabe`, `enArabeMin`, `compteLecons`, `compteLeconsAdj`) —
  respect des règles de grammaire arabe : `درس واحد` / `درجان` / `٥ دروس` / `٨١ درسًا`, et l'accord de
  l'adjectif (`درس واحد مستحقّ` / `درجان مستحقّان`).

### 📅 Le calendrier scolaire (`src/utils/dates.ts`)

Les 11 unités ont chacune une **fenêtre** (`fenetre`) alignée sur l'année scolaire algérienne (début
2026-09-14) et un **poids au Bac** (`poidsBac`). L'écran اليوم indique si l'élève est dans la fenêtre
de son unité — l'objectif est de rester synchronisé avec la classe, un cours à la fois.

---

## 📖 Correspondance champ du résumé ↔ phase

La source de vérité est `src/data/lessonGoldSummaries.ts` (**58 Résumés d'Or**). Chaque champ alimente
une phase précise :

| Champ `LessonGoldSummary` | Phase | Utilisation |
|---|---|---|
| `questionLecon` (leconsPassives) | 1 | **la question de la leçon, affichée en premier** |
| `missionAr` | 1 | l'énigme affichée comme boussole de lecture |
| `vocabulary` | 2 | jetons à classer (avant/nouveau) |
| `missionAr` + `recallQuestionAr` | 3 | le premier rappel actif après lecture |
| `mechanismAr` | 4 | squelette : cases vides → révélation |
| `mechanismAr` + `evidenceAr` | 5 | étapes causales + preuve documentaire |
| `bacSentenceFrameAr` + `commonErrorAr` | 6 | production écrite + correction atomique |
| `recallQuestionAr` + `vocabulary` | File SM-2 | carte de rappel actif (`SessionRevision`) |

### Les 25 cours interactifs

25 fichiers HTML autonomes (schémas SVG, activités, quiz) dans `public/lecons/` couvrent 46 leçons.
Le **lien du cours s'ouvre dès la phase 1** (`questionLecon` affichée juste au-dessus) : l'élève lit le
cours **en entier avant d'entrer dans la méthode**, comme le ferait un élève avec son manuel. Les
leçons sans cours interactif ont un bouton « راجعتُ الدرس في الكتاب الورقي ✓ » — la lecture reste
obligatoire, sur le papier.

---

## 🔁 La boucle mémoire (SM-2, `src/utils/srs.ts`)

1. **Fin de leçon** → `premiereRevision()` programme J+1 (fragile) ou J+3 (normal).
2. **Le jour venu**, le moteur NBA **bloque les nouvelles leçons** et impose l'`استرجاع`.
3. **`SessionRevision`** en 3 étapes : révélation du rappel → auto-check des termes (8 mots-clés) →
   phrase de synthèse (≥ 12 caractères).
4. **Auto-évaluation** : سهل / متوسط / صعب → qualité 5 / 4 / 3 / 1 → `mettreAJourSrs` recalcule
   l'intervalle (J+1 → J+3 → J+7 → J+14 → J+28).
5. **Aucune date n'est affichée à l'élève** — c'est la machine qui gère. Il voit seulement « حان موعد
   استرجاع هذا الدرس ».

---

## 🏗️ Stack

- **React 19 + TypeScript 7 + Vite 8** — SPA léger
- **Tailwind CSS 4** (plugin `@tailwindcss/vite`) — design RTL mobile-first, palette olive claire
- **PWA manuelle** : `public/manifest.webmanifest` + `public/sw.js` (precache app + 25 leçons,
  navigation network-first)
- **localStorage** (`src/utils/storage.ts`, clé `murajih_svt_v1`, version 2) — offline-first, aucun
  serveur
- **Zéro dépendance lourde** : pas de d3, jspdf, framer-motion…

## 📁 Structure

```
app-svt-bac/
├── index.html                    # lang="ar" dir="rtl"
├── public/
│   ├── manifest.webmanifest      # PWA (nom عربي، rtl، standalone)
│   ├── sw.js                     # service worker (precache 35 entrées)
│   ├── icon.svg
│   └── lecons/                   # 25 fichiers HTML de cours interactifs (46 leçons)
├── src/
│   ├── main.tsx                  # racine + enregistrement du SW
│   ├── index.css                 # Tailwind + base RTL
│   ├── App.tsx                   # 4 onglets : اليوم / مساري / البكالوريا / أنا
│   ├── types.ts                  # État (jalons, notes, journal, séances, bonus)
│   ├── data/
│   │   ├── lessonGoldSummaries.ts # 58 résumés d'or (source de vérité du contenu)
│   │   ├── programme.ts           # 11 unités + CHEMIN + fenêtres + poidsBac + piegésAr
│   │   ├── protocole.ts           # 6 phases (durées 8/3/5/5/15/10 = 46 min)
│   │   └── leconsPassives.ts      # mapping lessonId → cours HTML + question
│   ├── utils/
│   │   ├── moteur.ts              # ⭐ Next Best Action, verrous, quota, rythme, fragilité
│   │   ├── srs.ts                 # SM-2 (premiereRevision / mettreAJourSrs / aReviserAujourdhui)
│   │   ├── dates.ts               # calendrier, nombres arabes, grammaire (compteLeconsAdj…)
│   │   ├── storage.ts             # localStorage (charger/sauvegarder/vider)
│   │   └── accents.ts             # couleurs des 3 domaines
│   └── components/
│       ├── Aujourdhui.tsx         # ⭐ اليوم : NBA + rythme + position classe
│       ├── Masari.tsx             # ⭐ مساري : chemin verrouillé
│       ├── Bac.tsx                # ⭐ البكالوريا : date + diagnostic
│       ├── Ana.tsx                # ⭐ أنا : journal + notes + copies + stats
│       ├── JalonUnite.tsx         # pont à 3 étapes en fin d'unité
│       ├── ProtocoleRunner.tsx    # ⭐ moteur des 6 phases + portes + Mُرشد + clôture
│       ├── SessionRevision.tsx    # rappel SM-2 en 3 étapes
│       ├── LecteurLecon.tsx       # lecture libre (post-terminaison)
│       ├── Communs.tsx            # composants partagés (Carte, ChampTexte, OptionsMcq…)
│       └── Icones.tsx             # icônes SVG inline
```

## 🚀 Installation

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # tsc -b && vite build  → dist/
npm run preview  # tester la version de production
```

> PWA : le service worker **n'est pas** enregistré en mode `dev` (HMR). Faites `npm run build` +
> `npm run preview` pour tester l'installation et le mode hors-ligne.

## 🧠 Parcours élève (journée type)

1. Il ouvre l'app → **اليوم**. Une seule carte : la prochaine action décidée par le moteur.
2. Soit **استئناف** (reprendre là où il s'est arrêté), soit **الاسترجاع** (une révision due, prioritaire),
   soit **حصّة جديدة** (une nouvelle leçon — une seule/jour).
3. La nouvelle leçon ouvre le protocole : **question + lecture du cours obligatoire** → classification
   des mots-clés → **premier rappel après lecture** → squelette → lecture guidée → phrase du Bac.
4. À la fin : message de clôture du Mُرشد + programmation de la prochaine révision (J+1 si fragile,
   J+3 sinon).
5. Quand le moteur dit **يكفي اليوم**, l'élève s'arrête. Le repos fait partie de la méthode.
6. En fin d'unité : le **جسر** (jalon à 3 étapes) débloque l'unité suivante.

## 🧹 Nettoyage déjà effectué sur `lessonGoldSummaries.ts`

Le fichier fourni (71 entrées) a été traité avant intégration :

- ✅ **13 doublons fusionnés** → 58 leçons uniques (ex. `synapse` ≡ `phase9_chapitres_17_18`,
  `subduction` ≡ `d3-u9-l2-benioff` ≡ `phase17_chapitres_33_34`).
- ✅ Mot anglais `presenting` effacé d'une phrase arabe.
- ✅ `D-غالاکتوز` : « ک » farsi remplacé par « ك » arabe.
- ✅ `البرنس` (×21) uniformisé en `الوشاح` (manteau).
- ✅ Homonyme `البذرة` désambiguïsé : Granum (U6) conservé, noyau interne (U10) → `النواة الداخلية`.
- ✅ `enzyme_inhibitors` et `amino_acid_behavior` rattachés à U3 comme **متطلبات سابقة**.

### ⚠️ Ce qu'il reste à faire (statut éditorial)

- **0/58 leçon relue** (`review.reviewed: false`). Toutes sont en `adaptation_pedagogique`.
  → Prévoir une relecture professeur et passer `status` à `manuel_officiel_verifie`.
- **Ordre des étapes à revoir** : U1 leçon 1, l'étape 4 (transcription) est logiquement antérieure à
  l'étape 3 (synthèse sur les ribosomes). Le QCM de séquence en P5 reste cohérent avec l'ordre déclaré,
  mais l'ordre du résumé n'est pas pédagogique.
- **`bacSentenceFrameAr` manquant** sur la première leçon (le cadre P6 s'affiche vide).
- Convention d'IDs non uniforme (`phaseN_chapitres_X_Y` vs `dN-uM-lK-*`) — fonctionnel, mais à
  normaliser si vous éditez le fichier à la main.

## 🗺️ Roadmap

- **v0.1** — protocole 6 phases + file SM-2 + suivi offline.
- **v0.2** — rubrique الدروس : 46 cours interactifs reliés à la méthode.
- **v0.3 (actuelle)** — **architecture OPUS** : 4 onglets (اليوم / مساري / البكالوريا / أنا), moteur
  Next Best Action, chemin linéaire verrouillé, portes dures, jalons unités (جسر), Mُرشد, anti-stress,
  lecture du cours obligatoire en phase 1, calendrier scolaire aligné.
- **v0.3.1** — renommage **كنز العلوم Lite** + écran de démarrage animé (logo, jingle pirate).
- **v0.4** — mode examen blanc (sujet Bac), mini-quiz QCM par leçon, carnet des failles (erreurs
  atomiques exportées), schémas SVG légers pour les expériences historiques.

---

كنز العلوم Lite — مراجعة موفّقة. التكرار يبني الذاكرة، لا الحفظ المتكرّر. 🧬

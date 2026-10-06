-- ──────────────────────────────────────────────────────────────────────────────
-- كنز العلوم Lite — مخطّط المزامنة الاختيارية
-- يُنسخ مرّة واحدة في Supabase Studio (SQL Editor → New query → Run)
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists public.eleves (
  email             text primary key,
  wilaya            text,
  daira             text,
  cree_le           timestamptz,
  nom               text,
  date_bac          date,
  xp                integer default 0,
  niveau            text,
  lecons_terminees  integer default 0,
  lecons_en_cours   integer default 0,
  lecons_fragiles   integer default 0,
  jalons_faits      integer default 0,
  ateliers_faits    integer default 0,
  drills_faits      integer default 0,
  minutes_totales   integer default 0,
  revisions         integer default 0,
  seances_comptees  integer default 0,
  jours_activite    integer default 0,
  reponses_justes   integer default 0,
  reponses_fausses  integer default 0,
  notes_nombre      integer default 0,
  app_version       text,
  maj               timestamptz default now(),
  charge_utile      jsonb          -- الملخّص الكامل (للتحليل العميق)
);

-- فهارس للاستعلامات
create index if not exists eleves_maj_idx on public.eleves (maj desc);
create index if not exists eleves_xp_idx  on public.eleves (xp desc);
create index if not exists eleves_wilaya_idx on public.eleves (wilaya);

-- ───────────── أمان الصفوف (RLS) ─────────────
-- التطبيق (المفتاح anon العام) يستطيع الكتابة فقط، ولا يرى أي تلميذ آخر.
-- المالك وحده (service_role عبر Studio) يقرأ كل شيء.

alter table public.eleves enable row level security;

drop policy if exists "ecriture_app" on public.eleves;
create policy "ecriture_app" on public.eleves
  for insert to anon with check (true);

drop policy if exists "maj_app" on public.eleves;
create policy "maj_app" on public.eleves
  for update to anon using (true) with check (true);

-- ملاحظة: لا توجد سياسة SELECT لـ anon → القراءة مرفوضة تلقائيًّا.

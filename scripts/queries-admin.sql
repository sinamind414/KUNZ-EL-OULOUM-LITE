-- ──────────────────────────────────────────────────────────────────────────────
-- استعلامات المطوّر — كنز العلوم Lite
-- يُنسخ كل استعلام في Supabase Studio (SQL Editor) ويُعدَّل حسب الحاجة.
-- الجداول: public.eleves (انظر supabase/schema.sql)
-- ──────────────────────────────────────────────────────────────────────────────

-- 1) كل التلاميذ — آخر تحديث أولًا
select email, nom, wilaya, daira, niveau, xp,
       lecons_terminees, drills_faits, reponses_justes, reponses_fausses,
       minutes_totales, jours_activite, maj
from public.eleves
order by maj desc;

-- 2) الأكثر تقدّمًا (نقاط الخبرة)
select email, nom, niveau, xp, lecons_terminees, drills_faits
from public.eleves
order by xp desc
limit 20;

-- 3) التوزيع حسب الولاية
select wilaya,
       count(*)                       as تلاميذ,
       round(avg(xp))                 as "متوسط XP",
       round(avg(lecons_terminees), 1) as "متوسط الدروس",
       count(*) filter (where maj > now() - interval '7 days') as "نشطون هذا الأسبوع"
from public.eleves
group by wilaya
order by تلاميذ desc;

-- 4) النشاطون فقط (تحديث خلال 7 أيام)
select email, nom, niveau, xp, lecons_terminees, drills_faits, maj
from public.eleves
where maj > now() - interval '7 days'
order by maj desc;

-- 5) الدروس الهشّة عند التلامي — ما يحتاج مراجعة (من الملخّص الكامل)
select email, nom, jsonb_array_length(charge_utile->'lecons_fragiles') as "دروس هشّة",
       jsonb_array_length(charge_utile->'lecons_en_cours') as "دروس جارية"
from public.eleves
where jsonb_array_length(charge_utile->'lecons_fragiles') > 0
order by "دروس هشّة" desc;

-- 6) أكثر الدروس الهشّة تكرارًا عبر كل التلامي
select lecon, count(*) as "عدد التلاميذ"
from public.eleves,
     jsonb_array_elements_text(charge_utile->'lecons_fragiles') as lecon
group by lecon
order by "عدد التلاميذ" desc
limit 20;

-- 7) أكثر الدروس إكمالًا
select lecon, count(*) as "عدد التلاميذ"
from public.eleves,
     jsonb_array_elements_text(charge_utile->'lecons_terminees') as lecon
group by lecon
order by "عدد التلاميذ" desc
limit 20;

-- 8) نسبة الإجابات الصحيحة لكل تلميذ (حساب يدوي — التطبيق نفسه لا يعرض نسبًا)
select email, nom,
       reponses_justes as "صحيحة",
       reponses_fausses as "خاطئة",
       reponses_justes + reponses_fausses as "المجموع",
       case
         when reponses_justes + reponses_fausses > 0
         then round(100.0 * reponses_justes / (reponses_justes + reponses_fausses), 1)
         else null
       end as "% صحيحة"
from public.eleves
where reponses_justes + reponses_fausses > 0
order by "% صحيحة" desc;

-- 9) بحث عن تلميذ بالبريد
select * from public.eleves where email ilike '%الكلمة%';

-- 10) ملخّص سريع للمشروع كاملًا
select count(*)                                   as "إجمالي التلاميذ",
       count(*) filter (where maj > now() - interval '1 days')  as "نشطون اليوم",
       count(*) filter (where maj > now() - interval '7 days')  as "نشطون الأسبوع",
       round(avg(xp))                             as "متوسط XP",
       round(avg(lecons_terminees), 1)            as "متوسط الدروس",
       round(avg(drills_faits), 1)                as "متوسط التدريبات",
       sum(reponses_justes)                       as "إجمالي الصحيحة",
       sum(reponses_fausses)                      as "إجمالي الخاطئة"
from public.eleves;

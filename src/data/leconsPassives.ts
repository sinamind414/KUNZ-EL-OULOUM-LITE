// الدروس النصّية التفاعلية (25 ملف HTML → 46 درسًا)
// كل درس يربط بملفه المصدر + الفصل المطلوب + سؤال الدرس (الإشكالية).
// تُعرض داخل قارئ الدروس ثم تُربط بالطريقة الستة (ProtocoleRunner).

export interface LeconPassive {
  lessonId: string;
  fichier: string;
  chapitre?: string;
  question: string;
}

export const LECONS_PASSIVES: Record<string, LeconPassive> = {
  phase1_chapitres_1_2: { lessonId: 'phase1_chapitres_1_2', fichier: 'phase1_chapitres_1_2.html', chapitre: 'ch1', question: '⚠️ التساؤل الجوهري لبداية الوحدة' },
  lecon_transcription: { lessonId: 'lecon_transcription', fichier: 'lecon_transcription.html', chapitre: 'ch3', question: '⚠️ التناقض الظاهري (مفتاح فهم الدرس)' },
  phase1_chapitres_1_2_2: { lessonId: 'phase1_chapitres_1_2_2', fichier: 'phase1_chapitres_1_2.html', chapitre: 'ch2', question: '⚠️ كيف نترجم 4 أحرف إلى 20 كلمة؟' },
  phase2_chapitres_3_4: { lessonId: 'phase2_chapitres_3_4', fichier: 'phase2_chapitres_3_4.html', chapitre: 'ch3', question: '⚠️ كيف يتحول الـ ARNm إلى سلسلة بيبتيدية في أجزاء من الثانية؟' },
  lecon_representation: { lessonId: 'lecon_representation', fichier: 'lecon_representation.html', chapitre: undefined, question: '⚠️ ثلاث صور مختلفة لجزيء واحد، فأيها البنية الحقيقية؟' },
  phase2_chapitres_3_4_2: { lessonId: 'phase2_chapitres_3_4_2', fichier: 'phase2_chapitres_3_4.html', chapitre: 'ch4', question: '⚠️ لماذا يفقد البروتين وظيفته إذا تغيرت شكله؟' },
  phase3_chapitres_5_6: { lessonId: 'phase3_chapitres_5_6', fichier: 'phase3_chapitres_5_6.html', chapitre: 'ch5', question: '⚠️ كيف يؤدي تغير حمض أميني واحد إلى مرض قاتل؟' },
  phase3_chapitres_5_6_2: { lessonId: 'phase3_chapitres_5_6_2', fichier: 'phase3_chapitres_5_6.html', chapitre: 'ch6', question: '⚠️ كيف تنجز الإنزيمات تفاعلات معقدة في درجة حرارة الجسم (37°C)؟' },
  lecon_activite_structure: { lessonId: 'lecon_activite_structure', fichier: 'lecon_activite_structure.html', chapitre: undefined, question: '⚠️ نفس النشا يُهضم في الفم ولا يُهضم في المعدة، فلماذا؟' },
  phase4_chapitres_7_8: { lessonId: 'phase4_chapitres_7_8', fichier: 'phase4_chapitres_7_8.html', chapitre: 'ch7', question: '⚠️ لماذا يعمل إنزيم الببسين في المعدة (pH = 2) ويتوقف في الأمعاء؟' },
  phase4_chapitres_7_8_2: { lessonId: 'phase4_chapitres_7_8_2', fichier: 'phase4_chapitres_7_8.html', chapitre: 'ch8', question: '⚠️ لماذا نحفظ اللحوم واللقاحات في الثلاجة (0°C إلى 4°C) ولا نغليها؟' },
  phase5_chapitres_9_10: { lessonId: 'phase5_chapitres_9_10', fichier: 'phase5_chapitres_9_10.html', chapitre: 'ch9', question: '⚠️ لماذا يرفض الجسم زرع الأعضاء من شخص آخر؟' },
  phase5_chapitres_9_10_2: { lessonId: 'phase5_chapitres_9_10_2', fichier: 'phase5_chapitres_9_10.html', chapitre: 'ch10', question: '⚠️ لماذا تكون الزمرة O معطياً عاماً بينما الزمرة AB مستقبلاً عاماً؟' },
  phase6_chapitres_11_12: { lessonId: 'phase6_chapitres_11_12', fichier: 'phase6_chapitres_11_12.html', chapitre: 'ch11', question: '⚠️ كيف يحمي المصل المناعي حيواناً من سم الكزاز القاتل؟' },
  phase6_chapitres_11_12_2: { lessonId: 'phase6_chapitres_11_12_2', fichier: 'phase6_chapitres_11_12.html', chapitre: 'ch12', question: '⚠️ هل يقوم الجسم المضاد بقتل المستضد بنفسه؟' },
  phase7_chapitres_13_14: { lessonId: 'phase7_chapitres_13_14', fichier: 'phase7_chapitres_13_14.html', chapitre: 'ch13', question: '⚠️ كيف يقضي الجسم على الفيروسات المختبئة داخل الخلايا المصابة؟' },
  phase7_chapitres_13_14_2: { lessonId: 'phase7_chapitres_13_14_2', fichier: 'phase7_chapitres_13_14.html', chapitre: 'ch14', question: '⚠️ لماذا يدمر فيروس الإيدز (VIH) المناعة بالكامل رغم أنه يهاجم خلايا LT4 فقط؟' },
  phase8_chapitres_15_16: { lessonId: 'phase8_chapitres_15_16', fichier: 'phase8_chapitres_15_16.html', chapitre: 'ch15', question: '⚠️ لماذا يكون داخل الليف العصبي سالباً وخارجه موجباً أثناء الراحة؟' },
  phase8_chapitres_15_16_2: { lessonId: 'phase8_chapitres_15_16_2', fichier: 'phase8_chapitres_15_16.html', chapitre: 'ch16', question: '⚠️ كيف تتولد وتنتقل السيالة العصبية على طول الليف العصبي في أجزاء من الملي ثانية؟' },
  phase9_chapitres_17_18: { lessonId: 'phase9_chapitres_17_18', fichier: 'phase9_chapitres_17_18.html', chapitre: 'ch17', question: '⚠️ كيف تعبر السيالة العصبية الفراغ الفاصل بين خليتين عصبيتين؟' },
  phase9_chapitres_17_18_2: { lessonId: 'phase9_chapitres_17_18_2', fichier: 'phase9_chapitres_17_18.html', chapitre: 'ch18', question: '⚠️ كيف تتخذ الخلية العصبية الحركية قرار الانقباض أو الاسترخاء عندما تتلقى آلاف السيالات المتضادة؟' },
  phase10_chapitres_19_20: { lessonId: 'phase10_chapitres_19_20', fichier: 'phase10_chapitres_19_20.html', chapitre: 'ch19', question: '⚠️ كيف يوقف المورفين آلام الحروق والعمليات الجراحية الشديدة؟' },
  phase10_chapitres_19_20_2: { lessonId: 'phase10_chapitres_19_20_2', fichier: 'phase10_chapitres_19_20.html', chapitre: 'ch20', question: '⚠️ كيف تحول النباتات الخضراء أشعة الشمس إلى سكر النشا؟' },
  phase11_chapitres_21_22_2: { lessonId: 'phase11_chapitres_21_22_2', fichier: 'phase11_chapitres_21_22.html', chapitre: 'ch21', question: '⚠️ من أين يأتي الأكسجين الذي نتنفسه؟ من غاز CO₂ أم من الماء H₂O؟' },
  phase12_chapitres_23_24: { lessonId: 'phase12_chapitres_23_24', fichier: 'phase12_chapitres_23_24.html', chapitre: 'ch23', question: '⚠️ كيف يبني النبات جذوعه وأوراقه وثماره انطلاقا من غاز في الهواء؟' },
  phase12_chapitres_23_24_2: { lessonId: 'phase12_chapitres_23_24_2', fichier: 'phase12_chapitres_23_24.html', chapitre: 'ch24', question: '⚠️ لماذا تتوقف المرحلة الكيميوحيوية في الظلام بعد ثوانٍ رغم أنها لا تتطلب ضوءاً؟' },
  phase13_chapitres_25_26: { lessonId: 'phase13_chapitres_25_26', fichier: 'phase13_chapitres_25_26.html', chapitre: 'ch25', question: '⚠️ كيف تستخرج الخلية الطاقة الأولية من الغلوكوز حتى في غياب الأكسجين؟' },
  phase13_chapitres_25_26_2: { lessonId: 'phase13_chapitres_25_26_2', fichier: 'phase13_chapitres_25_26.html', chapitre: 'ch26', question: '⚠️ كيف يحرر الميتوكندرون الطاقة الهائلة المخزنة في حمض البيروفيك؟' },
  phase14_chapitres_27_28: { lessonId: 'phase14_chapitres_27_28', fichier: 'phase14_chapitres_27_28.html', chapitre: 'ch27', question: '⚠️ لماذا نموت خلال دقائق معدودة إذا انقطع عنا الأكسجين؟' },
  phase14_chapitres_27_28_2: { lessonId: 'phase14_chapitres_27_28_2', fichier: 'phase14_chapitres_27_28.html', chapitre: 'ch28', question: '⚠️ كيف تعيش خلايا الخميرة أو عضلاتنا المجهدة دون أكسجين؟' },
  phase15_chapitres_29_30: { lessonId: 'phase15_chapitres_29_30', fichier: 'phase15_chapitres_29_30.html', chapitre: 'ch29', question: '⚠️ لماذا تتشابه آليات إنتاج الـ ATP في الصانعة والميتوكندرون رغم اختلاف وظائفهما؟' },
  phase15_chapitres_29_30_2: { lessonId: 'phase15_chapitres_29_30_2', fichier: 'phase15_chapitres_29_30.html', chapitre: 'ch30', question: '⚠️ كيف يستمر توازن الحياة على كوكب الأرض منذ ملايين السنين دون نفاذ الأكسجين أو الكربون؟' },
  phase16_chapitres_31_32: { lessonId: 'phase16_chapitres_31_32', fichier: 'phase16_chapitres_31_32.html', chapitre: 'ch31', question: '⚠️ لماذا تتمركز 90% من زلازل وبراكين العالم في أحزمة جغرافية ضيقة جداً؟' },
  phase16_chapitres_31_32_2: { lessonId: 'phase16_chapitres_31_32_2', fichier: 'phase16_chapitres_31_32.html', chapitre: 'ch32', question: '⚠️ كيف نثبت أن قاع المحيط الأطلسي يتسع وأن قارة إفريقيا تبتعد عن أمريكا؟' },
  phase17_chapitres_33_34: { lessonId: 'phase17_chapitres_33_34', fichier: 'phase17_chapitres_33_34.html', chapitre: 'ch33', question: '⚠️ لماذا لا يزداد حجم الأرض رغم الاتساع المستمر لقاع المحيطات عند الظهرات؟' },
  phase17_chapitres_33_34_2: { lessonId: 'phase17_chapitres_33_34_2', fichier: 'phase17_chapitres_33_34.html', chapitre: 'ch34', question: '⚠️ كيف ينصهر صخر البيريدوتيت في منطقة الغوص عند حرارة منخفضة (800°C)؟' },
  phase18_chapitres_35_36: { lessonId: 'phase18_chapitres_35_36', fichier: 'phase18_chapitres_35_36.html', chapitre: 'ch35', question: '⚠️ من أين تأتي الحرارة الهائلة التي تذيب الصخور وتدفع البراكين؟' },
  phase18_chapitres_35_36_2: { lessonId: 'phase18_chapitres_35_36_2', fichier: 'phase18_chapitres_35_36.html', chapitre: 'ch36', question: '⚠️ كيف تتحول الحرارة الصامتة في باطن الأرض إلى محرك جبار يحرك القارات؟' },
  phase19_chapitres_37_38: { lessonId: 'phase19_chapitres_37_38', fichier: 'phase19_chapitres_37_38.html', chapitre: 'ch37', question: '⚠️ كيف عرفنا أن باطن الأرض مكون من طبقات وأن نواتها الخارجية سائلة دون حفر الأرض؟' },
  phase19_chapitres_37_38_2: { lessonId: 'phase19_chapitres_37_38_2', fichier: 'phase19_chapitres_37_38.html', chapitre: 'ch38', question: '⚠️ لماذا يختلف التركيب المعدني لصخور القارات عن صخور قاع المحيطات وأعماق البرنس؟' },
  phase20_chapitres_39_40: { lessonId: 'phase20_chapitres_39_40', fichier: 'phase20_chapitres_39_40.html', chapitre: 'ch39', question: '⚠️ لماذا يبقى حديد النواة الداخلية (البذرة) صلباً رغم أن حرارته تفوق 5000°C؟' },
  phase20_chapitres_39_40_2: { lessonId: 'phase20_chapitres_39_40_2', fichier: 'phase20_chapitres_39_40.html', chapitre: 'ch40', question: '⚠️ لماذا تنثني بعض الصخور كالمطاط بينما تنكسر صخور أخرى كالزجاج؟' },
  phase21_chapitres_41_42: { lessonId: 'phase21_chapitres_41_42', fichier: 'phase21_chapitres_41_42.html', chapitre: 'ch41', question: '⚠️ كيف ينصهر البيريدوتيت الجاف تحت الظهرة المحيطية رغم غياب الماء؟' },
  phase21_chapitres_41_42_2: { lessonId: 'phase21_chapitres_41_42_2', fichier: 'phase21_chapitres_41_42.html', chapitre: 'ch42', question: '⚠️ كيف تكونت قمة إيفرست (8848 متر) وسلسلة الأطلس التلي؟' },
  phase22_chapitres_43_44: { lessonId: 'phase22_chapitres_43_44', fichier: 'phase22_chapitres_43_44.html', chapitre: 'ch43', question: '⚠️ هل الصخور مواد جامدة لا تتغير أبداً بمرور الزمن؟' },
  phase22_chapitres_43_44_2: { lessonId: 'phase22_chapitres_43_44_2', fichier: 'phase22_chapitres_43_44.html', chapitre: 'ch44', question: '⚠️ كيف تختزن صحراء الجزائر الجافة أكبر احتياطيات البترول والغاز والمياه العذبة في العالم؟' },
};

// رابط الدرس (مع تفعيل الفصل الصحيح عبر #hash)
export function urlLecon(lessonId: string): string {
  const l = LECONS_PASSIVES[lessonId];
  if (!l) return '';
  // BASE_URL évite les 404 lorsque l'application est servie sous un sous-chemin.
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}lecons/${l.fichier}${l.chapitre ? '#' + l.chapitre : ''}`;
}

// هل لهذا الدرس محتوى نصّي تفاعلي؟
export function aContenuLecon(lessonId: string): boolean {
  return Boolean(LECONS_PASSIVES[lessonId]);
}

// سؤال الدرس (الإشكالية المحفّزة)
export function questionLecon(lessonId: string): string {
  return LECONS_PASSIVES[lessonId]?.question ?? '';
}

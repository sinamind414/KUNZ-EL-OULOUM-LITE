// عامل الخدمة — كنز العلوم Lite
// PWA يدوية: precache الواجهة، network-first للتنقل، cache-first للأصول.
// يعمل دون اتصال بعد أول تحميل (سياق الشبكة الجزائري المحدود).

const CACHE = 'murajih-svt-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/logo.png',
  '/personnage-pirate.png',
  '/ouverture.mp4',
  '/lecons/lecon_activite_structure.html',
  '/lecons/lecon_representation.html',
  '/lecons/lecon_transcription.html',
  '/lecons/phase1_chapitres_1_2.html',
  '/lecons/phase2_chapitres_3_4.html',
  '/lecons/phase3_chapitres_5_6.html',
  '/lecons/phase4_chapitres_7_8.html',
  '/lecons/phase5_chapitres_9_10.html',
  '/lecons/phase6_chapitres_11_12.html',
  '/lecons/phase7_chapitres_13_14.html',
  '/lecons/phase8_chapitres_15_16.html',
  '/lecons/phase9_chapitres_17_18.html',
  '/lecons/phase10_chapitres_19_20.html',
  '/lecons/phase11_chapitres_21_22.html',
  '/lecons/phase12_chapitres_23_24.html',
  '/lecons/phase13_chapitres_25_26.html',
  '/lecons/phase14_chapitres_27_28.html',
  '/lecons/phase15_chapitres_29_30.html',
  '/lecons/phase16_chapitres_31_32.html',
  '/lecons/phase17_chapitres_33_34.html',
  '/lecons/phase18_chapitres_35_36.html',
  '/lecons/phase19_chapitres_37_38.html',
  '/lecons/phase20_chapitres_39_40.html',
  '/lecons/phase21_chapitres_41_42.html',
  '/lecons/phase22_chapitres_43_44.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // التنقل: الشبكة أولاً، ثم النسخة المخبأة (offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // الأصول: المخبأ أولاً، ثم الشبكة مع تخزين النتيجة
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
          .catch(() => caches.match('/index.html'))
    )
  );
});

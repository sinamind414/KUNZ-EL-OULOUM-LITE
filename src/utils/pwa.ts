// تسجيل عامل الخدمة (PWA يدوية)

export function enregistrerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // في التطوير لا يسجّل ( Hot Module Replacement)

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((erreur) => console.warn('تعذّر تسجيل عامل الخدمة:', erreur));
  });
}

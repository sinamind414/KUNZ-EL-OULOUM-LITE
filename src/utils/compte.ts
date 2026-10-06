// الحساب المحلي — بريد إلكتروني وكلمة مرور وولاية ودائرة، داخل المتصفح فقط.
// لا خادم، لا إرسال، لا تتبّع: كل شيء في localStorage تحت مفتاح التطبيق نفسه.

const CLE_SESSION = 'kunz_session_v1';

export const MIN_MDP = 6;

export function courrielValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim().toLowerCase());
}

export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** تجزئة SHA-256 مع ملح — تُستبدل بالتجزئة المحلية إذا كان التشفير معطّلًا. */
export async function hacher(texte: string): Promise<string> {
  const sale = `kunz::${texte}`;
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
      const octets = await subtle.digest('SHA-256', new TextEncoder().encode(sale));
      return [...new Uint8Array(octets)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    /* بيئة بلا WebCrypto → نكمل بالتجزئة المحلية */
  }
  return hacherLocalement(sale);
}

function hacherLocalement(s: string): string {
  let a = 0x811c9dc5;
  let b = 0x1b873593;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 0x01000193) >>> 0;
    b = Math.imul(b ^ c, 0x85ebca6b) >>> 0;
    b = ((b << 13) | (b >>> 19)) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

export async function verifierMdp(motDePasse: string, hashAttendu: string): Promise<boolean> {
  return (await hacher(motDePasse)) === hashAttendu;
}

/** فتح جلسة بعد نجاح الدخول (تبقى مفتوحة ما دام التبويب مفتوحًا). */
export function ouvrirSession(email: string): void {
  try {
    sessionStorage.setItem(CLE_SESSION, email);
  } catch {
    /* تجاهل */
  }
}

export function sessionOuverte(email?: string): boolean {
  if (!email) return false;
  try {
    return sessionStorage.getItem(CLE_SESSION) === email;
  } catch {
    return false;
  }
}

export function fermerSession(): void {
  try {
    sessionStorage.removeItem(CLE_SESSION);
  } catch {
    /* تجاهل */
  }
}

/** رسائل الخطأ بلطف — لا عصبية، لا رفض حاد. */
export function messageCompte(
  champ: 'email' | 'mdp' | 'mdp2' | 'wilaya' | 'daira',
  details?: { mdp?: boolean }
): string {
  switch (champ) {
    case 'email':
      return 'اكتب بريدًا إلكترونيًا صحيحًا، مثل: eleve@gmail.com';
    case 'mdp':
      return details?.mdp
        ? 'كلمة المرور خاطئة — أعِد المحاولة.'
        : 'كلمة المرور لا تقلّ عن 6 أحرف.';
    case 'mdp2':
      return 'كلمتا المرور غير متطابقتين.';
    case 'wilaya':
      return 'اختر ولايتك من القائمة.';
    case 'daira':
      return 'اختر دائرتك من القائمة.';
  }
}

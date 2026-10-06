// مزج البطاقات (Fisher–Yates) — يُستدعى بعد كل خطأ لتفادي الحفظ بالموقع.

export function melange<T>(items: readonly T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

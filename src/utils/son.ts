// أصوات الإجابة — نغمتان مختلفتان تمامًا: صحيحة vs خاطئة.
// تُولَّدتان من Web Audio API (لا ملف MP3، لا وزن إضافي، تعمل دون إنترنت).
// نبرة لطيفة بلا رعب: «دنغ» صاعد للصحيحة، «بون» أخفض هادئ للخاطئة — لا لوم، لا رعب.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null; // متصفح بلا صوت — نكمل بصمت
  }
}

function note(
  c: AudioContext,
  freq: number,
  debut: number,
  duree: number,
  gain: number,
): void {
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + debut;
  o.type = 'triangle';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + duree + 0.05);
}

/** إجابة صحيحة — نغمة صاعدة صغيرة (أمل) */
export function sonJuste(): void {
  const c = audio();
  if (!c) return;
  note(c, 660, 0, 0.18, 0.07);
  note(c, 990, 0.1, 0.22, 0.06);
}

/** إجابة خاطئة — نغمة هابطة أخفض، هادئة (تُقال: خطأ، ثم نكمل) */
export function sonFaux(): void {
  const c = audio();
  if (!c) return;
  note(c, 349.23, 0, 0.14, 0.06);
  note(c, 261.63, 0.09, 0.2, 0.05);
}

/**
 * تصفيق حميم عند إنهاء مرحلة — يُصغَّر من ضجيج أبيض متقطّع عبر مرشّح نطاقي
 * (لا ملف صوتي، يعمل دون إنترنت) مع لحن صغير فائز في البداية.
 * نبرة دافئة تشجّع لا صراخ — ولا نسبة ولا عدّ تنازلي.
 */
export function sonApplaudissement(): void {
  const c = audio();
  if (!c) return;
  const duree = 2.1;
  const t0 = c.currentTime;

  // لحن فائز صغير (تراتيل صاعدة) يسبق التصفيق
  note(c, 523.25, 0, 0.16, 0.05);
  note(c, 659.25, 0.12, 0.16, 0.05);
  note(c, 783.99, 0.24, 0.3, 0.055);

  // مخزن ضجيج أبيض للصفير الواحد
  const taille = Math.floor(c.sampleRate * 0.12);
  const buf = c.createBuffer(1, taille, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < taille; i++) data[i] = Math.random() * 2 - 1;

  const bus = c.createGain();
  bus.gain.value = 0.5;
  const filtre = c.createBiquadFilter();
  filtre.type = 'bandpass';
  filtre.frequency.value = 1900;
  filtre.Q.value = 0.7;
  bus.connect(filtre);
  filtre.connect(c.destination);

  // ~80 battements de mains : attaques rapides, intensité en cloche (début doux → milieu → fin douce)
  let t = 0.35; // التصفيق يبدأ بعد اللحن
  while (t < duree) {
    const pos = t / duree;
    const cloche = Math.sin(Math.PI * pos); // énergie en cloche
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    const haut = 0.05 + Math.random() * 0.07;
    g.gain.setValueAtTime(0.0001, t0 + t);
    g.gain.linearRampToValueAtTime(haut * cloche, t0 + t + 0.004);
    g.gain.linearRampToValueAtTime(0.0001, t0 + t + 0.05 + Math.random() * 0.04);
    src.connect(g);
    g.connect(bus);
    src.start(t0 + t, Math.random() * 0.08);
    src.stop(t0 + t + 0.12);
    t += 0.02 + Math.random() * 0.05;
  }
}

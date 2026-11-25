// Ember & Thyme — tiny synthesized sounds (WebAudio, no audio files).
// Every effect is a short oscillator blip so the game ships zero media.

let context = null;

function ensureContext() {
  if (context) return context;
  try {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  } catch {
    return null;
  }
  return context;
}

function blip(freq, seconds, type = 'sine', volume = 0.12, slideTo = null) {
  const ctx = ensureContext();
  if (!ctx || ctx.state === 'suspended') return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + seconds);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  } catch {
    // Sound is garnish: never let it break the game.
  }
}

export function createAudio() {
  return {
    unlock() {
      const ctx = ensureContext();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    chop() { blip(220, 0.08, 'square', 0.08); },
    pickup() { blip(520, 0.07, 'sine', 0.1); },
    place() { blip(340, 0.08, 'triangle', 0.1); },
    sizzle() { blip(900, 0.25, 'sawtooth', 0.05, 500); },
    flash() { blip(300, 0.18, 'sawtooth', 0.12, 1200); },
    ding() { blip(880, 0.3, 'sine', 0.14); blip(1320, 0.35, 'sine', 0.08); },
    coin() { blip(990, 0.1, 'sine', 0.12); setTimeout(() => blip(1480, 0.18, 'sine', 0.12), 90); },
    wrong() { blip(180, 0.25, 'square', 0.09, 120); },
    order() { blip(660, 0.12, 'triangle', 0.1); setTimeout(() => blip(660, 0.12, 'triangle', 0.1), 150); },
    rush() { blip(440, 0.2, 'square', 0.1, 660); },
  };
}

// Tiny 8-bit synthesiser on top of the browser's Web Audio. No sound files.
// Voices, like the chips in 80s arcade machines:
//   'square' (50% pulse), 'pulse25', 'pulse12' (thinner, NES-like),
//   'triangle' (soft bass), 'noise' (explosions, drums, rotor).
//
// A sound effect is a list of voices:
//   { t: start (s), wave, f0: start Hz, f1: end Hz (slide), dur (s), vol 0..1,
//     attack (s), filter: Hz (noise colour) }
//
// Browsers (iPhone especially) only allow sound after a tap: call unlock()
// from a tap/click handler. iPhone silent switch also mutes it.

export function createSynth({ volume = 0.3 } = {}) {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  const waves = {};

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      const len = ctx.sampleRate; // 1 s of white noise, looped
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function pulseWave(duty) {
    if (waves[duty]) return waves[duty];
    const n = 64;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    waves[duty] = ctx.createPeriodicWave(real, imag);
    return waves[duty];
  }

  // Play one voice at absolute audio time `at`, into `dest` (default master).
  function voice(v, at, dest) {
    const c = ctx;
    const t0 = at + (v.t || 0);
    const dur = v.dur ?? 0.1;
    const vol = v.vol ?? 0.5;
    const attack = v.attack ?? 0.003;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    if (v.hold) g.gain.setValueAtTime(vol, t0 + dur * v.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(dest || master);

    let src;
    if (v.wave === 'noise') {
      src = c.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const f = c.createBiquadFilter();
      f.type = v.highpass ? 'highpass' : 'lowpass';
      f.frequency.setValueAtTime(v.filter ?? 4000, t0);
      if (v.filter1) f.frequency.exponentialRampToValueAtTime(v.filter1, t0 + dur);
      src.connect(f);
      f.connect(g);
    } else {
      src = c.createOscillator();
      if (v.wave === 'pulse25') src.setPeriodicWave(pulseWave(0.25));
      else if (v.wave === 'pulse12') src.setPeriodicWave(pulseWave(0.125));
      else src.type = v.wave || 'square';
      src.frequency.setValueAtTime(v.f0, t0);
      if (v.f1 && v.f1 !== v.f0) src.frequency.exponentialRampToValueAtTime(v.f1, t0 + dur);
      if (v.steps) {
        // arcade-style stepped pitch (arpeggio): [[timeOffset, Hz], ...]
        for (const [dt, hz] of v.steps) src.frequency.setValueAtTime(hz, t0 + dt);
      }
      src.connect(g);
    }
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  return {
    unlock: () => ensure(),
    get ctx() {
      return ensure();
    },
    get master() {
      ensure();
      return master;
    },
    voice,
    // Play a sound effect (list of voices) now.
    play(sfx) {
      if (!ensure()) return;
      const at = ctx.currentTime + 0.005;
      for (const v of sfx) voice(v, at);
    },
    // Pause / resume all sound (e.g. when the app goes to the background).
    suspend() {
      if (ctx && ctx.state === 'running') ctx.suspend();
    },
    resume() {
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    get started() {
      return !!ctx;
    },
    setVolume(v) {
      if (ensure()) master.gain.value = v;
    },
  };
}

// Note name -> frequency. 'A4' = 440 Hz, 'C#5', 'Bb3'.
export function noteHz(name) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Bad note ${name}`);
  const base = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const semis = base + acc + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, semis / 12);
}

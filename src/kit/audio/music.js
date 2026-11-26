import { noteHz } from './synth.js';

// Chiptune music player. A song:
// {
//   bpm, bars,                       // one loop = `bars` bars of 4/4
//   tracks: [
//     { wave, vol, notes: [['E5', 2], ['r', 1], ...] },  // lengths in 1/16 notes
//     { drums: 'k...s...k.k.s...', vol }  // per bar, 16 steps: k kick, s snare, h hat
//   ]
// }
// The song loops until stop() is called.

const DRUMS = {
  k: { wave: 'triangle', f0: 150, f1: 40, dur: 0.14, vol: 0.9 },
  s: { wave: 'noise', filter: 3000, dur: 0.12, vol: 0.45 },
  h: { wave: 'noise', filter: 9000, highpass: true, dur: 0.04, vol: 0.18 },
};

function events(song) {
  const sixteenth = 60 / song.bpm / 4;
  const out = [];
  for (const tr of song.tracks) {
    if (tr.drums) {
      for (let bar = 0; bar < song.bars; bar++) {
        const pat = Array.isArray(tr.drums) ? tr.drums[bar % tr.drums.length] : tr.drums;
        [...pat].forEach((ch, i) => {
          const d = DRUMS[ch];
          if (d) out.push({ t: (bar * 16 + i) * sixteenth, v: { ...d, vol: d.vol * (tr.vol ?? 1) } });
        });
      }
      continue;
    }
    let step = 0;
    for (const [note, len] of tr.notes) {
      if (note !== 'r') {
        out.push({
          t: step * sixteenth,
          v: {
            wave: tr.wave,
            f0: noteHz(note),
            dur: Math.max(0.05, len * sixteenth * (tr.gate ?? 0.9)),
            vol: tr.vol ?? 0.3,
            attack: 0.004,
            hold: 0.6,
          },
        });
      }
      step += len;
    }
  }
  return { list: out.sort((a, b) => a.t - b.t), length: song.bars * 16 * sixteenth };
}

export function createMusicPlayer(synth) {
  let timer = null;
  let gain = null;

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (gain) {
      const g = gain;
      g.gain.setTargetAtTime(0, synth.ctx.currentTime, 0.03);
      setTimeout(() => g.disconnect(), 300);
    }
    gain = null;
  }

  function play(song, volume = 1) {
    stop();
    const ctx = synth.ctx;
    if (!ctx) return;
    gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(synth.master);
    const { list, length } = events(song);
    const start = ctx.currentTime + 0.08;
    let i = 0;
    let loop = 0;
    const tick = () => {
      const horizon = ctx.currentTime + 0.15;
      while (list.length) {
        const ev = list[i];
        const at = start + loop * length + ev.t;
        if (at > horizon) break;
        synth.voice(ev.v, at, gain);
        i++;
        if (i >= list.length) {
          i = 0;
          loop++;
        }
      }
    };
    tick();
    timer = setInterval(tick, 30);
  }

  return { play, stop, get playing() { return !!timer; } };
}

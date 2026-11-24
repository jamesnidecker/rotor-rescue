import { copyText } from './clipboard.js';

// Hidden tuning panel: open the game with ?tune=1. `tune` comes from createTuning().
// Changes apply instantly while playing and are saved on this device.
// opts.onRestart (optional): adds a "Restart game" button.
export function mountTunePanel(tune, opts = {}) {
  const { spec: TUNING_SPEC, values: tuning } = tune;
  const toggle = document.createElement('button');
  toggle.id = 'tune-toggle';
  toggle.className = 'dev-btn';
  toggle.textContent = 'Tune';
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.id = 'tune-panel';
  panel.hidden = true;
  document.body.appendChild(panel);

  const outputs = {};
  const inputs = {};
  const fmt = (s, v) => `${Number(v.toFixed(2))} ${s.unit}`;

  for (const s of TUNING_SPEC) {
    const row = document.createElement('div');
    row.className = 'row';
    const id = `tune-${s.key}`;
    row.innerHTML = `<label for="${id}">${s.label}</label>`;
    const input = document.createElement('input');
    Object.assign(input, { type: 'range', id, min: s.min, max: s.max, step: s.step, value: tuning[s.key] });
    const out = document.createElement('output');
    out.textContent = fmt(s, tuning[s.key]);
    input.addEventListener('input', () => {
      tuning[s.key] = Number(input.value);
      out.textContent = fmt(s, tuning[s.key]);
      tune.save();
    });
    row.append(input, out);
    panel.appendChild(row);
    inputs[s.key] = input;
    outputs[s.key] = out;
  }

  const actions = document.createElement('div');
  actions.className = 'dev-actions';
  const mk = (label, fn) => {
    const b = document.createElement('button');
    b.className = 'dev-btn';
    b.textContent = label;
    b.addEventListener('click', fn);
    actions.appendChild(b);
    return b;
  };
  const note = document.createElement('span');
  note.className = 'dev-note';
  mk('Copy values', async () => {
    note.textContent = (await copyText(tune.asText())) ? 'Copied!' : 'Copy failed';
  });
  mk('Reset to defaults', () => {
    tune.reset();
    for (const s of TUNING_SPEC) {
      inputs[s.key].value = tuning[s.key];
      outputs[s.key].textContent = fmt(s, tuning[s.key]);
    }
    note.textContent = 'Defaults restored';
  });
  if (opts.onRestart) mk('Restart game', () => opts.onRestart());
  mk('Close', () => setOpen(false));
  actions.appendChild(note);
  panel.prepend(actions);

  // While the panel is open, the game shrinks into the space above it, so the
  // panel never covers anything the player needs to tap.
  const fit = () => {
    const h = panel.hidden ? 0 : panel.offsetHeight;
    document.documentElement.style.setProperty('--dev-panel-h', `${h}px`);
    window.dispatchEvent(new Event('resize')); // let Phaser re-fit the canvas
  };
  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.hidden = open;
    document.body.classList.toggle('dev-panel-open', open);
    fit();
  };
  window.addEventListener('orientationchange', () => setTimeout(fit, 300));
  toggle.addEventListener('click', () => setOpen(true));
}

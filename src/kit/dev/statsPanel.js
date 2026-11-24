import { copyText } from './clipboard.js';

// Hidden playtest stats screen: open the game with ?stats=1
// Data lives only on this device and is never sent anywhere.
//
// opts: {
//   stats,                       // from createStats()
//   title,                       // e.g. 'Rotor Rescue'
//   outcomes: { crash: 'Crashed', finish: 'Reached helipad', quit: 'Quit (restart)' },
//   levelLength(levelId),        // for "where" percentages
//   drawLevelStrip(canvas, levelId, crashes)  // draws the level with a dot per crash
// }
export function mountStatsPanel(opts) {
  const panel = document.createElement('div');
  panel.id = 'stats-panel';
  document.body.appendChild(panel);
  render(panel, opts);
  return panel;
}

function byLevel(attempts) {
  const m = new Map();
  for (const a of attempts) {
    if (!m.has(a.level)) m.set(a.level, []);
    m.get(a.level).push(a);
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
}

function asText(attempts, opts) {
  const lines = [`${opts.title.toUpperCase()} PLAYTEST STATS`, `Attempts recorded: ${attempts.length}`];
  for (const [lvl, list] of byLevel(attempts)) {
    const counts = Object.entries(opts.outcomes)
      .map(([k, label]) => `${label}: ${list.filter((a) => a.outcome === k).length}`)
      .join(', ');
    const avg = list.reduce((s, a) => s + (a.rescued ?? 0), 0) / list.length;
    lines.push(
      '',
      `Level ${lvl}: ${list.length} attempts. ${counts}`,
      `Average rescued per attempt: ${avg.toFixed(1)}`,
      `Crash positions (x): ${list.filter((a) => a.outcome === 'crash').map((a) => a.x).join(', ') || '-'}`
    );
  }
  lines.push('', '#, level, outcome, rescued, x, y, time');
  attempts.forEach((a, i) =>
    lines.push(`${i + 1}, ${a.level}, ${a.outcome}, ${a.rescued}/${a.people}, ${a.x}, ${a.y}, ${new Date(a.at).toISOString()}`)
  );
  return lines.join('\n');
}

function el(tag, props = {}, text) {
  const e = document.createElement(tag);
  Object.assign(e, props);
  if (text != null) e.textContent = text;
  return e;
}

function render(panel, opts) {
  const { stats } = opts;
  const attempts = stats.all();
  panel.innerHTML = '';
  panel.append(
    el('h1', {}, `${opts.title} — playtest stats`),
    el('p', { className: 'dev-note' }, 'Stored only on this device. Never sent anywhere.')
  );

  const actions = el('div', { className: 'dev-actions' });
  const status = el('span', { className: 'dev-note' });
  const mk = (label, fn) => {
    const b = el('button', { className: 'dev-btn' }, label);
    b.addEventListener('click', fn);
    actions.appendChild(b);
  };
  mk('Copy stats', async () => {
    status.textContent = (await copyText(asText(stats.all(), opts))) ? 'Copied!' : 'Copy failed';
  });
  mk('Reset stats', () => {
    if (window.confirm('Delete all playtest stats on this device?')) {
      stats.reset();
      render(panel, opts);
    }
  });
  mk('Play the game', () => panel.remove());
  actions.appendChild(status);
  panel.appendChild(actions);

  if (!attempts.length) {
    panel.appendChild(el('p', {}, 'No attempts recorded yet. Play a few rounds, then open this page again.'));
    return;
  }

  for (const [lvl, list] of byLevel(attempts)) {
    panel.appendChild(el('h2', {}, `Level ${lvl}`));
    const t = el('table');
    const avg = list.reduce((s, a) => s + (a.rescued ?? 0), 0) / list.length;
    const rows = [['Attempts', list.length]];
    for (const [k, label] of Object.entries(opts.outcomes)) rows.push([label, list.filter((a) => a.outcome === k).length]);
    rows.push(['Avg. rescued', `${avg.toFixed(1)} / ${list[0].people ?? '?'}`]);
    for (const [k, v] of rows) {
      const tr = el('tr');
      tr.append(el('th', {}, k), el('td', {}, String(v)));
      t.appendChild(tr);
    }
    panel.appendChild(t);

    panel.appendChild(el('h2', {}, 'Where crashes happen (red dots)'));
    const canvas = el('canvas');
    opts.drawLevelStrip(
      canvas,
      lvl,
      list.filter((a) => a.outcome === 'crash')
    );
    panel.appendChild(canvas);

    panel.appendChild(el('h2', {}, 'People rescued per attempt (newest first)'));
    const t2 = el('table');
    const head = el('tr');
    ['#', 'Result', 'Rescued', 'Where'].forEach((h) => head.appendChild(el('th', {}, h)));
    t2.appendChild(head);
    const len = opts.levelLength(lvl) || 1;
    list
      .map((a, i) => ({ a, i }))
      .reverse()
      .slice(0, 100)
      .forEach(({ a, i }) => {
        const tr = el('tr');
        [i + 1, opts.outcomes[a.outcome] ?? a.outcome, `${a.rescued}/${a.people}`, `${Math.round((100 * a.x) / len)}%`].forEach(
          (v) => tr.appendChild(el('td', {}, String(v)))
        );
        t2.appendChild(tr);
      });
    panel.appendChild(t2);
  }
}

import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

// Build label shown in the ?tune=1 panel, so testers can see which version they run.
function buildLabel() {
  let sha = 'dev';
  try {
    sha = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    /* not a git checkout */
  }
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${sha} · ${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} UTC`;
}

// base './' = every path is relative. Works on GitHub Pages
// (https://<user>.github.io/rotor-rescue/) and later inside Capacitor.
export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(buildLabel()) },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0, // keep the font as a real file next to the game
    chunkSizeWarningLimit: 2000,
  },
});

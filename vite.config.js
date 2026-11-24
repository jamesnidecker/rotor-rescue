import { defineConfig } from 'vite';

// base './' = every path is relative. Works on GitHub Pages
// (https://<user>.github.io/rotor-rescue/) and later inside Capacitor.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0, // keep the font as a real file next to the game
    chunkSizeWarningLimit: 2000,
  },
});

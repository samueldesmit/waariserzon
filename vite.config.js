import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// SEO landing pages — each is a real HTML file with its own meta/title and
// static prose, but loads the same React app. Vite multi-page input.
const LANDING_PAGES = [
  'zon-amsterdam',
  'zon-rotterdam',
  'zon-utrecht',
  'zon-den-haag',
  'zon-eindhoven',
  'zon-vandaag',
  'zon-weekend',
];

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          LANDING_PAGES.map((p) => [p, resolve(__dirname, `${p}.html`)]),
        ),
      },
    },
  },
});

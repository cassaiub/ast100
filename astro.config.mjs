// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://cassa.bd',
  base: '/courses/ast100',
  trailingSlash: 'never',
  // One port per CASSA repo so four dev servers coexist on this box:
  // inside 2025 · cassa 2026 · ast100 2027 · kriterion 2028.
  server: { port: 2027 },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [react()],
});

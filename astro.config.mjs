// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://cassa.site',
  base: '/courses/ast100',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [react()],
});

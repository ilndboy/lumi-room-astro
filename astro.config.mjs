// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Static build — output goes to dist/
  // Cloudflare Pages: build command = npm run build, output dir = dist
  site: 'https://lumi.stonemanor.us',

  adapter: cloudflare(),
});
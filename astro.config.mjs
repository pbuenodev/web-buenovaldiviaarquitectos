// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // La dirección pública llega por entorno; hace falta para las tarjetas al compartir.
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  build: { format: 'directory' },
});

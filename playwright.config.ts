import { defineConfig } from '@playwright/test';

const PUERTO = 4329;

// Prueba de humo sobre el sitio ya construido (`pnpm build`), en teléfono y escritorio.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    browserName: 'chromium',
  },
  projects: [
    { name: 'telefono', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'escritorio', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    // `--ignore-lock`: servidor de un solo uso, siempre en primer plano y sin chocar con un `pnpm preview` abierto.
    command: `pnpm preview --port ${PUERTO} --ignore-lock`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
  },
});

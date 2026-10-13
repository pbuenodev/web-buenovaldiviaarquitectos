import { expect, test, type Page } from '@playwright/test';

// Prueba de humo del sitio construido. Se ejecuta en teléfono (390 px) y escritorio (1440 px).
// Los nombres y cantidades corresponden a las obras cargadas en `src/content/obras/`.

const OBRAS = 6;
const CASAS = 2;
const EDIFICIOS = 4;
const PRIMERA_OBRA = { slug: 'casas-chicureo', nombre: 'Casas Chicureo' };
const ULTIMA_OBRA = { slug: 'edificio-los-leones', nombre: 'Edificio Los Leones' };

const contador = (page: Page) => page.locator('[data-contador]');
const tarjetasVisibles = (page: Page) => page.locator('.grilla li:visible');

async function sinDesbordeHorizontal(page: Page) {
  const { ancho, visible } = await page.evaluate(() => ({
    ancho: document.documentElement.scrollWidth,
    visible: document.documentElement.clientWidth,
  }));
  expect(ancho, 'la página no debe desplazarse en horizontal').toBeLessThanOrEqual(visible);
}

test.describe('inicio', () => {
  test('muestra la primera lámina, el contador y la grilla completa', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Bueno Valdivia Arquitectos');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(contador(page)).toHaveText('01 / 06');
    await expect(page.locator('[data-texto]:visible .nombre')).toHaveText('Casa La Quebrada');
    await expect(page.locator('[data-texto]:visible .ubicacion')).toContainText('Viña del Mar, Valparaíso');
    await expect(tarjetasVisibles(page)).toHaveCount(OBRAS);
    await expect(page.locator('.grilla li').first()).toContainText(PRIMERA_OBRA.nombre);
    await sinDesbordeHorizontal(page);
  });

  test('los botones del carrusel cambian de lámina y dan la vuelta', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(contador(page)).toHaveText('02 / 06');
    await expect(page.locator('[data-texto]:visible .nombre')).toHaveText('Edificio Los Leones');
    await expect(page.locator('[data-anuncio]')).toHaveText('Edificio Los Leones, 2 de 6');

    await page.getByRole('button', { name: 'Anterior' }).click();
    await page.getByRole('button', { name: 'Anterior' }).click();
    await expect(contador(page)).toHaveText('06 / 06');
    await expect(page.locator('[data-lamina][data-activa]')).toHaveCount(1);
  });

  test('el carrusel se maneja con el teclado', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Siguiente' }).focus();
    await page.keyboard.press('Enter');
    await expect(contador(page)).toHaveText('02 / 06');
  });

  test('el carrusel avanza solo cada 6 segundos y la interacción reinicia la cuenta', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.clock.runFor(5900);
    await expect(contador(page)).toHaveText('01 / 06');
    await page.clock.runFor(200);
    await expect(contador(page)).toHaveText('02 / 06');

    await page.clock.runFor(4000);
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(contador(page)).toHaveText('03 / 06');
    await page.clock.runFor(5900);
    await expect(contador(page)).toHaveText('03 / 06');
    await page.clock.runFor(200);
    await expect(contador(page)).toHaveText('04 / 06');
  });

  test('con movimiento reducido el carrusel no avanza solo', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await page.clock.runFor(13000);
    await expect(contador(page)).toHaveText('01 / 06');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(contador(page)).toHaveText('02 / 06');
  });

  test('deslizar sobre el carrusel cambia de lámina', async ({ page, hasTouch }) => {
    test.skip(!hasTouch, 'solo en pantallas táctiles');
    await page.goto('/');
    const deslizar = (desde: number, hasta: number) =>
      page.locator('[data-carrusel]').evaluate(
        (el, [x0, x1]) => {
          const toque = (x: number) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 });
          el.dispatchEvent(new TouchEvent('touchstart', { touches: [toque(x0!)], bubbles: true }));
          el.dispatchEvent(new TouchEvent('touchend', { changedTouches: [toque(x1!)], bubbles: true }));
        },
        [desde, hasta],
      );

    await deslizar(300, 280);
    await expect(contador(page), 'un gesto de menos de 40 px no cambia la lámina').toHaveText('01 / 06');
    await deslizar(300, 200);
    await expect(contador(page)).toHaveText('02 / 06');
    await deslizar(100, 200);
    await expect(contador(page)).toHaveText('01 / 06');
  });

  test('solo la primera foto del carrusel se pide con prioridad; las demás esperan su turno', async ({ page }) => {
    await page.goto('/');
    const primera = page.locator('[data-lamina] img').first();
    await expect(primera).toHaveAttribute('loading', 'eager');
    await expect(primera).toHaveAttribute('fetchpriority', 'high');
    // Al abrir se activan la primera y la siguiente; las otras cuatro siguen aplazadas.
    await expect(page.locator('[data-lamina] img[data-src]')).toHaveCount(OBRAS - 2);
    await expect(page.locator('.grilla img').first()).toHaveAttribute('loading', 'lazy');
  });

  test('los filtros muestran las obras de cada categoría', async ({ page }) => {
    await page.goto('/');
    const filtro = (nombre: string) => page.getByRole('button', { name: nombre, exact: true });
    await expect(filtro('Todas')).toHaveAttribute('aria-pressed', 'true');

    await page.locator('[data-filtros]').scrollIntoViewIfNeeded();
    const desplazamiento = await page.evaluate(() => window.scrollY);

    await filtro('Casas').click();
    await expect(tarjetasVisibles(page)).toHaveCount(CASAS);
    await expect(filtro('Casas')).toHaveAttribute('aria-pressed', 'true');
    await expect(filtro('Todas')).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => window.scrollY)).toBe(desplazamiento);
    expect(new URL(page.url()).pathname).toBe('/');

    await filtro('Edificios públicos').click();
    await expect(tarjetasVisibles(page)).toHaveCount(EDIFICIOS);

    await filtro('Todas').click();
    await expect(tarjetasVisibles(page)).toHaveCount(OBRAS);
  });

  test('sin scripts se ven la primera lámina y todas las obras', async ({ browser, baseURL }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await contexto.newPage();
    await page.goto('/');
    await expect(page.locator('[data-lamina][data-activa] img')).toHaveAttribute('src', /\.webp$/);
    await expect(page.locator('[data-texto]:visible')).toHaveAttribute('href', '/obras/casa-la-quebrada/');
    await expect(tarjetasVisibles(page)).toHaveCount(OBRAS);
    await expect(page.locator('.controles')).toHaveCSS('visibility', 'hidden');
    await expect(page.locator('[data-filtros]')).toHaveCSS('visibility', 'hidden');
    await contexto.close();
  });
});

test.describe('ficha de obra', () => {
  test('se llega desde la grilla y muestra título, ubicación y las diez fotos', async ({ page }) => {
    await page.goto('/');
    await page.locator('.grilla a').first().click();
    await expect(page).toHaveURL(`/obras/${PRIMERA_OBRA.slug}/`);
    await expect(page).toHaveTitle(`${PRIMERA_OBRA.nombre} · Bueno Valdivia Arquitectos`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PRIMERA_OBRA.nombre);
    await expect(page.locator('.ubicacion')).toHaveText('Colina, Región Metropolitana');

    const fotos = page.locator('.fotos img');
    await expect(fotos).toHaveCount(10);
    const archivos = await fotos.evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')!.split('/').pop()!));
    expect(archivos.slice(0, 5).every((a) => a.startsWith('exterior-'))).toBe(true);
    expect(archivos.slice(5).every((a) => a.startsWith('interior-'))).toBe(true);
    for (const foto of await fotos.all()) {
      await expect(foto).toHaveAttribute('alt', PRIMERA_OBRA.nombre);
      await expect(foto).toHaveAttribute('width', /\d+/);
      await expect(foto).toHaveAttribute('height', /\d+/);
    }
    await sinDesbordeHorizontal(page);
  });

  test('las fotos se cargan de forma diferida y en AVIF al llegar a ellas', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    // Cuánto se adelanta cada navegador es cosa suya; aquí se comprueba que todas quedan diferidas.
    for (const foto of await page.locator('.fotos img').all()) {
      await expect(foto).toHaveAttribute('loading', 'lazy');
    }
    const ultima = page.locator('.fotos img').last();
    await ultima.scrollIntoViewIfNeeded();
    await expect.poll(() => ultima.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    expect(await ultima.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/\.avif$/);
  });

  test('"Siguiente obra" recorre el catálogo y vuelve al inicio desde la última', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    await page.locator('.siguiente').click();
    await expect(page).toHaveURL('/obras/casa-la-quebrada/');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto(`/obras/${ULTIMA_OBRA.slug}/`);
    await expect(page.locator('.siguiente')).toContainText(PRIMERA_OBRA.nombre);
    await page.locator('.siguiente').click();
    await expect(page).toHaveURL(`/obras/${PRIMERA_OBRA.slug}/`);
  });

  test('"← Obras" vuelve al inicio', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    await page.getByRole('link', { name: '← Obras' }).click();
    await expect(page).toHaveURL('/');
  });

  test('el botón de WhatsApp nombra la obra', async ({ page }) => {
    await page.goto(`/obras/${ULTIMA_OBRA.slug}/`);
    const boton = page.getByRole('link', { name: 'Consultar por WhatsApp' });
    await expect(boton).toHaveAttribute('target', '_blank');
    const enlace = new URL((await boton.getAttribute('href'))!);
    expect(enlace.origin + enlace.pathname).toBe('https://wa.me/56900000000');
    expect(enlace.searchParams.get('text')).toBe(
      'Hola, vi el proyecto Edificio Los Leones en su portafolio y me gustaría conversar.',
    );
  });
});

test.describe('contacto', () => {
  for (const ruta of ['/', `/obras/${PRIMERA_OBRA.slug}/`]) {
    test(`el pie de ${ruta} tiene WhatsApp, número y redes`, async ({ page }) => {
      await page.goto(ruta);
      const pie = page.locator('#contacto');
      await expect(pie).toContainText('Bueno Valdivia');
      await expect(pie).toContainText('+56 9 0000 0000');
      await expect(pie).toContainText('Chile · Más de 30 años');
      await expect(page.locator('form')).toHaveCount(0);

      const boton = pie.getByRole('link', { name: 'Escribir por WhatsApp' });
      await expect(boton).toHaveAttribute('target', '_blank');
      const enlace = new URL((await boton.getAttribute('href'))!);
      expect(enlace.origin + enlace.pathname).toBe('https://wa.me/56900000000');
      expect(enlace.searchParams.get('text')).toBe('Hola, vi su portafolio y me gustaría conversar sobre un proyecto.');

      for (const red of ['Instagram', 'Facebook']) {
        await expect(pie.getByRole('link', { name: red })).toHaveAttribute('target', '_blank');
        await expect(pie.getByRole('link', { name: red })).toHaveAttribute('rel', 'noopener');
      }
    });

    test(`"Contacto" en la cabecera de ${ruta} baja al pie sin cambiar de página`, async ({ page }) => {
      await page.goto(ruta);
      await page.locator('.cabecera').getByRole('link', { name: 'Contacto' }).click();
      await expect(page).toHaveURL(`${ruta}#contacto`);
      await expect(page.locator('#contacto .nombre')).toBeInViewport();
    });
  }
});

test.describe('estructura del sitio', () => {
  test('el logo lleva al inicio y se anuncia con el nombre de la oficina', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    await page.getByRole('link', { name: 'Bueno Valdivia Arquitectos' }).click();
    await expect(page).toHaveURL('/');
  });

  for (const ruta of ['/no-existe/', '/obras/no-existe/']) {
    test(`${ruta} muestra la página de no encontrado`, async ({ page }) => {
      const respuesta = await page.goto(ruta);
      expect(respuesta!.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('No encontrada');
      await expect(page.locator('.cabecera')).toBeVisible();
      await expect(page.locator('#contacto')).toBeAttached();
      await page.getByRole('link', { name: '← Ver las obras' }).click();
      await expect(page).toHaveURL('/');
    });
  }

  test('ninguna página pide recursos a terceros', async ({ page, baseURL }) => {
    const ajenas: string[] = [];
    page.on('request', (pedido) => {
      const url = new URL(pedido.url());
      if (url.protocol.startsWith('http') && url.origin !== new URL(baseURL!).origin) ajenas.push(pedido.url());
    });
    for (const ruta of ['/', `/obras/${PRIMERA_OBRA.slug}/`, '/no-existe/']) {
      await page.goto(ruta);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState('networkidle');
    }
    expect(ajenas).toEqual([]);
  });

  test('la tipografía es Archivo y los títulos van condensados', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('500 40px "Archivo Variable"'))).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-stretch', '72%');
  });

  test('por defecto pide a los buscadores que no indexen', async ({ page, request }) => {
    for (const ruta of ['/', `/obras/${PRIMERA_OBRA.slug}/`]) {
      await page.goto(ruta);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toContain('Disallow: /');
  });

  test('la tarjeta al compartir una obra usa su nombre y un JPEG de 1200 × 630', async ({ page, request }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    const meta = (propiedad: string) => page.locator(`meta[property="og:${propiedad}"]`).getAttribute('content');
    expect(await meta('title')).toBe(PRIMERA_OBRA.nombre);
    expect(await meta('site_name')).toBe('Bueno Valdivia Arquitectos');

    const imagen = (await meta('image'))!;
    expect(imagen).toMatch(/^https?:\/\/.+\.jpg$/);
    const ruta = new URL(imagen).pathname;
    const respuesta = await request.get(ruta);
    expect(respuesta.headers()['content-type']).toContain('image/jpeg');
    const medidas = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    }, ruta);
    expect(medidas).toEqual([1200, 630]);
  });

  test('los enlaces de navegación miden al menos 44 px de alto', async ({ page }) => {
    const alto = async (selector: string) => (await page.locator(selector).first().boundingBox())!.height;
    await page.goto('/');
    for (const selector of ['.cabecera .contacto', '[data-filtro]', '[data-siguiente]', '#contacto .redes a']) {
      expect(await alto(selector), selector).toBeGreaterThanOrEqual(44);
    }
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    for (const selector of ['.volver', '.siguiente', '.consulta a']) {
      expect(await alto(selector), selector).toBeGreaterThanOrEqual(44);
    }
  });

  test('a 320 px de ancho nada desborda', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const ruta of ['/', `/obras/${PRIMERA_OBRA.slug}/`, '/no-existe/']) {
      await page.goto(ruta);
      await sinDesbordeHorizontal(page);
    }
  });
});

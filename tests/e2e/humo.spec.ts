import { expect, test, type Page } from '@playwright/test';

// Prueba de humo del sitio construido. Se ejecuta en teléfono (390 px) y escritorio (1440 px).
// Los nombres y cantidades corresponden a las obras cargadas en `src/content/obras/`.

const OBRAS = 10; // obras en la grilla (los lotes de Bosque Golf van dentro del condominio)
const LAMINAS = 3; // obras que participan en el hero
const CASAS = 4;
const EDIFICIOS = 2;
const COMERCIAL = 3;
const COLEGIOS = 1;
const PRIMERA_OBRA = { slug: 'bosque-golf-el-condominio', nombre: 'Bosque Golf, El Condominio', fotos: 10 };
const SEGUNDA_OBRA = { slug: 'edificio-central-trafico-alameda', nombre: 'Edificio Central Tráfico Alameda' };
const ULTIMA_OBRA = { slug: 'colegio-charles-school', nombre: 'Colegio Charles School' };
// Lotes del álbum del condominio, en su orden.
const LOTES = [1, 2, 4, 5].map((n) => ({ slug: `bosque-golf-lote-${n}`, nombre: `Bosque Golf, Lote ${n}` }));
// Primera foto de la portada (orden 1), elegida por el cliente.
const LAMINA_1 = PRIMERA_OBRA.nombre;
const INTEGRANTES = ['Pablo A. Bueno Orellana', 'Teresa Y. Valdivia Ponce', 'Bruno A. Bueno Valdivia'];
const NOMBRE_OFICINA = 'Bueno Valdivia Arquitectos';

const laminaActiva = (page: Page) => page.locator('[data-lamina][data-activa] img');
const lamina = (page: Page, i: number) => page.locator('[data-lamina]').nth(i);
/** Escala actual de la foto de una lámina (1 = tamaño normal). */
const escalaLamina = (page: Page, i: number) =>
  lamina(page, i).locator('img').evaluate((img) => new DOMMatrix(getComputedStyle(img).transform).a);
const menu = (page: Page) => page.locator('#menu');
const abrirMenu = (page: Page) => page.getByRole('button', { name: 'Menú' }).click();
const tarjetasVisibles = (page: Page) => page.locator('.grilla li:visible');

async function sinDesbordeHorizontal(page: Page) {
  const { ancho, visible } = await page.evaluate(() => ({
    ancho: document.documentElement.scrollWidth,
    visible: document.documentElement.clientWidth,
  }));
  expect(ancho, 'la página no debe desplazarse en horizontal').toBeLessThanOrEqual(visible);
}

test.describe('inicio', () => {
  test('muestra la portada con el nombre de la oficina y la grilla completa', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(NOMBRE_OFICINA);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bueno Valdivia\s*Arquitectos/i);
    await expect(laminaActiva(page)).toHaveAttribute('alt', LAMINA_1);
    await expect(page.locator('[data-portada]')).toBeInViewport();
    const portada = (await page.locator('[data-portada]').boundingBox())!;
    expect(portada.height).toBeGreaterThanOrEqual((page.viewportSize()!.height * 0.95));
    await expect(tarjetasVisibles(page)).toHaveCount(OBRAS);
    await expect(page.locator('.grilla li').first()).toContainText(PRIMERA_OBRA.nombre);
    await sinDesbordeHorizontal(page);
  });

  test('el nombre va en dos tamaños y bajo él, más pequeños, los integrantes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: NOMBRE_OFICINA, exact: true })).toBeVisible();
    const integrantes = page.locator('[data-portada] .integrantes li');
    await expect(integrantes).toHaveText(INTEGRANTES.map((n) => new RegExp(n.replace('.', '\\.'), 'i')));
    await expect(page.getByRole('heading', { level: 1 })).not.toContainText(/Pablo|Teresa|Bruno/i);

    const tamano = (selector: string) => page.locator(selector).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    const [nombre, sub, integrante] = [await tamano('[data-portada] h1'), await tamano('[data-portada] h1 .sub'), await tamano('[data-portada] .integrantes')];
    expect(nombre).toBeLessThanOrEqual(88);
    expect(sub).toBeLessThan(nombre);
    expect(integrante).toBeLessThan(sub);

    const caja = (selector: string) => page.locator(selector).boundingBox().then((c) => c!);
    const [titulo, lista] = [await caja('[data-portada] h1'), await caja('[data-portada] .integrantes')];
    expect(lista.y, 'los integrantes van bajo el nombre').toBeGreaterThanOrEqual(titulo.y + titulo.height);
    await sinDesbordeHorizontal(page);
  });

  test('la grilla muestra el condominio y ninguno de sus lotes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.grilla')).toContainText(PRIMERA_OBRA.nombre);
    for (const lote of LOTES) {
      await expect(page.locator(`.grilla a[href="/obras/${lote.slug}/"]`)).toHaveCount(0);
    }
  });

  test('la portada no tiene botones, contador ni enlace a una obra', async ({ page }) => {
    await page.goto('/');
    const portada = page.locator('[data-portada]');
    await expect(portada.getByRole('button')).toHaveCount(0);
    await expect(portada.getByText(/\d\d \/ \d\d/)).toHaveCount(0);
    await expect(portada.locator('a[href^="/obras/"]')).toHaveCount(0);
  });

  test('la portada avanza sola cada 5 segundos, da la vuelta y el título no cambia', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const titulo = await page.getByRole('heading', { level: 1 }).innerText();
    await page.clock.runFor(4900);
    await expect(laminaActiva(page)).toHaveAttribute('alt', LAMINA_1);
    await page.clock.runFor(200);
    await expect(laminaActiva(page)).not.toHaveAttribute('alt', LAMINA_1);
    await expect(page.locator('[data-lamina][data-activa]')).toHaveCount(1);
    expect(await page.getByRole('heading', { level: 1 }).innerText()).toBe(titulo);

    await page.clock.runFor(5000 * (LAMINAS - 1));
    await expect(laminaActiva(page)).toHaveAttribute('alt', LAMINA_1);
  });

  test('cada foto de la portada se acerca lenta y continuamente, sin mover el nombre', async ({ page }) => {
    await page.goto('/');
    const marca = () =>
      page.evaluate(() =>
        ['h1', '.integrantes'].map((s) => document.querySelector(`[data-portada] ${s}`)!.getBoundingClientRect().toJSON()),
      );
    const inicio = await marca();
    await page.waitForTimeout(2500);
    const aMitad = await escalaLamina(page, 0);
    expect(aMitad, 'ya se acercó').toBeGreaterThan(1.01);
    expect(aMitad, 'sin llegar al máximo').toBeLessThan(1.08);
    await page.waitForTimeout(500);
    expect(await escalaLamina(page, 0), 'sigue acercándose').toBeGreaterThan(aMitad);
    expect(await marca(), 'el nombre y los integrantes no se mueven').toEqual(inicio);
    await sinDesbordeHorizontal(page);
  });

  test('la foto que sale sigue acercándose durante el fundido y la que vuelve empieza de cero', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await expect(lamina(page, 0)).toHaveAttribute('data-acercar', '');
    await page.clock.runFor(5100);
    await expect(lamina(page, 0)).not.toHaveAttribute('data-activa');
    await expect(lamina(page, 0), 'sigue acercándose mientras se desvanece').toHaveAttribute('data-acercar', '');
    await expect(lamina(page, 1)).toHaveAttribute('data-acercar', '');
    await page.clock.runFor(1800);
    await expect(lamina(page, 0), 'ya invisible, vuelve a su tamaño').not.toHaveAttribute('data-acercar');

    await page.clock.runFor(5000 * (LAMINAS - 1) - 1800);
    await expect(laminaActiva(page)).toHaveAttribute('alt', LAMINA_1);
    await expect(lamina(page, 0)).toHaveAttribute('data-acercar', '');
    expect(await escalaLamina(page, 0), 'la que vuelve empieza desde su tamaño normal').toBeLessThan(1.02);
  });

  test('la portada se detiene con la pestaña oculta', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.runFor(12000);
    await expect(laminaActiva(page)).toHaveAttribute('alt', LAMINA_1);
  });

  test('con movimiento reducido la portada no avanza ni hace fundido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await page.clock.runFor(13000);
    await expect(laminaActiva(page)).toHaveAttribute('alt', LAMINA_1);
    await expect(page.locator('[data-lamina]').first()).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('[data-acercar]'), 'sin acercamiento').toHaveCount(0);
    await expect(laminaActiva(page)).toHaveCSS('transform', 'none');
  });

  test('solo la primera foto de la portada se pide con prioridad; las demás esperan su turno', async ({ page }) => {
    await page.goto('/');
    const primera = page.locator('[data-lamina] img').first();
    await expect(primera).toHaveAttribute('loading', 'eager');
    await expect(primera).toHaveAttribute('fetchpriority', 'high');
    // Al abrir se activan la primera y la siguiente; las demás siguen aplazadas.
    await expect(page.locator('[data-lamina] img[data-src]')).toHaveCount(LAMINAS - 2);
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

    await filtro('Edificios').click();
    await expect(tarjetasVisibles(page)).toHaveCount(EDIFICIOS);

    await filtro('Comercial').click();
    await expect(tarjetasVisibles(page)).toHaveCount(COMERCIAL);
    await expect(filtro('Comercial')).toHaveAttribute('aria-pressed', 'true');

    await filtro('Colegios').click();
    await expect(tarjetasVisibles(page)).toHaveCount(COLEGIOS);
    await expect(tarjetasVisibles(page)).toContainText('Colegio Charles School');
    await expect(filtro('Colegios')).toHaveAttribute('aria-pressed', 'true');

    await filtro('Todas').click();
    await expect(tarjetasVisibles(page)).toHaveCount(OBRAS);
  });

  test('sin scripts se ven la primera foto, el menú y todas las obras', async ({ browser, baseURL }) => {
    const contexto = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await contexto.newPage();
    await page.goto('/');
    await expect(laminaActiva(page)).toHaveAttribute('src', /\.webp$/);
    await expect(laminaActiva(page), 'la foto queda fija').toHaveCSS('transform', 'none');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(tarjetasVisibles(page)).toHaveCount(OBRAS);
    await expect(page.locator('[data-filtros]')).toHaveCSS('visibility', 'hidden');
    await abrirMenu(page);
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
    await contexto.close();
  });
});

test.describe('cabecera y menú', () => {
  test('en el inicio el logo y el menú van sobre la foto, sin fondo propio', async ({ page }) => {
    await page.goto('/');
    const cabecera = page.locator('.cabecera');
    await expect(cabecera).toHaveCSS('position', 'absolute');
    const portada = (await page.locator('[data-portada]').boundingBox())!;
    const caja = (await cabecera.boundingBox())!;
    expect(caja.y).toBeGreaterThanOrEqual(portada.y);
    expect(caja.y + caja.height).toBeLessThanOrEqual(portada.y + portada.height);
    const logo = (await page.getByRole('link', { name: NOMBRE_OFICINA }).boundingBox())!;
    const ancho = page.viewportSize()!.width;
    expect(Math.abs(logo.x + logo.width / 2 - ancho / 2), 'el logo va centrado').toBeLessThan(2);
  });

  test('en una ficha y en el 404 la cabecera conserva el fondo azul', async ({ page }) => {
    for (const ruta of [`/obras/${PRIMERA_OBRA.slug}/`, '/no-existe/']) {
      await page.goto(ruta);
      await expect(page.locator('.cabecera')).toHaveCSS('background-color', 'rgb(13, 24, 40)');
      await expect(page.getByRole('button', { name: 'Menú' })).toBeVisible();
    }
  });

  test('"Contacto" del menú baja al pie y cierra el menú', async ({ page }) => {
    await page.goto('/');
    await abrirMenu(page);
    await menu(page).getByRole('link', { name: 'Contacto' }).click();
    await expect(page).toHaveURL('/#contacto');
    await expect(menu(page)).toBeHidden();
    await expect(page.locator('#contacto .nombre')).toBeInViewport();
  });

  test('"Obras" del menú lleva a la grilla, también desde una ficha', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    await abrirMenu(page);
    await menu(page).getByRole('link', { name: 'Obras' }).click();
    await expect(page).toHaveURL('/#obras');
    await expect(page.locator('#obras')).toBeInViewport();
  });

  test('el menú lista las redes, se abre con teclado y se cierra con Escape devolviendo el foco', async ({ page }) => {
    await page.goto('/');
    const boton = page.getByRole('button', { name: 'Menú' });
    await boton.focus();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toBeVisible();
    for (const red of ['Instagram', 'Facebook']) {
      await expect(menu(page).getByRole('link', { name: red })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
    await expect(boton).toBeFocused();
  });
});

test.describe('ficha de obra', () => {
  test('se llega desde la grilla y muestra título, ubicación y todas sus fotos', async ({ page }) => {
    await page.goto('/');
    await page.locator('.grilla a').first().click();
    await expect(page).toHaveURL(`/obras/${PRIMERA_OBRA.slug}/`);
    await expect(page).toHaveTitle(`${PRIMERA_OBRA.nombre} · Bueno Valdivia Arquitectos`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PRIMERA_OBRA.nombre);
    await expect(page.locator('.ubicacion')).not.toBeEmpty();

    const fotos = page.locator('.fotos img');
    await expect(fotos).toHaveCount(PRIMERA_OBRA.fotos);
    const archivos = await fotos.evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')!.split('/').pop()!.split('.')[0]!));
    // El orden de la ficha es el de los nombres: foto-01, foto-02…
    expect(archivos).toEqual(Array.from({ length: PRIMERA_OBRA.fotos }, (_, i) => `foto-${String(i + 1).padStart(2, '0')}`));
    for (const foto of await fotos.all()) {
      await expect(foto).toHaveAttribute('alt', PRIMERA_OBRA.nombre);
      await expect(foto).toHaveAttribute('width', /\d+/);
      await expect(foto).toHaveAttribute('height', /\d+/);
    }
    await sinDesbordeHorizontal(page);
  });

  test('las fotos van en 2 columnas sobre 1080 px y en una sola por debajo', async ({ page, isMobile }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    const fotos = page.locator('.fotos picture');
    const [primera, segunda] = [(await fotos.nth(0).boundingBox())!, (await fotos.nth(1).boundingBox())!];
    if (isMobile) {
      expect(segunda.y, 'en teléfono la segunda va debajo').toBeGreaterThanOrEqual(primera.y + primera.height);
    } else {
      expect(segunda.y, 'en escritorio comparten fila').toBe(primera.y);
      expect(segunda.x, 'la segunda va a la derecha').toBeGreaterThan(primera.x + primera.width);
    }
    await sinDesbordeHorizontal(page);

    await page.setViewportSize({ width: 1080, height: 900 });
    const [a, b] = [(await fotos.nth(0).boundingBox())!, (await fotos.nth(1).boundingBox())!];
    expect(b.y, 'a 1080 px sigue la columna única').toBeGreaterThanOrEqual(a.y + a.height);
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
    await expect(page).toHaveURL(`/obras/${SEGUNDA_OBRA.slug}/`);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto(`/obras/${ULTIMA_OBRA.slug}/`);
    await expect(page.locator('.siguiente')).toContainText(PRIMERA_OBRA.nombre);
    await page.locator('.siguiente').click();
    await expect(page).toHaveURL(`/obras/${PRIMERA_OBRA.slug}/`);
  });

  test('el recorrido de "Siguiente obra" pasa por toda la grilla y por ningún lote', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    const visitadas = [PRIMERA_OBRA.slug];
    for (let i = 0; i < OBRAS; i++) {
      await page.locator('.siguiente').click();
      visitadas.push(new URL(page.url()).pathname.split('/')[2]!);
    }
    expect(visitadas.at(-1), 'vuelve a la primera').toBe(PRIMERA_OBRA.slug);
    expect(new Set(visitadas).size).toBe(OBRAS);
    expect(visitadas.some((slug) => slug.includes('-lote-'))).toBe(false);
  });

  test('la ficha del condominio lista sus lotes en orden y enlaza a cada uno', async ({ page }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    const album = page.getByRole('region', { name: 'Lotes' });
    const tarjetas = album.locator('li');
    await expect(tarjetas).toHaveCount(LOTES.length);
    for (const [i, lote] of LOTES.entries()) {
      await expect(tarjetas.nth(i)).toContainText(lote.nombre);
    }
    // El bloque va entre las fotos y "Siguiente obra".
    const [fotos, bloque, siguiente] = [
      (await page.locator('.fotos').boundingBox())!,
      (await album.boundingBox())!,
      (await page.locator('.siguiente').boundingBox())!,
    ];
    expect(bloque.y).toBeGreaterThanOrEqual(fotos.y + fotos.height);
    expect(siguiente.y).toBeGreaterThanOrEqual(bloque.y + bloque.height);
    await sinDesbordeHorizontal(page);

    await album.getByRole('link', { name: LOTES[2]!.nombre }).click();
    await expect(page).toHaveURL(`/obras/${LOTES[2]!.slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(LOTES[2]!.nombre);
  });

  test('las tarjetas de los lotes van en 2 columnas en teléfono y 3 en escritorio', async ({ page, isMobile }) => {
    await page.goto(`/obras/${PRIMERA_OBRA.slug}/`);
    const tarjetas = page.locator('.album li');
    const ys = await tarjetas.evaluateAll((lis) => lis.map((li) => Math.round(li.getBoundingClientRect().top)));
    expect(ys.filter((y) => y === ys[0]).length).toBe(isMobile ? 2 : 3);
  });

  test('una ficha sin álbum no muestra el bloque de lotes', async ({ page }) => {
    await page.goto('/obras/pub-los-amigos/');
    await expect(page.locator('.album')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Lotes' })).toHaveCount(0);
  });

  test('un lote vuelve a su condominio y "Siguiente obra" recorre solo los lotes', async ({ page }) => {
    await page.goto(`/obras/${LOTES[0]!.slug}/`);
    await expect(page.getByRole('link', { name: '← Obras' })).toHaveCount(0);
    await expect(page.locator('.siguiente')).toContainText(LOTES[1]!.nombre);

    await page.goto(`/obras/${LOTES.at(-1)!.slug}/`);
    await expect(page.locator('.siguiente')).toContainText(LOTES[0]!.nombre);

    await page.getByRole('link', { name: `← ${PRIMERA_OBRA.nombre}` }).click();
    await expect(page).toHaveURL(`/obras/${PRIMERA_OBRA.slug}/`);
  });

  test('el título de la ficha mide como máximo 64 px y cabe en dos líneas', async ({ page }) => {
    await page.goto(`/obras/${SEGUNDA_OBRA.slug}/`);
    const titulo = page.getByRole('heading', { level: 1 });
    const { tamano, alto, linea } = await titulo.evaluate((e) => {
      const estilo = getComputedStyle(e);
      return { tamano: parseFloat(estilo.fontSize), alto: e.getBoundingClientRect().height, linea: parseFloat(estilo.lineHeight) };
    });
    expect(tamano).toBeLessThanOrEqual(64);
    expect(Math.round(alto / linea)).toBeLessThanOrEqual(2);
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
    await expect(boton.locator('svg[aria-hidden="true"]')).toHaveCount(1);
    const enlace = new URL((await boton.getAttribute('href'))!);
    expect(enlace.origin + enlace.pathname).toBe('https://wa.me/56900000000');
    expect(enlace.searchParams.get('text')).toBe(
      `Hola, vi el proyecto ${ULTIMA_OBRA.nombre} en su portafolio y me gustaría conversar.`,
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
      await expect(boton.locator('svg[aria-hidden="true"]')).toHaveCount(1);

      for (const red of ['Instagram', 'Facebook']) {
        const enlaceRed = pie.getByRole('link', { name: red, exact: true });
        await expect(enlaceRed).toHaveAttribute('target', '_blank');
        await expect(enlaceRed).toHaveAttribute('rel', 'noopener');
        await expect(enlaceRed.locator('svg[aria-hidden="true"]')).toBeVisible();
      }
    });

    test(`la marca del pie de ${ruta} se ve más grande`, async ({ page, isMobile }) => {
      await page.goto(ruta);
      const marca = page.locator('#contacto .cierre img');
      const caja = await marca.boundingBox();
      expect(caja!.height).toBe(isMobile ? 40 : 48);
      await sinDesbordeHorizontal(page);
    });

    test(`"Contacto" en la cabecera de ${ruta} baja al pie sin cambiar de página`, async ({ page }) => {
      await page.goto(ruta);
      await abrirMenu(page);
      await menu(page).getByRole('link', { name: 'Contacto' }).click();
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
    for (const selector of ['.boton-menu', '.cabecera .logo', '[data-filtro]', '#contacto .redes a']) {
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

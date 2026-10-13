// Carrusel de portada: el marcado y las transiciones están en Carrusel.astro;
// aquí solo se decide qué lámina se ve y cuándo cambia.

const UMBRAL_DESLIZAR = 40;

/** Activa las fuentes de una lámina cuya foto se dejó aplazada. */
function cargar(lamina: HTMLElement | undefined) {
  lamina?.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((fuente) => {
    fuente.srcset = fuente.dataset.srcset!;
    delete fuente.dataset.srcset;
  });
  const img = lamina?.querySelector<HTMLImageElement>('img[data-src]');
  if (img) {
    img.loading = 'eager';
    img.src = img.dataset.src!;
    delete img.dataset.src;
  }
}

export function iniciarCarrusel(raiz: HTMLElement) {
  const laminas = [...raiz.querySelectorAll<HTMLElement>('[data-lamina]')];
  const textos = [...raiz.querySelectorAll<HTMLElement>('[data-texto]')];
  const contador = raiz.querySelector<HTMLElement>('[data-contador]');
  const anuncio = raiz.querySelector<HTMLElement>('[data-anuncio]');
  const total = laminas.length;
  if (total < 2) return;

  const intervalo = Number(raiz.dataset.segundos ?? 6) * 1000;
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dos = (n: number) => String(n).padStart(2, '0');
  const en = (i: number) => (i + total) % total;

  let actual = 0;
  let temporizador: number | undefined;

  function mostrar(indice: number, manual: boolean) {
    actual = en(indice);
    cargar(laminas[actual]);
    laminas.forEach((lamina, i) => {
      lamina.toggleAttribute('data-activa', i === actual);
      lamina.setAttribute('aria-hidden', String(i !== actual));
    });
    textos.forEach((texto, i) => (texto.hidden = i !== actual));
    if (contador) contador.textContent = `${dos(actual + 1)} / ${dos(total)}`;
    if (manual && anuncio) {
      anuncio.textContent = `${textos[actual]?.querySelector('.nombre')?.textContent ?? ''}, ${actual + 1} de ${total}`;
    }
    // Las vecinas se piden por adelantado para que el fundido no muestre una foto a medio cargar.
    cargar(laminas[en(actual + 1)]);
    if (manual) cargar(laminas[en(actual - 1)]);
  }

  function detener() {
    window.clearInterval(temporizador);
    temporizador = undefined;
  }

  function reanudar() {
    detener();
    if (movimientoReducido.matches || document.hidden) return;
    temporizador = window.setInterval(() => mostrar(actual + 1, false), intervalo);
  }

  function mover(paso: number) {
    mostrar(actual + paso, true);
    reanudar();
  }

  raiz.querySelector('[data-anterior]')?.addEventListener('click', () => mover(-1));
  raiz.querySelector('[data-siguiente]')?.addEventListener('click', () => mover(1));

  let inicioX: number | undefined;
  raiz.addEventListener('touchstart', (e) => (inicioX = e.touches[0]?.clientX), { passive: true });
  raiz.addEventListener(
    'touchend',
    (e) => {
      const finX = e.changedTouches[0]?.clientX;
      if (inicioX === undefined || finX === undefined) return;
      const dx = finX - inicioX;
      inicioX = undefined;
      if (Math.abs(dx) > UMBRAL_DESLIZAR) mover(dx < 0 ? 1 : -1);
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', reanudar);
  movimientoReducido.addEventListener('change', reanudar);

  cargar(laminas[1]);
  reanudar();
}

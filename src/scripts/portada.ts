// Portada del inicio: el marcado y el fundido están en Portada.astro;
// aquí solo se decide qué fotografía se ve y cuándo cambia.

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

export function iniciarPortada(raiz: HTMLElement) {
  const laminas = [...raiz.querySelectorAll<HTMLElement>('[data-lamina]')];
  const total = laminas.length;
  if (total < 2) return;

  const intervalo = Number(raiz.dataset.segundos ?? 5) * 1000;
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const en = (i: number) => (i + total) % total;

  let actual = 0;
  let temporizador: number | undefined;

  function mostrar(indice: number) {
    actual = en(indice);
    cargar(laminas[actual]);
    laminas.forEach((lamina, i) => {
      lamina.toggleAttribute('data-activa', i === actual);
      lamina.setAttribute('aria-hidden', String(i !== actual));
    });
    // La siguiente se pide por adelantado para que el fundido no muestre una foto a medio cargar.
    cargar(laminas[en(actual + 1)]);
  }

  function detener() {
    window.clearInterval(temporizador);
    temporizador = undefined;
  }

  function reanudar() {
    detener();
    if (movimientoReducido.matches || document.hidden) return;
    temporizador = window.setInterval(() => mostrar(actual + 1), intervalo);
  }

  document.addEventListener('visibilitychange', reanudar);
  movimientoReducido.addEventListener('change', reanudar);

  cargar(laminas[1]);
  reanudar();
}

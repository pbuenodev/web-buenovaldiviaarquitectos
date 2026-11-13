// Portada del inicio: el marcado, el fundido y el acercamiento están en Portada.astro;
// aquí se decide qué fotografía se ve, cuándo cambia y cuáles se están acercando.

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

/** Empieza a acercar una lámina desde su tamaño normal. */
function acercar(lamina: HTMLElement) {
  // La animación de Portada.astro arranca desde la escala 1 cada vez que aparece el atributo.
  // Si aún lo tuviera, se quita y se fuerza el cálculo de estilos para que vuelva a empezar.
  if (lamina.hasAttribute('data-acercar')) {
    lamina.removeAttribute('data-acercar');
    void lamina.offsetWidth;
  }
  lamina.setAttribute('data-acercar', '');
}

export function iniciarPortada(raiz: HTMLElement) {
  const laminas = [...raiz.querySelectorAll<HTMLElement>('[data-lamina]')];
  const total = laminas.length;
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fundido = Number(raiz.dataset.fundido ?? 1800);

  if (!movimientoReducido.matches && laminas[0]) acercar(laminas[0]);
  if (total < 2) return;

  const intervalo = Number(raiz.dataset.segundos ?? 5) * 1000;
  const en = (i: number) => (i + total) % total;
  // La lámina que sale sigue acercándose durante su fundido y vuelve a su tamaño cuando ya no se ve.
  const salidas = new Map<HTMLElement, number>();

  let actual = 0;
  let temporizador: number | undefined;

  function mostrar(indice: number) {
    const anterior = laminas[actual]!;
    actual = en(indice);
    const entrante = laminas[actual]!;
    cargar(entrante);
    laminas.forEach((lamina, i) => {
      lamina.toggleAttribute('data-activa', i === actual);
      lamina.setAttribute('aria-hidden', String(i !== actual));
    });

    window.clearTimeout(salidas.get(entrante));
    salidas.delete(entrante);
    if (anterior !== entrante) {
      window.clearTimeout(salidas.get(anterior));
      salidas.set(anterior, window.setTimeout(() => {
        anterior.removeAttribute('data-acercar');
        salidas.delete(anterior);
      }, fundido));
    }
    if (!movimientoReducido.matches) acercar(entrante);
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
  movimientoReducido.addEventListener('change', () => {
    if (movimientoReducido.matches) laminas.forEach((lamina) => lamina.removeAttribute('data-acercar'));
    else acercar(laminas[actual]!);
    reanudar();
  });

  cargar(laminas[1]);
  reanudar();
}

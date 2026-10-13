// Filtros de la grilla de obras: muestran u ocultan tarjetas según su categoría.

export function iniciarFiltros(raiz: HTMLElement) {
  const botones = [...raiz.querySelectorAll<HTMLButtonElement>('[data-filtro]')];
  const tarjetas = [...document.querySelectorAll<HTMLElement>('[data-categoria]')];

  for (const boton of botones) {
    boton.addEventListener('click', () => {
      const filtro = boton.dataset.filtro;
      botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      tarjetas.forEach((tarjeta) => {
        tarjeta.hidden = filtro !== 'todas' && tarjeta.dataset.categoria !== filtro;
      });
    });
  }
}

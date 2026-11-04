# Tasks

## 1. Cabecera con logo centrado y menú

- [x] 1.1 Rehacer `src/components/Cabecera.astro`: grilla de tres zonas (izquierda vacía, `logo-marca-claro.svg` centrado enlazando a `/` con nombre accesible "Bueno Valdivia Arquitectos", botón de menú a la derecha de al menos 44 px). Verificar con `pnpm dev` que en 390 px y 1440 px el logo queda centrado y nada desborda.
- [x] 1.2 Agregar el panel del menú con `popover="auto"` y `popovertarget`, con "Obras" (`/#obras`), "Contacto" (`#contacto`) y las redes de `sitio.redes` que tengan dirección. Verificar sin JavaScript que se abre, se cierra con Escape o clic fuera y devuelve el foco al botón.
- [x] 1.3 Añadir el script mínimo que cierra el panel al elegir un enlace de ancla, y el estado `aria-expanded`/nombre accesible del botón. Verificar que tras pulsar "Contacto" el menú se cierra y la página llega al pie.
- [x] 1.4 Añadir a `src/layouts/Base.astro` la propiedad `cabecera` (`'solida'` por defecto, `'sobre-foto'`) con posición absoluta y sin fondo, más un degradado superior ligero. Verificar que la ficha de obra y `404.astro` conservan la franja azul y que el inicio la muestra superpuesta.
- [x] 1.5 Cubrir la cabecera en `tests/e2e/humo.spec.ts` (abrir menú, ir a Contacto, cerrar con Escape, logo hasta el inicio desde una ficha) y actualizar el recorrido con Tab. Verificar con `pnpm test:e2e`.

## 2. Portada de pantalla completa

- [x] 2.1 Reemplazar `src/components/Carrusel.astro` por `src/components/Portada.astro`: altura `100svh`, láminas apiladas con fundido de 1,8 s, sin escala; `<h1>` visible "Bueno Valdivia / Arquitectos" (`--titulo-xl`, mayúsculas, centrado en el tercio inferior) y flecha ↓ que enlaza a `#obras`. Mantener `prioritaria` en la primera foto y `aplazada` en las demás con `sizes="100vw"`. Verificar que el Network de la primera carga pide solo la primera foto.
- [x] 2.2 Añadir el velo azul marino (capa uniforme más degradado inferior) sobre las láminas y ajustar los valores mirando las fotos reales. Verificar contraste de 3:1 del título y del logo sobre cada foto elegida.
- [x] 2.3 Reemplazar `src/scripts/carrusel.ts` por `src/scripts/portada.ts`: avance cada 5 s, precarga de la siguiente, pausa con `visibilitychange`, sin avance con `prefers-reduced-motion`; eliminar botones, contador, anuncio y swipe. Verificar a mano que tras 5 s cambia la foto y tras la última vuelve a la primera.
- [x] 2.4 Actualizar `src/pages/index.astro` (usar `Portada`, `cabecera="sobre-foto"`, retirar el `<h1>` oculto y dar `id="obras"` a la sección de la grilla). Verificar con scripts desactivados que se ven la primera foto, el título, el menú y la grilla completa.
- [x] 2.5 Reescribir las pruebas e2e de la portada en `tests/e2e/humo.spec.ts`: sin botones ni contador, la foto activa cambia a los 5 s (usar reloj simulado), el texto no cambia, y con movimiento reducido la primera foto queda fija. Verificar con `pnpm test:e2e`.

## 3. Selección de fotos que combinen con el logo

- [x] 3.1 Revisar las fotos candidatas de cada obra y elegir, por obra, la de ambiente azul con luz cálida, horizontal y con la zona inferior despejada; actualizar `carrusel.foto` y `orden` en los `index.yaml` (quitar `carrusel` de una obra sin foto adecuada). Verificar que `pnpm build` pasa y queda al menos una lámina.
- [x] 3.2 Revisar el hero completo en 390 px y 1440 px con el velo final y las fotos elegidas (título, logo y recorte). Verificar capturas de cada lámina sin texto tapado ni ilegible.

## 4. Documentación e integración

- [x] 4.1 Actualizar `README.md` (descripción de la portada, estructura `scripts/`, frases que hablan del "carrusel" visible y cómo elegir la foto del hero). Verificar que ya no describe controles ni contador.
- [x] 4.2 Ejecutar `pnpm verificar` (check, test, build, `verificar:imagenes`, e2e) y confirmar que todo pasa, incluido el límite de 400 KB para AVIF anchas.

## Workflow follow-up

- Abrir el pull request hacia `develop` y archivar el cambio tras la revisión.
- Cuando el cliente entregue los textos en inglés, abrir un cambio aparte para el selector ESP/ENG (usa la zona izquierda ya reservada en la cabecera).

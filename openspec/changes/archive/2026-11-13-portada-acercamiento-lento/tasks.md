# Tasks

## 1. Acercamiento de la portada

- [x] 1.1 En `Portada.astro`, agregar `data-fundido="1800"`, la animación `@keyframes acercar` (`scale(1)` → `scale(1.08)`) aplicada como `.lamina[data-acercar] img { animation: acercar 7s linear forwards; will-change: transform }` (`transform-origin` al centro), y anularla dentro de `prefers-reduced-motion: reduce`. Verificar con `pnpm build` que el CSS generado contiene las reglas.
- [x] 1.2 En `src/scripts/portada.ts`, al mostrar una lámina, poner `data-acercar` en la que entra (reiniciando la animación si aún lo tuviera), y quitárselo a la que sale pasados `data-fundido` ms; no ponerlo con movimiento reducido y quitarlo de todas si la preferencia se activa. Aplicarlo también a la primera foto al iniciar, incluso con una sola lámina. Verificar con `pnpm check` y viendo en `pnpm dev` que la foto se acerca, que la que sale no retrocede durante el fundido y que el nombre no se mueve.
- [x] 1.3 Agregar pruebas a `tests/e2e/humo.spec.ts`: a los ~2,5 s, la escala de la foto activa es mayor que 1 y menor que 1,08; tras el cambio, la que sale sigue con `data-acercar` durante el fundido y lo pierde después; la caja del `h1` y de los integrantes no cambia; con movimiento reducido y sin scripts, la escala es 1 (`transform: none`); y no hay desborde horizontal. Verificar con `pnpm test:e2e`.

## 2. Integración

- [x] 2.1 Ejecutar `pnpm verificar` y confirmar que todo pasa.
- [x] 2.2 Grabar o revisar en `pnpm dev`, a 390 px y 1440 px, un ciclo completo de las tres láminas. Verificar a ojo que el acercamiento es continuo, sin saltos ni retrocesos, y que se percibe sutil; dejar la grabación lista para mostrársela al cliente.

## Workflow follow-up

- Mostrar el efecto al cliente antes de archivar; si pide más o menos intensidad, ajustar la escala con `/opsx:update`.
- Archivar el cambio con `/opsx:archive` una vez publicado.

# Tasks

## 1. Preparación

- [x] 1.1 Respaldar la entrega con `cp -a ~/Descargas/webPabloBueno-fotografiasCierre ~/Descargas/respaldo-cierre-2026-11-26` y verificar que el respaldo tenga 281 `.webp`.

## 2. Importador: nuevo formato de entrega

- [x] 2.1 En `scripts/importar-obras.mjs`: `origen` pasa a ser la ruta de la carpeta, `orden` es obligatorio y entero, el patrón de foto es `^(\d{2,3})\.webp$` y la primera foto es la `portada`. Se quitan `FAVORITA`, `carrusel` y la validación `NN-<slug>`. Por defecto, `--entrega` apunta a `~/Descargas/webPabloBueno-fotografiasCierre`. Las reescaladas se buscan en `reescaladas/<origen>/<archivo>`. Reescribir las pruebas de `tests/unit/importar-obras.test.ts` (renumeración con huecos, portada = primera, origen con subcarpeta, orden faltante, patrón inválido, reescalada) y verificar con `pnpm test`.
- [x] 2.2 Agregar la detección de repetidas: dHash de 64 bits sobre todas las fotos de obra de la entrega, umbral ≤ 6 y campo `repetidas` en el manifiesto (se conserva la de mayor área en la posición menor). Si hay un par no declarado o entre obras distintas, falla listando ambas rutas. Agregar pruebas: misma foto en dos tamaños declarada, repetida no declarada, repetida entre obras y dos fotos distintas sin falso positivo. Verificar con `pnpm test`.
- [x] 2.3 Agregar la importación del hero desde `scripts/portada.json` a `src/assets/portada/NN-<slug>.webp` (hasta 2880 px, vacía la carpeta antes). Corre con `pnpm importar` sin argumentos o con `portada`. Falla si una foto declarada no existe o si hay un archivo sin declarar. Agregar pruebas y verificar con `pnpm test`.

## 3. Sitio: hero independiente y esquema sin `carrusel`

- [x] 3.1 Quitar `carrusel` del esquema en `src/content.config.ts` y quitar `laminasCarrusel()` de `src/lib/catalogo.ts`. Agregar en `src/lib/catalogo.ts` una función pura que arme las láminas a partir de una lista `{archivo, imagen}` y del catálogo: ordena por nombre, toma el slug de `NN-<slug>` y falla si no hay fotos o si el slug no existe. Actualizar `tests/unit/catalogo.test.ts` con esos tres casos y verificar con `pnpm test`.
- [x] 3.2 En `src/lib/obras.ts`, cargar `src/assets/portada/*.webp` con `import.meta.glob` (con `copiaSinRastreo`) y hacer que `obtenerLaminas()` use la nueva función. `Portada.astro` sigue recibiendo `laminas`. Verificar con `pnpm check` sin errores.

## 4. Manifiestos y contenido

- [x] 4.1 Reescribir los 14 manifiestos de `scripts/obras/` según la tabla del design: `origen` con el nombre de la carpeta, `orden` explícito y sin `carrusel`. Agregar `repetidas` a `casa-foresta-zapallar`. Verificar con `grep -L '"orden"' scripts/obras/*.json`, que no debe devolver nada.
- [x] 4.2 Crear los 12 manifiestos nuevos (lote 3 con `album`, colegios, comercial, edificio y casas) con nombres con tildes (Diálisis, O'Higgins) y ciudad/ubicación `Por confirmar` o sugeridas por el nombre con `pendientes`. Agregar `repetidas` a `casa-ries-marbella`. Verificar que haya 26 archivos en `scripts/obras/`.
- [x] 4.3 Crear `scripts/portada.json` con las 6 fotos y sus obras (00 condominio, 01 y 02 central, 03 san cristóbal, 04 y 05 panamericana).
- [x] 4.4 Ampliar `00`, `01` y `02` de la portada con `pnpm reescalar ... --salida "<entrega>/reescaladas/00 PARA LA PORTADA"` a 2880 px, o reutilizar las ampliaciones previas si su dHash da 0. Revisarlas al 100 % y verificar que midan 2880 px de ancho.
- [x] 4.5 Ejecutar `pnpm importar` y verificar que termine sin errores con 26 obras, 272 fotos en `src/content/obras/` y 6 archivos en `src/assets/portada/`. Revisar en `git status` que no queden carpetas de obra huérfanas.

## 5. Pruebas de navegador y documentación

- [x] 5.1 Actualizar `tests/e2e/humo.spec.ts`: 6 láminas con su texto alternativo en orden (la primera, «Bosque Golf, El Condominio»), 21 obras en la grilla con «Todas», 4 colegios con «Colegios», lotes 1 a 5 en la ficha del condominio y ninguna foto repetida en una ficha (comparando `src`). Verificar con `pnpm build && pnpm test:e2e`.
- [x] 5.2 Medir el contraste del logo, el título y los integrantes sobre las 6 láminas, a 390 y 1440 px, con y sin acercamiento (≥ 3:1 y ≥ 4,5:1). Si falla, ajustar el degradado del velo en `Portada.astro` y volver a medir.
- [x] 5.3 Actualizar el `README.md`: «Importar obras» (nuevo formato, `repetidas`, `scripts/portada.json`, ruta de `reescaladas/`), «Agregar una obra» (sin `carrusel`), «Datos provisionales» (26 obras y 272 fotos, nombres por confirmar: Colegio Jean Jeaques, Edificio Ocares; fotos de baja resolución de Casa Ries y Oficinas Urbana) y el peso y el tiempo del build medidos. Verificar que los comandos documentados corran tal como están escritos.

## 6. Verificación integral

- [x] 6.1 Ejecutar `pnpm verificar` (tipos, unitarias, build, peso de AVIF y e2e) y verificar que pase completo.
- [x] 6.2 Revisar visualmente `pnpm preview` en 390 y 1440 px: portada (6 láminas, verticales bien recortadas), grilla de 21 obras con filtros y una ficha de cada categoría. Guardar capturas para mostrárselas al cliente.

## Workflow follow-up

- Mostrar las capturas al cliente y confirmar los nombres y el orden de la grilla antes de fusionar a `develop`.
- Archivar el cambio con `/opsx:archive` después de la revisión.

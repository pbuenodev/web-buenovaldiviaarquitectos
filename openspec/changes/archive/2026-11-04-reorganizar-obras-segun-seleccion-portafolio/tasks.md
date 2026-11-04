# Tasks

## 1. Importador según la selección

- [x] 1.1 Reescribir `importarObra` en `scripts/importar-obras.mjs` según D1 y D2: lee la carpeta `NN-<slug>/`, valida nombres `<slug>-NN[FAVORITA].webp`, una sola favorita, sin números repetidos; renumera a `foto-NN.webp`, deriva `orden` y `portada`, usa `reescaladas/<mismo nombre>` si existe y conserva el límite de 2000 px (2880 px la foto del carrusel). Verificar con `pnpm test` (tarea 1.2).
- [x] 1.2 Actualizar `tests/unit/importar-obras.test.ts` al nuevo formato: carpeta falsa con huecos de numeración, favorita en medio, reescalada que sustituye, y tres fallos (sin favorita, dos favoritas, nombre que no sigue el patrón). Verificar con `pnpm test`.
- [x] 1.3 Simplificar los 14 manifiestos de `scripts/obras/` (D2) y renombrarlos a los slugs de la carpeta del cliente (D1), con el carrusel de D4. Verificar con `pnpm importar` sin errores.

## 2. Contenido del sitio

- [x] 2.1 Revisar al 100 % la reescalada de El Condominio frente a la original de 1448 px y fijar cuál se usa (D3). Verificar dejando anotada la decisión en `design.md`.
- [x] 2.2 Importar las 14 obras (borrando antes las carpetas de `src/content/obras/` que ya no existan). Verificar con `find src/content/obras -name '*.webp' | wc -l` = 89 y 14 `index.yaml`, y con que el `orden` de cada obra es el número de su carpeta.
- [x] 2.3 Ver en `pnpm dev` el carrusel (6 láminas), la grilla en el orden del cliente y, al menos, la portada de Panamericana (vertical en 4:3), una ficha con fotos verticales y la de Colegio (3 fotos). Verificar contestando las preguntas abiertas 1 y 2 de `design.md` con lo que se vea.

## 3. Tests y documentación

- [x] 3.1 Actualizar `tests/e2e/humo.spec.ts`: primera obra `bosque-golf-lote-5` (10 fotos con nombres `foto-`), segunda `bosque-golf-el-condominio`, última `colegio-charles-school`, lámina 1 Bosque Golf, Lote 5 y lámina 2 Edificio Central Tráfico Alameda; mantener 14 obras, 6 láminas, 8 casas, 3 edificios y 3 comerciales. Verificar con `pnpm test:e2e`.
- [x] 3.2 Actualizar el README: patrón `foto-NN` y `FAVORITA` en "Agregar una obra", el nuevo formato del manifiesto y del importador, y la lista "Datos provisionales por reemplazar" (orden y favoritas ya resueltas por el cliente; quedan ciudad, ubicación y las preguntas abiertas). Verificar leyendo las secciones y ejecutando los comandos que documentan.
- [x] 3.3 Correr `pnpm verificar` completo y anotar el tiempo del build en frío en `design.md`. Verificar que termina en verde (tipos, tests, build, peso AVIF, e2e).

## Workflow follow-up

- Archivar primero `reemplazar-obras-por-fotos-reales` (su tarea 4.4 queda superada) y después este cambio.

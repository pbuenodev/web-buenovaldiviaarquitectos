# Tasks

## 1. Categoría "Colegios"

- [x] 1.1 Agregar `colegios: 'Colegios'` al final de `CATEGORIAS` (`src/lib/catalogo.ts`) y al `z.enum` de `src/content.config.ts`. Actualizar la prueba de categorías en `tests/unit/catalogo.test.ts`. Verificar con `pnpm test`.
- [x] 1.2 Cambiar a `colegios` la categoría del Colegio Charles School en `scripts/obras/colegio-charles-school.json` y en `src/content/obras/colegio-charles-school/index.yaml`. Verificar que `pnpm build` pasa y que en `pnpm dev` el filtro "Colegios" aparece después de "Comercial" y muestra solo esa obra.
- [x] 1.3 Agregar a la prueba de filtros de `tests/e2e/humo.spec.ts` el caso "Colegios" (marcado como activo, solo "Colegio Charles School"). Verificar con `pnpm test:e2e`.

## 2. Álbumes en el catálogo

- [x] 2.1 Agregar `album?: string` a `DatosObra` y al esquema zod. En `armarCatalogo`, validar que el slug del álbum exista, que no sea el de la propia obra y que la obra madre no tenga a su vez `album`, con mensajes que nombren las obras. Verificar con pruebas unitarias nuevas para cada caso de error y para un catálogo válido.
- [x] 2.2 Agregar `obrasDeLaGrilla(obras)` y `obrasDelAlbum(obras, slug)` a `catalogo.ts`. Verificar con pruebas unitarias: la grilla excluye las obras con `album`, las obras del álbum salen en orden, y `obraSiguiente` sobre las hermanas da la vuelta desde la última.
- [x] 2.3 En `scripts/importar-obras.mjs`, aceptar `album` (copiado a `index.yaml`) y `orden` (reemplaza al `NN` de la carpeta) como campos opcionales del manifiesto. Verificar con casos nuevos en `tests/unit/importar-obras.test.ts`, y documentar los dos campos en la sección de manifiestos del `README.md`.
- [x] 2.4 En los manifiestos y los `index.yaml` de `bosque-golf-lote-1`, `-2`, `-4` y `-5`, poner `album: bosque-golf-el-condominio` y `orden` 1, 2, 4 y 5. Verificar que `pnpm build` pasa.

## 3. Inicio: grilla y portada

- [x] 3.1 Pasar a `GrillaObras` solo `obrasDeLaGrilla(obras)` en `src/pages/index.astro`. Verificar en `pnpm dev` que la grilla muestra "Bosque Golf, El Condominio" y ningún lote, también con el filtro "Casas".
- [x] 3.2 Agregar `integrantes` (Pablo A. Bueno Orellana, Teresa Y. Valdivia Ponce, Bruno A. Bueno Valdivia) a `sitio` en `src/config/site.ts`.
- [x] 3.3 En `Portada.astro`, dejar el `h1` con "Bueno Valdivia" a `--titulo-l` y "Arquitectos" en un `span` a `0.5em`. Debajo y fuera del `h1`, poner la lista de integrantes con la clase `rotulo`, a 13 px y en color `--gris-foto`, todo anclado abajo. Verificar en `pnpm dev`, a 390 px y 1440 px, que nada desborda, que la jerarquía de tamaños se nota y que el contraste de los integrantes es ≥ 4,5:1 sobre las tres láminas.
- [x] 3.4 Actualizar `tests/e2e/humo.spec.ts`: separar la lámina 1 (Lote 5) de la primera obra de la grilla (ahora el condominio), revisar `SEGUNDA_OBRA`, `ULTIMA_OBRA` y el número de fotos, y agregar pruebas del nombre accesible del `h1` sin integrantes, de los tres integrantes visibles, de que "Bueno Valdivia" sea más grande que "Arquitectos" (≤ 88 px) y de que la grilla no tenga lotes. Verificar con `pnpm test:e2e`.

## 4. Ficha: título, bloque "Lotes", regreso y siguiente

- [x] 4.1 Agregar `--titulo-m: clamp(32px, 4.5vw, 64px)` a `tokens.css`, usarlo en el `h1` de `[slug].astro` y eliminar `--titulo-xl` si queda sin uso. Verificar a 1440 px que "Edificio Central Tráfico Alameda" ocupa como máximo dos líneas.
- [x] 4.2 En `getStaticPaths`, calcular para cada obra su álbum, sus obras internas y su siguiente (`obraSiguiente` sobre la grilla o sobre las hermanas). Mostrar `← Obras` o `← {álbum}` según corresponda. Verificar en `pnpm dev` que el Lote 1 vuelve al condominio y que su siguiente es el Lote 2.
- [x] 4.3 Crear `src/components/ObrasDelAlbum.astro` (rótulo "Lotes" y `GrillaObras`) e insertarlo entre las fotos y el cierre, solo si hay obras internas. Verificar que el condominio muestra L1, L2, L4 y L5 en ese orden, en 2 columnas a 390 px y en 3 a 1440 px, y que "Pub Los Amigos" no muestra el bloque.
- [x] 4.4 Agregar pruebas e2e: bloque "Lotes" con sus 4 tarjetas en orden y su enlace a un lote, ausencia del bloque en una ficha sin álbum, regreso al álbum desde un lote, recorrido de "Siguiente obra" entre lotes con vuelta al Lote 1, recorrido del catálogo sin lotes, y título de la ficha ≤ 64 px. Verificar con `pnpm test:e2e`.

## 5. Integración

- [x] 5.1 Ejecutar `pnpm verificar` (check, test, build, `verificar:imagenes`, e2e) y confirmar que todo pasa.
- [x] 5.2 Revisar a ojo el inicio y las fichas del condominio y de un lote a 390 px y 1440 px. Verificar con capturas que la portada, los títulos y el bloque "Lotes" se ven como pidió el cliente.

## Workflow follow-up

- Mostrar las capturas al cliente para que confirme los tamaños antes de archivar.
- Archivar el cambio con `/opsx:archive` una vez publicado.

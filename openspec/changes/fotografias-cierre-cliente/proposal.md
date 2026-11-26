# Proposal

## Why

El cliente entregó la selección final de fotografías del portafolio en `~/Descargas/webPabloBueno-fotografiasCierre` (281 fotos WebP). Trae 26 obras (21 en la grilla y 5 lotes de Bosque Golf), 12 más que hoy, y una carpeta aparte con las 6 fotos de la portada. El formato de la carpeta cambió: las obras se nombran por su nombre y no por `NN-<slug>`, las fotos se llaman `00.webp`, `01.webp`… y ya no traen la marca `FAVORITA`. Con este formato, `pnpm importar` no puede leer la entrega, y el hero actual no puede mostrar dos fotos de la misma obra, como pidió el cliente.

## What Changes

- **Entrega nueva como única fuente.** `pnpm importar` lee la carpeta del cierre por defecto. Cada obra tiene un manifiesto (`scripts/obras/<slug>.json`) que indica la carpeta de origen por su nombre (`"Casa en El San Cristobal"`, `"Bosque Golf - Marbella/Lote 3"`) y su `orden`. El orden de las fotos lo da el número del archivo (`00`, `01`…). La foto `00` es la portada de la obra. **BREAKING** para el importador: deja de aceptar el formato `NN-<slug>/<slug>-NN[FAVORITA].webp`.
- **Se reemplazan todas las fotos de las 14 obras actuales** por las de la entrega nueva. Las fichas pasan de 89 a 272 fotos.
- **Se agregan 12 obras:**
  - Casas: Casa en Los Muermos (Llanquihue), Casa Punta del Lacho y Casa Ries en Marbella.
  - Edificios: Edificio Ocares (Lo Prado).
  - Comercial: Centro de Diálisis O'Higgins, Centro de Diálisis Pudahuel Sur, Laboratorios Tecnolab y Oficinas Urbana en La Serena.
  - Colegios: Colegio Ecole Noel, Colegio Jean Jeaques y Colegio Zoltan Dienes.
  - Dentro del álbum del condominio: Bosque Golf, Lote 3.
- **Sin fotos repetidas.** Al importar se comparan las fotos de toda la entrega por su contenido, no por su nombre ni por su peso. Si dos fotos se ven iguales, la importación falla y nombra ambos archivos, salvo que el manifiesto excluya una de ellas. La revisión ya encontró tres repetidas: Foresta de Zapallar `00` = `07` y `03` = `04` (la misma imagen en dos tamaños), y Casa Ries `00` = `01` (el mismo archivo). En cada par se conserva la versión de mayor resolución, en la posición más temprana del par.
- **El hero se independiza de las obras.** Sus láminas salen de `00 PARA LA PORTADA/`, en el orden de los archivos (6 fotos: Bosque Golf El Condominio, Edificio Central Tráfico Alameda ×2, Casa en El San Cristóbal y Edificio Panamericana ×2). Un manifiesto de la portada indica a qué obra corresponde cada foto, solo para su texto alternativo. Estas fotos no se agregan a las fichas. Se elimina el campo `carrusel` de las obras. **BREAKING** para el esquema de `index.yaml`.
- **Orden de la grilla.** Las obras actuales conservan su posición. Las nuevas se agregan al final, agrupadas por categoría (casas, edificios, comercial, colegios). Los lotes quedan del 1 al 5 dentro del álbum.
- **Nombres con tildes.** Se corrigen las tildes y la ortografía que faltan en los nombres de carpeta (Cristóbal, Tráfico, Diálisis, O'Higgins). Las demás grafías se respetan tal como vienen. Ciudad y ubicación de las obras nuevas quedan como `Por confirmar`, salvo las que el nombre ya indica (Llanquihue, Lo Prado, La Serena, Marbella, Pudahuel), que quedan como pregunta abierta.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `catalogo-obras`: se reemplaza «Participación en el carrusel» por un conjunto de fotografías de portada propio. Se exige que no haya fotos repetidas. El escenario del condominio pasa a tener cinco lotes.
- `pagina-inicio`: la portada muestra las fotos de su propia selección y puede incluir varias de una misma obra. El filtro «Colegios» incluye los colegios nuevos.
- `ficha-obra`: el bloque «Lotes» del condominio muestra los lotes 1 a 5.

## Impact

- `scripts/importar-obras.mjs` (nuevo formato de entrega, detección de repetidas, importación del hero) y `tests/unit/importar-obras.test.ts`.
- `scripts/obras/*.json`: los 14 manifiestos actuales se actualizan y se crean 8 nuevos. Se crea `scripts/portada.json`.
- `src/content.config.ts` (sin `carrusel`), `src/lib/catalogo.ts`, `src/lib/obras.ts` y `src/components/Portada.astro` (láminas desde la carpeta de la portada). Se actualiza `tests/unit/catalogo.test.ts`.
- `src/content/obras/**` se regenera completo. Se crea la carpeta de fotos del hero.
- `tests/e2e/humo.spec.ts`: primera lámina, número de láminas, número de obras y lotes.
- `README.md`: secciones «Importar obras», «Agregar una obra» y «Datos provisionales».
- El repositorio crece en peso de fotos (de 89 a 272), y el primer build tarda más.

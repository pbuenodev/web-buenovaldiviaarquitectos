# Proposal

## Why

El cliente revisó el portafolio y armó una carpeta curada, `~/Descargas/Seleccion Portafolio`: 14 obras en el orden en que quiere mostrarlas, 89 fotos numeradas dentro de cada obra y una marcada `FAVORITA` por obra. El catálogo que hoy está en `src/content/obras/` salió de una selección anterior (183 fotos, orden y portadas decididos por quien importó), y ya no refleja lo que el cliente quiere. La selección pasa a ser la única fuente de verdad.

## What Changes

- **Orden de las obras**: el prefijo de cada carpeta (`01-` a `14-`) pasa a ser la posición `orden` de la grilla; hoy es otro (p. ej. Bosque Golf Lote 5 está en la posición 8 y debería ser la 1).
- **Orden de las fotos**: el número al final de cada archivo es el orden de presentación en la ficha. Las fotos se guardan como `foto-01.webp`, `foto-02.webp`… (renumeradas sin huecos) en lugar de `exterior-NN` / `interior-NN`, porque ese patrón obliga a mostrar todas las exteriores antes que las interiores y no puede respetar el orden del cliente.
- **Portada**: la foto `FAVORITA` de cada obra es su `portada`.
- **Fotos**: de 183 a 89 (las que el cliente conservó), con las dos reescaladas con IA de `reescaladas/` sustituyendo a sus homónimas.
- **Slugs**: los de la carpeta del cliente (`casa-santo-domingo`, `casa-san-cristobal`, `casa-foresta-zapallar`, `oficinas-bodegas-cueto`…), que cambian la dirección de cinco obras (las tres casas, Oficinas y Bodegas Cueto y El Condominio); las otras nueve conservan la suya.
- **Carrusel**: 6 láminas elegidas entre las favoritas que sirven de fondo a pantalla completa (horizontales, ≥ 2560 px de ancho en el repo, nitidez aceptable según el manifiesto del cliente). Ver `design.md`.
- **Importador**: `scripts/importar-obras.mjs` descubre las fotos por la estructura de la carpeta; el manifiesto `scripts/obras/<slug>.json` queda solo con los datos de la obra (nombre, categoría, ciudad, ubicación, posición en el carrusel) y ya no lista las fotos una a una ni su grupo.
- **Tests** (`humo.spec.ts`, importador) y **README** actualizados al nuevo orden y nombres.

**Fuera de alcance**: diseño, número de WhatsApp, redes, dominio, y las categorías (se mantienen `casas`, `edificios` y `comercial` del cambio anterior).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `catalogo-obras`: el ejemplo de fotografías de una obra deja de depender del patrón `exterior-NN` / `interior-NN`; la regla de orden alfabético se mantiene y se explicita que el número del nombre decide el orden.

`pagina-inicio`, `ficha-obra` e `imagenes` no cambian: el orden de la grilla y del carrusel ya sale de `orden`, y los pesos y anchos no varían.

## Impact

- `src/content/obras/`: se regenera completo (14 carpetas, 89 fotos, nombres `foto-NN`).
- `scripts/importar-obras.mjs`, `scripts/obras/*.json` (formato simplificado) y `tests/unit/importar-obras.test.ts`.
- `tests/e2e/humo.spec.ts`: slugs, primeras obras y láminas.
- `README.md`: "Agregar una obra", "Importar obras" y "Datos provisionales por reemplazar".
- Relación con el cambio `reemplazar-obras-por-fotos-reales` (aún sin archivar, con la tarea 4.4 pendiente): este cambio reemplaza sus decisiones D2 (clasificación exterior/interior) y D6 (carrusel). Conviene archivar aquel primero, dando 4.4 por superada.

# Design

## Context

Observado:

- **La selección** (`~/Descargas/Seleccion Portafolio`, 114 MB, fuera del repo): 14 carpetas `NN-<slug>/` con 89 `.webp` llamadas `<slug>-NN.webp`; una por obra lleva `NNFAVORITA` en el nombre. Hay huecos en la numeración (Lote 4 no tiene el 06, Central Tráfico salta del 05 al 09, San Cristóbal no tiene el 03…): son fotos que el cliente descartó. `MANIFIESTO.md` documenta el origen de cada foto y mide resolución y nitidez; `reescaladas/` trae dos favoritas ampliadas con IA (2880 px) con el mismo nombre que su original.
- **Fotos por obra**: Lote 5: 10 · Condominio: 9 · Lote 4: 6 · Lote 2: 7 · Lote 1: 6 · Central Tráfico: 6 · Panamericana: 6 · Santo Domingo: 8 · Sebastopol: 5 · San Cristóbal: 4 · Cueto: 7 · Pub: 7 · Foresta de Zapallar: 5 · Colegio: 3.
- **Resolución**: 51 fotos ≥ 3000 px de ancho, 15 entre 2000 y 2999 y 23 bajo 2000 (10 verticales). Las favoritas de Lote 5 y Condominio miden 1448 px y la de Panamericana es vertical.
- **Estado del repo**: `src/content/obras/` ya se regeneró una vez desde esta carpeta, pero con un manifiesto que lista cada foto y su grupo `exterior`/`interior`, `orden` y portadas decididos por quien importó, y slugs propios. Hoy: Lote 5 está en la posición 8 de la grilla; hay 6 láminas de carrusel (Condominio, Lote 5, San Cristóbal, Santo Domingo, Central Tráfico, Sebastopol). El importador ya conserva hasta 2880 px en la foto del carrusel y `Foto.astro` sirve hasta 2560 px en el carrusel (el resto, hasta 1600 px; AVIF q50).
- **Grilla**: las portadas se recortan a 4:3 con `object-fit: cover`; el carrusel usa `cover` a pantalla completa.

## Goals / Non-Goals

**Goals:** que el sitio muestre exactamente la selección del cliente, con su orden de obras, su orden de fotos y sus favoritas como portadas; que el importador sea reproducible leyendo esa carpeta; que `pnpm verificar` pase.

**Non-Goals:** categorías nuevas, cambios de diseño, reescalar más fotos, datos de contacto.

## Decisions

### D1. La carpeta del cliente es la fuente de verdad
- `orden` de la obra = el número de la carpeta (`01` → 1 … `14` → 14).
- Slug de la obra = el nombre de la carpeta sin el número (`01-bosque-golf-lote-5` → `bosque-golf-lote-5`).
- Orden de las fotos = el número del archivo. Se renumeran sin huecos a `foto-01.webp`… (dos dígitos), conservando el orden relativo.
- `portada` = la foto cuyo nombre lleva `FAVORITA`, ya con su nombre nuevo. El importador falla si una obra tiene cero o más de una favorita, un número repetido, o un nombre que no sigue `<slug>-NN[FAVORITA].webp`.

Alternativas descartadas: mantener `exterior-NN` / `interior-NN` (ordena alfabéticamente todas las exteriores antes que las interiores y no respeta el orden del cliente, que no hizo esa distinción); ordenar por el número del nombre original (se pierde el control del cliente).

### D2. Manifiesto reducido a datos de la obra
`scripts/obras/<slug>.json` conserva `origen` (nombre de la carpeta), `nombre`, `categoria`, `ciudad`, `ubicacion`, `pendientes` y, opcionalmente, `carrusel: { orden }` (la foto del carrusel siempre es la favorita). Desaparecen `fotos`, `grupo`, `orden` y `portada`, que ahora salen de la carpeta. Si existe `reescaladas/<mismo nombre>`, el importador usa ese archivo en lugar del de la carpeta de la obra.

### D3. Reescaladas
- **Lote 5**: se usa la reescalada (el manifiesto del cliente la recomienda).
- **El Condominio**: el manifiesto avisa de que la vegetación ya se ve «pintada» por la mejora previa. Se usa la reescalada para la portada de la grilla, pero **no** entra al carrusel, y solo si al revisarla al 100 % no se ve peor que la de 1448 px; si se ve peor, se conserva la original. **Revisado al aplicar (tarea 2.1)**: frente a la original ampliada a 2880 px, la reescalada tiene bordes de fachada y marcos más limpios y la vegetación no queda peor; se usa.

### D4. Carrusel: 6 láminas
Se eligen favoritas que el manifiesto del cliente marca ✅ (horizontal, ≥ 1920 px, nitidez ≥ 70) y que miden ≥ 2560 px de ancho, salvo Lote 5, ampliada a 2880 px:

| Lámina | Obra | Foto | Por qué |
|---|---|---|---|
| 1 | Bosque Golf, Lote 5 | favorita (reescalada, 2880 px) | primera obra del cliente |
| 2 | Edificio Central Tráfico Alameda | `foto-03` (4096 px, nitidez 172) | |
| 3 | Casa en La Foresta de Zapallar | favorita (3200 px, nitidez 185) | |
| 4 | Oficinas y Bodegas Cueto | favorita (4096 px, nitidez 134) | |
| 5 | Colegio Charles School | favorita (4096 px, nitidez 153) | |
| 6 | Casa en El San Cristóbal | favorita (4032 px, nitidez 104) | |

Cubre casas, edificios y comercial y no repite Bosque Golf. Quedan fuera: Condominio y Lote 4, 2 y 1 (se vería cinco veces la misma urbanización); Panamericana (favorita vertical, la horizontal tiene nitidez baja); Santo Domingo y Sebastopol (favoritas con nitidez baja); Pub (favorita de 1920 px). Mantener 6 láminas conserva el formato `01 / 06` de los tests.

### D5. Datos que no se conocen
`ciudad` y `ubicacion` siguen en `Por confirmar` (salvo Zapallar y Santo Domingo, tomadas del nombre, sin confirmar), marcadas `# PREGUNTA ABIERTA`, y salen en el README.

## Risks / Trade-offs

- [Portada vertical de Panamericana recortada a 4:3 en la grilla] → revisado en el sitio construido: el recorte central muestra la fachada con el letrero y se ve bien; no hace falta cambiarla.
- [Obras con 3 o 4 fotos (Colegio, San Cristóbal)] → es la selección del cliente; la ficha lo muestra tal cual.
- [Las 4 fotos de Lote 5 con nitidez baja o 1448 px se ven blandas en pantallas grandes] → el sitio no las amplía; el cliente decide si pide mejores.
- [Cambio de URL de cinco obras] → el sitio aún está en `noindex` y sin enlaces externos conocidos.
- [Menos fotos de origen] → medido: build en frío de 4 min 40 s (antes 7 min 58 s), 365 imágenes AVIF, la mayor de 292 KB.

## Open Questions

1. ¿La favorita de Panamericana, vertical, es la que quiere como portada de la grilla?
2. ¿Prefiere otro conjunto o un orden distinto para las 6 láminas del carrusel?
3. Ciudad y ubicación de cada obra.

# Design

## Context

Lo que se observó en la entrega (`~/Descargas/webPabloBueno-fotografiasCierre`, 281 WebP, 242 MB):

- Hay 21 carpetas de obra con el nombre de la obra (`Casa en El San Cristobal`, `Edificio Ocares -Lo Prado`). Bosque Golf trae una carpeta madre, `Bosque Golf - Marbella/`, con `El Condominio/` y `Lote 1/` a `Lote 5/`. Ninguna carpeta lleva número de orden.
- Las fotos se llaman `00.webp`, `01.webp`… Puede haber huecos (El Condominio salta del `21` al `23`). No hay marca `FAVORITA`.
- Las medidas van de 453 px (Casa Ries, la obra completa entre 453 y 604 px) a 4032 px (fotos de celular).
- `00 PARA LA PORTADA/` trae 6 fotos. Se reconocieron comparando su contenido:

| Archivo | Medidas | Obra | ¿Está en la ficha? |
|---|---|---|---|
| `00.webp` | 1672×941 | Bosque Golf, El Condominio | No (es la lámina actual) |
| `01.webp` | 1448×1086 | Edificio Central Tráfico Alameda | Sí, idéntica a `Edificio Central Trafico Alameda/00.webp` |
| `02.webp` | 1000×750 | Edificio Central Tráfico Alameda | Sí, idéntica a `.../05.webp` (es la lámina actual) |
| `03.webp` | 4032×3024 | Casa en El San Cristóbal | No |
| `04.webp` | 3024×4032 (vertical) | Edificio Panamericana (letrero) | No |
| `05.webp` | 3024×4032 (vertical) | Edificio Panamericana (balcones) | No |

- Repetidas: se calculó una huella perceptual (dHash de 64 bits) de las 281 fotos. Hay 5 pares con distancia 0 y ninguno entre 1 y 11. El par distinto más parecido está a 12: Colegio Zoltan Dienes `06` y Panamericana `01`, que son edificios diferentes. Quitando los 2 pares de la portada, quedan 3 repetidas reales, todas dentro de una misma obra: Foresta `00`/`07` (576 y 1024 px), Foresta `03`/`04` (1024 y 576 px) y Casa Ries `00`/`01` (archivos idénticos). Las tomas parecidas, como Lote 3 `10`/`11` y Lote 4 `00`/`01`, están a 15 o 16 y se revisaron a ojo: son encuadres o luces distintas.
- Hoy, `importar-obras.mjs` exige `NN-<slug>/<slug>-NN[FAVORITA].webp` y `origen` con la forma `NN-<slug>`. El hero sale de `laminasCarrusel()`, una lámina por obra con `carrusel` (ver `src/lib/catalogo.ts:115`).

## Goals / Non-Goals

**Goals:**
- Una sola importación (`pnpm importar`) reconstruye las 26 obras y el hero desde la entrega, sin pasos a mano.
- Que una entrega futura con una foto repetida falle de forma ruidosa en vez de publicarse.

**Non-Goals:**
- Mejorar ni reescalar las fotos de las fichas. Las de baja resolución, como Casa Ries y Oficinas Urbana, se muestran angostas con la regla que ya existe.
- Corregir el color o el encuadre de las fotos.
- Mantener compatibilidad con el formato de entrega anterior.

## Decisions

### 1. El manifiesto apunta a la carpeta por su nombre y fija el orden
`scripts/obras/<slug>.json` conserva `nombre`, `ciudad`, `ubicacion`, `categoria`, `pendientes` y `album`. Cambian dos campos: `origen` pasa a ser la ruta relativa de la carpeta (`"Bosque Golf - Marbella/Lote 3"`) y `orden` pasa a ser obligatorio. Se quita `carrusel`. El slug sigue siendo el nombre del archivo del manifiesto.
- *Alternativa descartada*: derivar el slug del nombre de la carpeta. Cambiaría las URL de las obras que ya existen (`casa-san-cristobal` pasaría a ser `casa-en-el-san-cristobal`) y no resuelve el orden.
- *Alternativa descartada*: pedir al cliente que renombre las carpetas a `NN-slug`. Él ya entregó el cierre, y cada entrega nueva volvería a romperse.

Slugs y orden:

| Orden | Slug | Carpeta | Categoría |
|---|---|---|---|
| 2 | `bosque-golf-el-condominio` | `Bosque Golf - Marbella/El Condominio` | casas |
| 6 | `edificio-central-trafico-alameda` | `Edificio Central Trafico Alameda` | edificios |
| 7 | `edificio-panamericana` | `Edificio Panamericana` | edificios |
| 8 | `casa-santo-domingo` | `Casa en Santo Domingo` | casas |
| 9 | `local-sebastopol` | `Local Sebastopol` | comercial |
| 10 | `casa-san-cristobal` | `Casa en El San Cristobal` | casas |
| 11 | `oficinas-bodegas-cueto` | `Oficinas y Bodegas Cueto` | comercial |
| 12 | `pub-los-amigos` | `Pub Los Amigos` | comercial |
| 13 | `casa-foresta-zapallar` | `Casa en La Foresta de Zapallar` | casas |
| 14 | `colegio-charles-school` | `Colegio Charles School` | colegios |
| 15 | `casa-los-muermos` | `Casa en Los Muermos -Llanquihue` | casas |
| 16 | `casa-punta-del-lacho` | `Casa Punta del Lacho` | casas |
| 17 | `casa-ries-marbella` | `Casa Ries en Marbella` | casas |
| 18 | `edificio-ocares` | `Edificio Ocares -Lo Prado` | edificios |
| 19 | `centro-dialisis-ohiggins` | `Centro de Dialisis Ohiggins` | comercial |
| 20 | `centro-dialisis-pudahuel-sur` | `Centro de Dialisis Pudahuel Sur` | comercial |
| 21 | `laboratorios-tecnolab` | `Laboratorios Tecnolab` | comercial |
| 22 | `oficinas-urbana-la-serena` | `Oficinas Urbana en La Serena` | comercial |
| 23 | `colegio-ecole-noel` | `Colegio Ecole Noel` | colegios |
| 24 | `colegio-jean-jeaques` | `Colegio Jean Jeaques` | colegios |
| 25 | `colegio-zoltan-dienes` | `Colegio Zoltan Dienes` | colegios |
| 1–5 | `bosque-golf-lote-1` … `-5` | `Bosque Golf - Marbella/Lote N` | casas, `album: bosque-golf-el-condominio` |

Las obras actuales conservan su `orden`, aunque tenga huecos. Las nuevas van después, agrupadas por categoría.

### 2. Fotos por número de archivo; la primera es la portada
El patrón de foto pasa a ser `^(\d{2,3})\.webp$`. Las fotos se ordenan por número, se renumeran `foto-01`… sin huecos, y la primera se escribe como `portada`. Siguen igual la reducción a 2000 px de lado mayor, `rotate()` según EXIF, WebP calidad 85 y la sustitución desde `reescaladas/`. Se agrega `--entrega` con un nuevo valor por defecto: `~/Descargas/webPabloBueno-fotografiasCierre`. Un archivo que no sigue el patrón hace fallar la importación nombrándolo. `.DS_Store` se ignora.

### 3. Repetidas: huella perceptual al importar y pares declarados
Antes de escribir nada, el importador calcula un dHash de 64 bits (escala de grises a 9×8 con sharp) de **todas** las fotos de obra de la entrega, aunque se importe una sola obra. Un par a distancia de Hamming ≤ 6 es repetido. Si el manifiesto de la obra lo declara en `"repetidas": [["00.webp", "07.webp"]]`, se conserva la foto de mayor área en la posición del número menor y se descarta la otra. Si no lo declara, la importación falla listando los pares, con la ruta de ambos archivos y su distancia.
- El umbral 6 deja margen frente a los datos medidos: las repetidas reales están en 0, y lo distinto más parecido, en 12. Se fija como constante con un comentario.
- *Alternativa descartada*: descartar las repetidas sin avisar. Una coincidencia falsa borraría una foto buena sin que nadie lo note.
- *Alternativa descartada*: comparar con md5. No detecta la misma foto en dos tamaños, que es el caso de Foresta.
- Un par entre obras distintas no se puede declarar: siempre falla, porque se resuelve en la entrega.

Pares declarados: `casa-foresta-zapallar` declara `["00.webp","07.webp"]` y `["03.webp","04.webp"]`, y `casa-ries-marbella` declara `["00.webp","01.webp"]`.

### 4. Hero propio: `src/assets/portada/NN-<slug>.webp`
`scripts/portada.json` declara `{ "origen": "00 PARA LA PORTADA", "fotos": { "00.webp": "bosque-golf-el-condominio", ... } }`. `pnpm importar` (sin slugs, o con `portada` como argumento) vacía `src/assets/portada/` y escribe cada foto como `NN-<slug>.webp`, con hasta 2880 px de lado mayor y la misma sustitución desde `reescaladas/`. El nombre del archivo lleva tanto el orden como la obra, así que el build no necesita leer otro manifiesto.
- En el sitio, `src/lib/obras.ts` carga `src/assets/portada/*.webp` con `import.meta.glob` y las ordena por nombre. Cada lámina busca su obra por el slug. Si no la encuentra, o si no hay fotos, el build falla con un mensaje (spec catalogo-obras). Se cambia el tipo `Lamina` para que conserve `obra` (el texto alternativo y las pruebas lo usan) y `foto`. `Portada.astro` no cambia más allá de su fuente.
- Se quitan `carrusel` del esquema de `content.config.ts`, `laminasCarrusel()` y sus pruebas, y la rama `LADO_MAXIMO_CARRUSEL` por obra. Esa constante pasa a usarse solo en el hero.
- *Alternativa descartada*: `carrusel` como lista en el `index.yaml` de cada obra. Exigiría que las fotos estén en la ficha, y el cliente las entregó aparte.
- *Alternativa descartada*: copiar las fotos a mano. Una reimportación las borraría o las dejaría desactualizadas.

### 5. Ampliar las tres láminas pequeñas
`00` (1672 px), `01` (1448 px) y `02` (1000 px) no alcanzan los 2880 px. Se amplían con `pnpm reescalar` a `<entrega>/reescaladas/` con el mismo nombre que tendrán en la portada. Para distinguirlas de una foto de obra que se llame igual, van bajo `reescaladas/00 PARA LA PORTADA/`. El importador busca en `reescaladas/<origen>/<archivo>`, y la misma regla vale para las obras. Si el cambio anterior dejó en `~/Descargas/Seleccion Portafolio/reescaladas/` las ampliaciones de Condominio y Central, se reutilizan si son la misma imagen (distancia 0). `03` a `05` ya superan los 2880 px de lado mayor.

### 6. Respaldo y orden de reemplazo
`src/content/obras/` se regenera completo, porque el importador borra y reescribe la carpeta de cada obra. Antes de importar se respalda la entrega (`cp -a` a `~/Descargas/respaldo-cierre-<fecha>`), ya que se le agrega `reescaladas/`. El repositorio actual sirve de respaldo de lo publicado.

## Risks / Trade-offs

- [Unas 272 fotos de hasta 2000 px suben el peso del repositorio y el tiempo del primer build] → Se acepta: el cliente quiere todas. Se mide el tamaño de `src/content/obras/` y el tiempo del build, y se anotan en el README. Si el build en Cloudflare supera su límite, se baja `LADO_MAXIMO` a 1600 en un cambio aparte.
- [Casa Ries (453–604 px) y Oficinas Urbana (640–960 px) se verán pequeñas] → La regla de fotos angostas ya las centra sin ampliarlas. Se pide al cliente mejores originales. No bloquea.
- [La lámina `02` (1000 px) ampliada 2,9× puede verse blanda] → Ya era la lámina actual con la misma ampliación y se aceptó. Se revisa al 100 %.
- [Las láminas nuevas (San Cristóbal al atardecer, dos verticales de Panamericana con cielo gris) pueden bajar el contraste del texto] → Se repite la medición del cambio anterior (logo y título ≥ 3:1, integrantes ≥ 4,5:1, a 390 y 1440 px, con y sin acercamiento) en las 6 láminas. Si falla, se ajusta primero el degradado superior del velo.
- [El dHash falla con una foto recortada o espejada] → No se pide detectar ese caso. Las tomas parecidas no son repetidas según la spec.
- [AVIF de las láminas por sobre 400 KB] → `pnpm verificar:imagenes` lo detecta. Se baja la calidad WebP de la fuente, no el límite.
- [Cambian las URL: no; se agregan 12 nuevas] → Las URL actuales se mantienen por el slug fijado en el manifiesto.

## Migration Plan

1. Respaldar la entrega.
2. Cambiar el importador y el sitio con sus pruebas.
3. Escribir los manifiestos.
4. Ampliar las láminas.
5. Correr `pnpm importar` y luego `pnpm verificar`.

Para revertir, basta con el commit anterior: las obras y el hero quedan versionados en el repositorio.

## Open Questions

- Nombres por confirmar con el cliente: «Colegio Jean Jeaques» (¿«Jean Jacques»?), «Oficinas Urbana en La Serena» y «Edificio Ocares» (¿«Ocáres»?). Se publican tal como vienen y se anotan en el README. Corregirlos es cambiar un `nombre` en el manifiesto y reimportar.
- Ciudad y ubicación de todas las obras siguen `Por confirmar`. Cuando el nombre las sugiere (Llanquihue, Lo Prado, La Serena, Pudahuel, Marbella), se usan con `# PREGUNTA ABIERTA`.
- El orden de la grilla para las obras nuevas es una propuesta. Cambiarlo es editar `orden` y reimportar.

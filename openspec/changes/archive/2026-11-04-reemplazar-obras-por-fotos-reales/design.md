# Design

## Context

Datos observados (no supuestos):

- **Entrega** (`~/Descargas/drive-download-20261103T213830Z-1-001`, fuera del repo): 394 archivos, 666 MB, incluyendo originales y 10 `.DS_Store`. Las `.webp` mejoradas son **181** (224 MB, mediana 970 KB, máxima 3,9 MB), no ~390. Distribución por obra: San Cristóbal 10, Foresta de Zapallar 13, Santo Domingo 13, Colegio Charles 6, Central Tráfico Alameda 13, Panamericana 16, Local Sebastopol 7, Oficinas y Bodegas Cueto 11, Pub Los Amigos 7, Bosque Golf 85 (Condominio 24, Lote 1 13, Lote 2 19, Lote 4 15, Lote 5 14).
- **Diferencias con el pedido**: Bosque Golf tiene Lote 5, y **Lote 3 no tiene carpeta de mejoradas** (12 originales `L3_Photo - NN.jpg`). Los nombres de archivo son heterogéneos: `IMG_0643_UltraHD.webp`, `cocina_limpia_01.webp`, UUID, `IMG_2537(1).webp`, etc.
- **Resolución mejorada**: 56 fotos a 4096 px de ancho, 47 entre 3000 y 4095, 31 entre 2000 y 2999, 47 bajo 2000 px (6 verticales). Ninguna mejorada baja de 900 px de ancho que se haya detectado; el cálculo de "foto angosta" ya cubre las verticales.
- **Código actual**: `Foto.astro` sirve anchos `[480, 800, 1200, 1600, 2000]` en AVIF (q55) y WebP (q72), sin superar el ancho de origen. `src/lib/obras.ts` toma las fotos con `import.meta.glob('/src/content/obras/*/*.{webp,avif,jpg,jpeg,png}')`; el orden es alfabético por nombre. `CATEGORIAS` en `src/lib/catalogo.ts` es la única fuente de rótulos y `Filtros.astro` se deriva de ella; el enum de `content.config.ts` es la otra.
- **Medición**: la foto más pesada (Panamericana `IMG_8430.webp`, 4096×3072) genera un AVIF de **~415 KB a 2000 px y q55**, por encima del tope de 300 KB de la spec `imagenes`. Con la carpeta de prueba actual (fuentes de 1448 px) nunca se vio el problema porque el ancho de origen limitaba la versión mayor.
- Los tests e2e dependen de las 6 obras de prueba (`casas-chicureo`, `edificio-los-leones`, `casa-la-quebrada`, el conteo `OBRAS = 6` y `CASAS` / `EDIFICIOS`).

## Goals / Non-Goals

**Goals:**
- Que un solo comando repetible pase de la carpeta del cliente a `src/content/obras/<slug>/` sin renombrar a mano 181 archivos.
- Que `pnpm verificar` termine en verde con el catálogo real y que el peso AVIF quede bajo 300 KB con margen.
- Que nada de lo desconocido se invente.

**Non-Goals:**
- Rediseño, WhatsApp, redes, dominio.
- Subir al repo los originales ni las mejoradas sin reducir.
- Subtítulos o secciones dentro de la ficha (no existen en la spec); por eso Bosque Golf se divide.

## Decisions

### D1. Importación con script y manifiesto, no a mano
`scripts/importar-obras.mjs` (usa `sharp`, ya es dependencia) lee un manifiesto JSON por obra (`scripts/obras/<slug>.json`; JSON y no YAML para no sumar una dependencia), con: carpeta de origen, `nombre`, `categoria`, `orden`, datos conocidos de `ciudad` / `ubicacion` y una lista ordenada de `{ origen, grupo: exterior|interior }`. El script:

1. Recorre solo la subcarpeta de mejoradas (nombre que coincida con `/^mejora(do|das)?$/i`); ignora `.DS_Store` y todo lo que no sea `.webp`.
2. Copia el archivo según el orden de la lista, lo renombra a `exterior-NN.webp` / `interior-NN.webp` (numeración por grupo, dos dígitos; tres si el grupo pasa de 99) y escribe `index.yaml`.
3. Ignora los caracteres problemáticos del nombre original (paréntesis, espacios, "Copia de") porque solo se usan como clave en el manifiesto, nunca como nombre de destino.
4. Falla si un archivo del manifiesto no existe o si la carpeta de origen tiene `.webp` mejoradas que el manifiesto no menciona (nada se pierde en silencio).

Alternativa descartada: `cp` + renombrado manual. Es irrepetible cuando el cliente reenvíe fotos corregidas.

### D2. Clasificación y orden de las fotos
El nombre de archivo no dice si es exterior o interior (salvo `cocina_limpia_NN`). El orden inicial del manifiesto es el del nombre de archivo original (las `IMG_NNNN` de cámara suelen ser cronológicas); luego se revisa cada obra con una hoja de contactos (`magick montage`) y se asigna `exterior` / `interior`, ajustando el orden dentro del grupo para que la primera exterior sea la mejor. **El orden final es una pregunta abierta para el cliente**; mientras tanto el manifiesto es la única fuente y se corrige ahí, no en las carpetas.

Para obras sin interiores o sin exteriores (lotes, local, pub) se usa solo el grupo que exista; el patrón `exterior-NN` / `interior-NN` del README se mantiene.

### D3. Tratamiento de las fotos: fuente de 2000 px, versión servida máxima de 1600 px
- **Fuentes del repo**: el script reduce a **2000 px de lado mayor** (nunca amplía), WebP calidad 85. Los originales y las mejoradas a 4096 px quedan fuera del repo. Una fuente de 4096 px es inútil: el sitio nunca sirve más de 2000 px y los 2000 px bastan con holgura para 1600.
- **Versiones servidas** (`Foto.astro`): anchos `[480, 800, 1200, 1600]`, AVIF q50. La versión mayor (1600) de la peor foto debe quedar bajo 300 KB; el peor caso a 2000 px / q55 pesa ~415 KB, y a 1600 px se espera ~260 KB (medido en 3.2: 235 KB como máximo). `pnpm verificar:imagenes` es el árbitro.
- Dos tamaños se mantienen coherentes: la spec `imagenes` ("ninguna versión supera el ancho de origen", "AVIF mayor ≤ 300 KB") **no cambia**.

Alternativas consideradas: (a) conservar 2000 px y bajar la calidad hasta que quepa: la calidad requerida (~q40) se nota en fachadas con textura; (b) per-foto calidad adaptativa: más complejo y no determinista; (c) guardar las fuentes de 4096 px: ~224 MB en el repo y build más lento sin ganancia visible.

Resultado medido (tareas 3.1 y 3.2, con las 14 obras importadas): las 183 fuentes reducidas pesan **59 MB** en total (mediana 303 KB, máxima 820 KB), menos que los 109 MB de las 60 fotos de prueba y que los 224 MB de las mejoradas originales. Con anchos hasta 1600 px y AVIF q50, el build genera 1 458 imágenes y la AVIF mayor pesa **235 KB** (límite 300 KB). El **build en frío tarda 7 min 58 s** en 4 núcleos (1 903 s de CPU); con la caché de `node_modules/.astro/` los siguientes son mucho más cortos.

### D4. Categorías: `casas`, `edificios` y la nueva `comercial`
| Categoría | Rótulo | Obras |
|---|---|---|
| `casas` | Casas | Casa en El San Cristobal, Casa en La Foresta de Zapallar, Casa en Santo Domingo, Bosque Golf (5 fichas) |
| `edificios` | Edificios | Edificio Central Tráfico Alameda, Edificio Panamericana, Colegio Charles School |
| `comercial` | Comercial | Local Sebastopol, Pub Los Amigos, Oficinas y Bodegas Cueto |

Se agrega `comercial` porque colegio, local, pub y bodegas no son casas, y dejar locales y pubs bajo "Edificios públicos" sería incorrecto. El colegio (institucional) se agrupa con los edificios. El rótulo `edificios` pasa de "Edificios públicos" a "Edificios" porque la entrega incluye edificios privados.

Cambios: `content.config.ts` (enum), `CATEGORIAS` en `src/lib/catalogo.ts` (rótulos, y `Filtros.astro` los hereda), specs `catalogo-obras` (categorías cerradas) y `pagina-inicio` (cuatro filtros). **`ficha-obra` no cambia**: la ficha no muestra la categoría. Alternativas: una sola categoría `otros` (menos clara para el visitante) o aplanar a `casas | otros`; se descartaron.

### D5. Bosque Golf como cinco fichas
La ficha muestra todas las fotos de una carpeta, sin secciones, y Bosque Golf suma 85 fotos mejoradas: una sola ficha de 85 fotos es larga y pesada. Se propone **cinco obras** (`bosque-golf-condominio`, `bosque-golf-lote-1`, `-2`, `-4`, `-5`), todas `casas`, nombradas "Bosque Golf, El Condominio" / "Bosque Golf, Lote N". Lote 3 se omite hasta recibir su versión mejorada. Si el cliente prefiere una sola obra, el script soporta una lista de varias carpetas por manifiesto (se limitaría a una selección de ~20 fotos).

### D6. Portada y carrusel
- **Carrusel**: 6 láminas, una por obra. Las 6 fotos de "Para Portada" corresponden solo a 4 obras (dos son del Edificio Central Tráfico Alameda y dos de Panamericana), y las dos de Panamericana son verticales una vez aplicada su orientación EXIF; se usaron la aérea del condominio (Bosque Golf) y `IMG_0626` (San Cristóbal), y se completó con la mejor foto mejorada de Central Tráfico (versión de 4096 px de la foto de portada), Panamericana, Santo Domingo y Local Sebastopol. Se asocia mirándolas (varios nombres `IMG_NNNN` coinciden con series de las obras). Una foto de "Para Portada" solo entra si mide ≥ 1600 px de ancho; las dos pequeñas (1000 px y 1448 px) no sirven a pantalla completa y se reemplazan por la mejor horizontal mejorada de su obra. La foto elegida se copia a la carpeta de la obra como parte de `exterior-NN` (el carrusel solo puede nombrar archivos de esa carpeta). Mantener 6 láminas conserva el formato `01 / 06` y simplifica los tests.
- **Portada de grilla**: por defecto, la primera foto (`exterior-01`); se fija `portada:` solo si la mejor foto no es la primera. Se prefiere horizontal 4:3 porque la grilla recorta a 4:3.
- Cuál obra va en cada lámina y su orden es una **pregunta abierta** si ninguna foto se puede asociar con certeza.

### D7. `index.yaml` con datos desconocidos
`ciudad` y `ubicacion` son obligatorios en el esquema (spec sin cambios). Para no inventar: donde el nombre de la obra trae la localidad (Zapallar, Santo Domingo, Alameda) se usa esa palabra, y donde no hay dato se escribe `Por confirmar`; cada una lleva un comentario `# PREGUNTA ABIERTA` y se lista en el README. `orden` provisional: casas, edificios, comercial y Bosque Golf al final. El sitio sigue en `noindex`, así que los valores provisionales no se indexan.

## Risks / Trade-offs

- [Foto exterior/interior mal clasificada] → revisión visual con hoja de contactos y manifiesto editable; corregir es cambiar una línea y reimportar.
- [Build en frío más lento, quizá cerca del límite de 20 minutos de Cloudflare Pages] → medido: 7 min 58 s en 4 núcleos. Cloudflare Pages ofrece menos núcleos, así que el build en frío podría acercarse a los 20 minutos; si el primer despliegue se pasa, quitar el ancho de 1200 px o bajar el esfuerzo AVIF.
- [Calidad AVIF menor] → q50 con fuentes WebP q85; revisar visualmente tres fachadas con textura.
- [Bosque Golf dividido no es lo que quiere el cliente] → decisión reversible; las fichas se agrupan en una sola borrando carpetas y reimportando.
- [Lote 3 ausente] → marcado como pregunta abierta; no se importa un original sin mejorar.
- [Valores `Por confirmar` visibles] → sitio en `noindex`; listados en el README como pendientes antes de publicar.

## Open Questions

Preguntas para el cliente (no cambian specs ni tareas):

1. Ciudad y ubicación de todas las obras salvo los que da el nombre.
2. ¿Bosque Golf como cinco fichas o una? ¿Hay mejoradas de Lote 3?
3. Orden definitivo de las obras en la grilla y del carrusel.
4. Orden de las fotos dentro de cada obra y cuál es la portada.
5. ¿"Edificios" y "Comercial" son los rótulos que quiere, y el colegio va con edificios?

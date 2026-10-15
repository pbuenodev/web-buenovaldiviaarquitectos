# Design

## Context

- El pie (`src/components/Pie.astro`) muestra el botón `BotonWhatsApp` en variante `claro`, el número, los enlaces de texto a redes (desde `sitio.redes` en `src/config/site.ts`) y la marca `logo-marca-claro.svg` a 32 px de alto.
- `BotonWhatsApp.astro` es compartido con la ficha (`variante="oscuro"`, "Consultar por WhatsApp").
- La ficha (`src/pages/obras/[slug].astro`) apila las fotos en `.fotos` (flex en columna, `max-width: var(--ancho-fotos)` = 1160 px) y marca como `angosta` las verticales o de menos de 900 px (`esAngosta`), con `sizes` acorde. `Foto.astro` declara `width`/`height` del ancho mayor generado (nunca mayor que el origen).
- El sitio no debe pedir recursos a terceros (spec `estructura-sitio`). El único quiebre existente es 720 px; Astro 7 permite importar SVG como componente.
- Requisitos: ver `specs/contacto/spec.md` y `specs/ficha-obra/spec.md`.

## Goals / Non-Goals

**Goals:**
- Logos oficiales en SVG, versionados en el repositorio y renderizados en línea (sin solicitudes extra).
- Dos columnas en la ficha por encima de 1080 px sin tocar `Foto.astro` ni la lógica de catálogo.

**Non-Goals:**
- Cambiar la cabecera o su logo (el agrandado aplica solo a la marca del cierre del pie).
- Cambiar la grilla de obras del inicio, el carrusel o el número de columnas en teléfono.
- Agregar otras redes o reemplazar los textos de las redes por solo iconos.

## Decisions

### Fuentes de los logos
- Instagram: Instagram Brand Resources de Meta (`about.meta.com/brand/resources/instagram/`), glifo ("glyph") en SVG.
- Facebook: Facebook Brand Resources de Meta (`about.meta.com/brand/resources/facebook/logo/`), logo "f" en SVG.
- WhatsApp: WhatsApp Brand Resources (`whatsapp.com/brand` / recursos de marca de Meta), logo en SVG a color (burbuja verde `#25D366` con teléfono blanco).

Los paquetes suelen descargarse como ZIP tras aceptar las condiciones de uso. Se extrae solo el SVG necesario, se guarda en `src/assets/redes/` (`whatsapp.svg`, `instagram.svg`, `facebook.svg`) y se anota en un comentario o `README` breve la URL y la fecha de descarga. Se permite limpiar metadatos del SVG (ids, comentarios del editor) pero no modificar trazados ni proporciones.

*Alternativa descartada*: paquetes de iconos de terceros (Simple Icons, Font Awesome). No son la fuente oficial que pidió el cliente y algunos simplifican los trazados.

### Colores
- WhatsApp conserva sus colores originales en ambos botones: sobre el claro del pie el verde contrasta y llama la atención; sobre el azul de la ficha también se distingue.
- Instagram y Facebook se muestran monocromos en el claro del sitio (las guías de Meta permiten la versión de un solo color blanco/negro). Para ello los SVG se usan con `fill="currentColor"` (reemplazando solo el atributo de relleno del glifo monocromo oficial), heredando el color del enlace.

*Alternativa descartada*: Instagram con degradado a color en el pie. Rompe la paleta sobria del sitio y compite con el botón de WhatsApp, que es la acción principal.

### Renderizado
Importar cada SVG como componente de Astro y renderizarlo en línea con `aria-hidden="true"` y `focusable="false"`, de modo que el nombre accesible del enlace siga siendo su texto ("Escribir por WhatsApp", "Instagram", "Facebook") y no cambien las pruebas existentes por nombre. Tamaños: logo de WhatsApp 24 px dentro del botón con 12 px de separación; logos de redes 20 px con 10 px de separación. `BotonWhatsApp` incluye el logo siempre, sin nueva prop.

*Alternativa descartada*: `<img src>` hacia el SVG. Añade una solicitud por logo y no permite `currentColor`.

### Marca del pie
Cambiar `.cierre img` de `height: 32px` a `40px` y, desde 720 px, `48px`. `width: auto` mantiene las proporciones.

### Dos columnas en la ficha
Media query `(min-width: 1081px)` ("superior a 1080 px") escrita literal en `[slug].astro`, con un comentario, porque las propiedades personalizadas no sirven en media queries. Dentro:
- `.fotos` pasa a `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 64px 48px; align-items: start;` manteniendo `max-width: var(--ancho-fotos)`. El orden del DOM ya es el del catálogo, así que el flujo de la grilla da la lectura izquierda→derecha, arriba→abajo.
- `picture` (incluidas las `angosta`) ocupa `width: 100%`; la `img` usa `width: auto; max-width: 100%; margin-inline: auto` para no ampliarse más allá del ancho declarado (el de origen o 2000 px).
- Última foto sola: `picture:last-child:nth-child(odd)` con `grid-column: 1 / -1; justify-self: center; width: calc(50% - 24px)`.
- `sizes` de cada foto agrega `(min-width: 1081px) 556px` al inicio para no descargar archivos de 1160 px en columnas de ~556 px.

*Alternativa descartada*: disposición en mampostería (`columns: 2`). Ordena por columnas (de arriba abajo y luego a la derecha), lo que rompe el orden del catálogo al leer.

## Risks / Trade-offs

- [Los recursos de marca oficiales exigen aceptar condiciones o no permiten descarga automatizada] → Descargar manualmente o pedir al usuario el ZIP; no sustituir por fuentes no oficiales sin su aprobación.
- [Fotos verticales y horizontales mezcladas en una fila dejan alturas dispares] → `align-items: start` evita estirar o recortar; se acepta el espacio irregular a cambio de no recortar.
- [Guías de marca de Meta cambian con el tiempo] → Registrar URL y fecha de descarga junto a los SVG.
- [El verde de WhatsApp sobre el azul tiene bajo contraste relativo en bordes] → El texto del botón sigue cumpliendo 4,5:1; el logo es decorativo.

## Migration Plan

Cambio solo de presentación: se publica con el despliegue habitual en Cloudflare Pages; para revertir basta con revertir el commit.

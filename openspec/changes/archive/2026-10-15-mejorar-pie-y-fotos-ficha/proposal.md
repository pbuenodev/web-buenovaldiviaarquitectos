# Proposal

## Why

El pie de contacto hoy es solo texto: el botón de WhatsApp no se distingue como tal y las redes sociales son palabras subrayadas, por lo que la invitación a contactar pasa desapercibida; además, la marca del cierre se ve pequeña (32 px de alto). En la ficha de cada obra (`/obras/<slug>/`), las fotografías se apilan en una sola columna también en pantallas grandes, lo que obliga a desplazarse mucho para recorrerlas.

## What Changes

- Descargar desde las fuentes oficiales de cada marca (recursos de marca de Meta para Instagram y Facebook, y de WhatsApp) los logos en formato SVG y guardarlos en el proyecto, servidos desde el propio sitio.
- Los enlaces a Instagram y Facebook del pie muestran el logo oficial de cada red junto a su nombre.
- El botón "Escribir por WhatsApp" incluye el logo original de WhatsApp para llamar más la atención. Como el botón es un componente compartido, el botón "Consultar por WhatsApp" de la ficha también lo incluye.
- La marca de Bueno Valdivia Arquitectos en el cierre del pie se agranda moderadamente.
- En la ficha de una obra, cuando la pantalla mide más de 1080 px de ancho, las fotografías se distribuyen en 2 columnas, en el orden del catálogo (de izquierda a derecha y de arriba abajo), sin recortes. Bajo ese ancho se mantiene la columna única actual.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `contacto`: el botón de WhatsApp pasa a llevar el logo oficial de WhatsApp; los enlaces a redes muestran el logo oficial de cada red junto al nombre; la marca del pie se muestra más grande.
- `ficha-obra`: las fotografías pasan de columna única siempre a 2 columnas en pantallas de más de 1080 px; la regla de fotografías angostas se ajusta a esa disposición.

## Impact

- Código: `src/components/Pie.astro`, `src/components/BotonWhatsApp.astro`, `src/pages/obras/[slug].astro`.
- Recursos nuevos: logos SVG oficiales en `src/assets/` (p. ej. `src/assets/redes/`).
- Pruebas: `tests/e2e/humo.spec.ts` (pie y ficha en escritorio de 1440 px pasa a ver 2 columnas).
- Sin dependencias nuevas ni solicitudes a dominios de terceros: los SVG se sirven desde el sitio.

# Tasks

## 1. Logos oficiales

- [x] 1.1 Descargar desde los recursos de marca oficiales de Meta/WhatsApp los SVG de WhatsApp (a color), Instagram (glifo) y Facebook ("f"); si la descarga exige aceptar condiciones manualmente, pedir al usuario el ZIP en vez de usar otra fuente. Verificar que cada archivo es un SVG válido abriéndolo en el navegador.
- [x] 1.2 Guardar `whatsapp.svg`, `instagram.svg` y `facebook.svg` en `src/assets/redes/`, limpiando solo metadatos del editor; en Instagram y Facebook usar `fill="currentColor"` en el glifo monocromo. Anotar en `src/assets/redes/FUENTES.md` la URL oficial y la fecha de descarga de cada uno. Verificar con `pnpm check` que los SVG se importan sin errores.

## 2. Botón de WhatsApp con logo

- [x] 2.1 En `src/components/BotonWhatsApp.astro`, renderizar en línea el logo de WhatsApp (24 px, `aria-hidden="true"`, `focusable="false"`) a la izquierda del texto con 12 px de separación, en ambas variantes. Verificar visualmente el pie (variante `claro`) y la ficha (variante `oscuro`) con `pnpm dev`.
- [x] 2.2 En `tests/e2e/humo.spec.ts`, comprobar que los botones "Escribir por WhatsApp" (pie) y "Consultar por WhatsApp" (ficha) contienen un `svg` con `aria-hidden="true"` y que siguen encontrándose por su nombre accesible. Verificar con `pnpm build && pnpm test:e2e`.

## 3. Redes y marca del pie

- [x] 3.1 En `src/components/Pie.astro`, mostrar en cada enlace de red el logo correspondiente (20 px, `aria-hidden`, color heredado) junto al nombre, con 10 px de separación; una red sin URL no muestra ni enlace ni logo. Verificar que la red sin URL desaparece dejando temporalmente vacía su `url` en `src/config/site.ts` y revirtiendo después.
- [x] 3.2 Cambiar la altura de la marca del cierre (`.cierre img`) a 40 px y a 48 px desde 720 px. Verificar en el navegador a 390 px y 1440 px.
- [x] 3.3 Ampliar la prueba del pie en `tests/e2e/humo.spec.ts`: cada enlace de red contiene un `svg` decorativo y la marca del cierre mide 40 px (teléfono) o 48 px (escritorio) de alto, sin desborde horizontal. Verificar con `pnpm test:e2e`.

## 4. Dos columnas en la ficha

- [x] 4.1 En `src/pages/obras/[slug].astro`, añadir la media query `(min-width: 1081px)` con un comentario: `.fotos` en grilla de 2 columnas (`gap: 64px 48px`, `align-items: start`), `picture` (también `.angosta`) a `width: 100%`, `img` a `width: auto; max-width: 100%; margin-inline: auto`, y la última foto de una cantidad impar centrada en su fila con el ancho de una columna. Verificar en el navegador a 1080 px (una columna) y 1440 px (dos columnas).
- [x] 4.2 Anteponer `(min-width: 1081px) 556px` al atributo `sizes` de las fotos de la ficha. Verificar en las herramientas de red a 1440 px que no se descarga el ancho de 1600/2000 px para fotos en columna.
- [x] 4.3 En `tests/e2e/humo.spec.ts`, comprobar en escritorio (1440 px) que la 1.ª y 2.ª foto de "Casas Chicureo" comparten fila (misma `y`, distinta `x`) y en teléfono que la 2.ª está debajo de la 1.ª; si alguna obra tiene un número impar de fotos, comprobar que su última foto queda centrada. Mantener `sinDesbordeHorizontal`. Verificar con `pnpm test:e2e`.

## 5. Integración

- [x] 5.1 Ejecutar `pnpm verificar` y confirmar que pasan comprobación de tipos, pruebas unitarias, construcción, verificación de imágenes y pruebas e2e en teléfono y escritorio, y que en la pestaña de red no hay solicitudes a dominios de terceros.

# Tasks

Rutas de origen usadas en las tareas:

- Diseño: `~/Proyectos/Referencias-PabloBueno/html/Bueno Valdivia Arquitectos portafolio/`
- Fotos y logo: `~/Proyectos/Referencias-PabloBueno/fotografias/`

## 1. Proyecto base

- [x] 1.1 Instalar pnpm con `npm install -g pnpm` y verificar que `pnpm -v` responde
- [x] 1.2 Crear el proyecto Astro en la raíz del repositorio (plantilla mínima, TypeScript estricto, salida estática) sin sobrescribir `openspec/`, `.claude/`, `.opencode/` ni `README.md`; fijar `packageManager` en `package.json` y verificar que `pnpm install` y `pnpm build` terminan sin errores
- [x] 1.3 Añadir `.gitignore` (`node_modules/`, `dist/`, `.astro/`, resultados de Playwright, `.env`) y verificar con `git status` que no aparecen archivos generados
- [x] 1.4 Configurar `astro.config.mjs` con `site` tomado de `SITE_URL` (valor local por defecto) y barra final en las URLs; verificar que `pnpm build` genera `dist/index.html`
- [x] 1.5 Definir los scripts `dev`, `build`, `preview`, `check`, `test`, `test:e2e` y `verificar` en `package.json`, instalar `@astrojs/check`, Vitest y Playwright, y verificar que `pnpm check` y `pnpm test` se ejecutan (aunque aún sin pruebas)

## 2. Sistema visual y estructura común

- [x] 2.1 Crear `src/styles/tokens.css` y `src/styles/base.css` con los colores, tamaños, espaciados y el quiebre de 720 px del prototipo (design.md, decisión 9); verificar en `pnpm dev` que el fondo y el color de texto coinciden con el prototipo
- [x] 2.2 Instalar `@fontsource-variable/archivo`, cargar la variante con eje de ancho y precargar el archivo latino; verificar en el navegador que un título con `font-stretch: 72%` se ve condensado y que no hay solicitudes a `fonts.googleapis.com` (si el paquete no trae el eje, aplicar la alternativa de la decisión 10)
- [x] 2.3 Copiar a `src/assets/logo/` las tres variantes del logo del diseño y el SVG original, optimizarlas con SVGO y crear `public/favicon.svg` a partir de la marca; verificar que se ven igual que antes de optimizar y que cada archivo pesa menos que el original
- [x] 2.4 Crear `src/config/site.ts` (nombre, WhatsApp, mensajes, redes, con los valores provisionales del prototipo) y `src/lib/whatsapp.ts`; añadir pruebas unitarias de dígitos, codificación del mensaje y mensaje por obra, y verificar que `pnpm test` pasa
- [x] 2.5 Crear `Cabecera.astro` (logo claro enlazado al inicio, enlace "Contacto" a `#contacto`) con las medidas de teléfono y escritorio del prototipo; verificar ambas en 390 px y 1440 px
- [x] 2.6 Crear `BotonWhatsApp.astro` y `Pie.astro` (sección `#contacto` completa según la spec `contacto`, redes sin dirección ocultas); verificar que el botón abre `wa.me` con el número y el mensaje general, y que los enlaces abren en pestaña nueva
- [x] 2.7 Crear `Base.astro` con `<html lang="es">`, título, descripción, etiquetas Open Graph con dirección absoluta, `noindex` según `PUBLIC_INDEXABLE`, cabecera y pie, y desplazamiento suave desactivado con movimiento reducido; crear `src/pages/robots.txt.ts`; verificar en el HTML generado que las etiquetas están presentes y que `robots.txt` bloquea todo por defecto

## 3. Catálogo de obras

- [x] 3.1 Contrastar con la documentación vigente de Astro la definición de colecciones con cargador de archivos y el uso de `import.meta.glob` para imágenes, y anotar en `design.md` cualquier diferencia con la decisión 3 antes de escribir el esquema
- [x] 3.2 Crear `src/content.config.ts` con la colección `obras` y el esquema de la decisión 3; verificar que un `index.yaml` con una categoría inválida o sin `nombre` hace fallar `pnpm build` con un mensaje que nombra la obra
- [x] 3.3 Copiar las 60 fotografías a `src/content/obras/<slug>/` según la tabla de la decisión 4, renombradas a minúsculas con guion; verificar que hay 6 carpetas con 10 archivos cada una
- [x] 3.4 Escribir los 6 `index.yaml` con nombre, ciudad, ubicación, categoría, orden y carrusel de la decisión 4; verificar que `pnpm build` valida la colección sin errores
- [x] 3.5 Crear `src/lib/obras.ts` (lista ordenada, fotos de una obra por nombre de archivo, portada, obra siguiente con vuelta al inicio, láminas del carrusel, regla de foto angosta, y errores de build para obra sin fotos, archivo inexistente y carrusel vacío); añadir pruebas unitarias de cada consulta y cada error, y verificar que `pnpm test` pasa
- [x] 3.6 Documentar en `README.md` cómo agregar una obra (carpeta, campos de `index.yaml`, nombres de archivo y orden de las fotos); verificar el procedimiento agregando y quitando una obra de prueba sin tocar otros archivos

## 4. Imágenes

- [x] 4.1 Crear `Foto.astro` sobre `<Picture>` con AVIF y WebP, anchos candidatos limitados al ancho de origen, dimensiones reales, carga diferida por defecto y `alt` obligatorio; verificar en el HTML generado un `<picture>` con ambas fuentes, `srcset`, `width` y `height`
- [x] 4.2 Crear `scripts/verificar-imagenes.mjs`, que falla si alguna AVIF de `dist/` supera los 300 KB, e incluirlo en `pnpm verificar`; ajustar la calidad en `Foto.astro` hasta que pase con las 60 fotos y verificar que el script falla al bajar el límite a propósito
- [x] 4.3 Generar con `getImage()` la imagen para compartir (JPEG de 1200 × 630 desde la portada) y conectarla a `Base.astro`; verificar en `dist/` que el archivo existe con ese tamaño y que la etiqueta `og:image` lo referencia con dirección absoluta

## 5. Página de inicio

- [x] 5.1 Crear `Carrusel.astro` con las láminas apiladas, degradado inferior, nombre y ubicación enlazados a la ficha, contador y botones, con la primera imagen prioritaria y las demás diferidas en atributos `data-`; verificar con JavaScript desactivado que se ve la primera lámina y su enlace funciona
- [x] 5.2 Crear `src/scripts/carrusel.ts` (avance cada 6 s, fundido y acercamiento por CSS, botones, deslizamiento de 40 px, reinicio del temporizador, pausa con pestaña oculta, movimiento reducido, carga anticipada de la lámina siguiente, anuncio en cambios manuales); verificar en el navegador cada escenario de la spec `pagina-inicio` y, en la pestaña de red, que al abrir no se descargan las seis fotografías
- [x] 5.3 Crear `TarjetaObra.astro` y `GrillaObras.astro` (portada 4:3, nombre y ciudad, 3 columnas en escritorio y 2 en teléfono, `data-categoria`); verificar las 6 obras en el orden del catálogo en 390 px y 1440 px
- [x] 5.4 Crear `Filtros.astro` y `src/scripts/filtros.ts` (botones con `aria-pressed`, alternancia de `hidden`, sin mover el desplazamiento); verificar que "Casas" deja 2 obras, "Edificios públicos" deja 4 y "Todas" las 6
- [x] 5.5 Componer `src/pages/index.astro` con carrusel, filtros y grilla, y comparar con el prototipo abierto en el navegador en 390 px y 1440 px; verificar que medidas, colores y tiempos coinciden

## 6. Ficha de obra y página 404

- [x] 6.1 Crear `src/pages/obras/[slug].astro` con rutas estáticas para todas las obras, enlace "← Obras", título y ubicación; verificar que `dist/obras/` contiene una carpeta por obra y que `/obras/casa-la-quebrada/` abre directamente
- [x] 6.2 Mostrar las fotografías apiladas con `Foto.astro`, aplicando la clase de foto angosta decidida en el build; verificar que se ven las 10 fotos de cada obra y, con una imagen de prueba de 800 px y otra vertical, que se muestran angostas y centradas (retirar las imágenes de prueba después)
- [x] 6.3 Crear `SiguienteObra.astro` (miniatura de portada y nombre) y el botón "Consultar por WhatsApp" con el mensaje de la obra; verificar que la última obra enlaza a la primera y que el mensaje nombra la obra correcta
- [x] 6.4 Crear `src/pages/404.astro` con cabecera, pie, mensaje breve y enlace a las obras; verificar en `pnpm preview` que una dirección inexistente y un slug inexistente bajo `/obras/` la muestran
- [x] 6.5 Comparar la ficha con el prototipo en 390 px y 1440 px; verificar que separaciones, tamaños de título y pie de ficha coinciden

## 7. Verificación integral

- [x] 7.1 Escribir `tests/e2e/humo.spec.ts` para 390 px y 1440 px: carrusel (siguiente, anterior, contador), filtros, navegación inicio → ficha → siguiente obra, enlaces de WhatsApp del pie y de la ficha, 404, ausencia de solicitudes a dominios de terceros y ausencia de desplazamiento horizontal; verificar que `pnpm test:e2e` pasa
- [x] 7.2 Recorrer inicio y ficha solo con teclado y medir el contraste del texto pequeño sobre fondo claro y azul; verificar foco visible en todos los controles, áreas pulsables de al menos 44 px y contraste de 4,5:1 o más
- [x] 7.3 Ejecutar `pnpm verificar` completo (`check`, pruebas unitarias, `build`, control de peso de imágenes y prueba de humo) y verificar que termina sin errores ni advertencias
- [x] 7.4 Completar `README.md` con requisitos, comandos, estructura del repositorio, variables `SITE_URL` y `PUBLIC_INDEXABLE` y la lista de datos provisionales por reemplazar (fotos, nombres de obras, WhatsApp, redes); verificar que los comandos documentados funcionan tal como están escritos
- [x] 7.5 Ejecutar `openspec validate sitio-portafolio --strict` y verificar que pasa

## Workflow follow-up

- Abrir el pull request de `develop` a `main` cuando la revisión interna esté conforme.
- Archivar el cambio una vez fusionado.
- Continuar con el cambio de CI/CD y despliegue en Cloudflare Pages (PB-009).
- Anotar la decisión de stack en el ticket PB-007 del tablero.

# Design

## Context

Motivación y alcance: ver `proposal.md`. Requisitos: ver `specs/`.

Estado actual y restricciones que condicionan el enfoque:

- El repositorio no tiene código: solo `openspec/`, la configuración de los agentes y un `README.md` de una línea. Se trabaja en `develop`; `main` está protegida.
- El diseño de origen (`Sitio 1c.dc.html`) es un prototipo de Claude Design: un componente con estado, ruteo por hash, estilos en línea y un único quiebre adaptable a 720 px calculado con JavaScript. Sirve como referencia visual exacta (medidas, colores, tiempos), no como base de código.
- Recursos disponibles: 60 fotografías WebP de 1448 × 1086 px (4:3, ~1,8 MB cada una) en 6 carpetas, el logo original en SVG y tres variantes del logo ya derivadas por el diseño (`logo-claro`, `logo-marca-claro`, `logo-azul`, ~78 KB cada una, con el texto convertido a trazados).
- Del tablero del proyecto: sin CMS (el equipo mantiene el contenido), ~15 obras con 5–10 fotos cuando lleguen las reales, sin SEO, visitantes que llegan por un enlace de WhatsApp y abren en el teléfono, hosting previsto en Cloudflare Pages a nombre del cliente, y algunas fotos de los años 90 de baja resolución.
- Entorno local: Node 26.4, sin pnpm instalado y sin corepack (ya no viene con Node).

## Goals / Non-Goals

**Goals:**

- Reproducir fielmente el diseño `Sitio 1c` en teléfono y escritorio.
- Que agregar o reemplazar una obra sea añadir una carpeta, sin tocar componentes.
- Que el peso de las fotos no dependa de la disciplina de quien las sube: la optimización ocurre en el build.
- Enviar al navegador el mínimo JavaScript posible.
- Dejar el proyecto listo para que el cambio de CI/CD solo tenga que ejecutar comandos ya existentes (`build`, `check`, `test`).

**Non-Goals:**

- Despliegue, CI y dominio.
- Un sistema de diseño genérico o reutilizable más allá de este sitio.
- Transiciones animadas entre páginas, modo oscuro alternativo o internacionalización.
- Decidir la curaduría final de fotos y portadas (PB-017).

## Decisions

### 1. Astro en modo estático

Astro (versión estable vigente, 7.x) con salida estática y TypeScript estricto.

- **Por qué**: el sitio es contenido con dos piezas interactivas. Astro genera HTML sin runtime de framework, trae optimización de imágenes y colecciones de contenido tipadas, y despliega en Cloudflare Pages sin adaptador.
- **Alternativas**: Next.js exige React y aporta un runtime que aquí no se usa. Eleventy resuelve el HTML pero obliga a montar aparte el tipado del contenido y el pipeline de imágenes. HTML a mano no escala a 15 obras y 150 fotos.

### 2. Estructura del repositorio

```
web-buenovaldiviaarquitectos/
+-- openspec/
+-- public/                    favicon.svg
+-- scripts/
|   +-- verificar-imagenes.mjs    limite de peso de las AVIF generadas
+-- src/
|   +-- assets/
|   |   +-- logo/              logo-claro.svg, logo-marca-claro.svg,
|   |                          logo-azul.svg, original.svg
|   +-- content/
|   |   +-- obras/
|   |       +-- casa-la-quebrada/
|   |       |   +-- index.yaml
|   |       |   +-- exterior-01.webp ... interior-05.webp
|   |       +-- ... (una carpeta por obra)
|   +-- content.config.ts      esquema de la coleccion "obras"
|   +-- config/
|   |   +-- site.ts            nombre, WhatsApp, mensajes, redes
|   +-- lib/
|   |   +-- catalogo.ts        reglas: orden, portada, siguiente,
|   |   |                      laminas del carrusel, foto angosta
|   |   +-- obras.ts           une la coleccion con las fotos de cada carpeta
|   |   +-- whatsapp.ts        construccion de enlaces wa.me
|   +-- styles/
|   |   +-- tokens.css         colores, tipografia, espacios, quiebre
|   |   +-- base.css           reset y estilos globales
|   +-- layouts/
|   |   +-- Base.astro         <head>, metadatos, cabecera, pie
|   +-- components/
|   |   +-- Cabecera.astro
|   |   +-- Carrusel.astro
|   |   +-- Filtros.astro
|   |   +-- GrillaObras.astro
|   |   +-- TarjetaObra.astro
|   |   +-- Foto.astro         <picture> AVIF + WebP con srcset
|   |   +-- SiguienteObra.astro
|   |   +-- BotonWhatsApp.astro
|   |   +-- Pie.astro
|   +-- scripts/
|   |   +-- carrusel.ts
|   |   +-- filtros.ts
|   +-- pages/
|       +-- index.astro
|       +-- obras/[slug].astro
|       +-- 404.astro
|       +-- robots.txt.ts
+-- tests/
|   +-- unit/                  whatsapp, catalogo
|   +-- e2e/                   humo.spec.ts
+-- astro.config.mjs
+-- playwright.config.ts
+-- vitest.config.ts
+-- tsconfig.json
+-- package.json
+-- pnpm-lock.yaml
+-- .gitignore
+-- README.md
```

Nombres de archivos, componentes y campos en español, igual que los artefactos del proyecto.

### 3. Una carpeta por obra, con datos y fotos juntos

Cada obra vive en `src/content/obras/<slug>/` con un `index.yaml` y sus fotos al lado. La colección se carga con el cargador de archivos de Astro apuntando a `*/index.yaml`, y el identificador de cada entrada es el nombre de la carpeta, que además es el slug de la URL (así los slugs no pueden repetirse).

Esquema de `index.yaml`:

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `nombre` | texto | sí | |
| `ciudad` | texto | sí | se muestra en la grilla |
| `ubicacion` | texto | sí | se muestra en carrusel y ficha |
| `categoria` | `casas` \| `edificios` | sí | |
| `orden` | entero | sí | orden en grilla y "siguiente obra" |
| `portada` | nombre de archivo | no | por defecto, la primera foto |
| `carrusel.foto` | nombre de archivo | no | si falta `carrusel`, la obra no entra |
| `carrusel.orden` | entero | con `carrusel` | posición de la lámina |

Las fotos no se listan en el YAML: `lib/obras.ts` las descubre con `import.meta.glob` sobre la carpeta de la obra. El orden y las validaciones que cruzan datos y archivos (obra sin fotos, `portada` o `carrusel.foto` inexistentes, carrusel vacío) están en `lib/catalogo.ts`, que no depende de Astro para poder probarse con Vitest, y lanzan un error que detiene el build.

Contrastado con Astro 7.3: el cargador `glob` de `astro/loaders` admite YAML y `generateId`, y el esquema se define con `astro/zod` en `src/content.config.ts`, tal como se planteó.

- **Por qué**: "agregar una obra = agregar una carpeta" es el flujo real del equipo cuando lleguen las fotos por Drive. No listar las fotos evita mantener a mano una lista que siempre coincide con el contenido de la carpeta; reordenar es renombrar archivos.
- **Alternativas**: datos en `src/content/` y fotos en `src/assets/` (dos lugares que mantener sincronizados); lista explícita de fotos en el YAML (más control, más trabajo por obra; se puede añadir después como campo opcional sin romper nada); Markdown con frontmatter (no hay cuerpo de texto que justificarlo).

### 4. Obras iniciales

Los datos salen del prototipo; la correspondencia con las carpetas de fotos se identificó comparando las portadas.

| orden | slug | categoría | carpeta de origen | carrusel (orden · foto) |
|---|---|---|---|---|
| 1 | `casas-chicureo` | casas | `02_Conjunto_viviendas` | 3 · `exterior-01` |
| 2 | `casa-la-quebrada` | casas | `05_Casa_verde` | 1 · `exterior-03` |
| 3 | `centro-portuario` | edificios | `01_Edificio_hormigon` | 5 · `exterior-03` |
| 4 | `edificio-estacion` | edificios | `03_Edificio_vias` | 6 · `exterior-01` |
| 5 | `edificio-panamericana` | edificios | `04_Panamericana_frente` | 4 · `exterior-02` |
| 6 | `edificio-los-leones` | edificios | `06_Panamericana_lateral` | 2 · `exterior-01` |

Los archivos se copian renombrados a minúsculas con guion (`Exterior_01.webp` → `exterior-01.webp`). Con ese nombre, el orden alfabético deja las exteriores antes que las interiores, que es el orden del prototipo. El prototipo usa 37 fotos; aquí entran las 60.

### 5. Imágenes: un componente `Foto` sobre el servicio de imágenes de Astro

Un único componente `Foto.astro` usa `getImage()` de `astro:assets` y fija para todo el sitio: formatos `avif` y `webp`, anchos candidatos `[480, 800, 1200, 1600, 2000]` limitados al ancho de origen (con las fotos actuales: 480, 800, 1200 y 1448), `width`/`height` reales, `loading="lazy"` y `decoding="async"` por defecto. Cada uso pasa su propio `sizes`:

| Uso | `sizes` |
|---|---|
| Carrusel | `(max-aspect-ratio: 4/3) 104vh, 100vw` (en pantallas verticales la foto se recorta por los lados y se ve más ancha que la pantalla) |
| Tarjeta de la grilla | `(min-width: 720px) 33vw, 50vw` |
| Foto de ficha | `(min-width: 1256px) 1160px, 100vw` |
| Foto angosta de ficha | `(min-width: 720px) 680px, 78vw` |
| Miniatura "siguiente obra" | `120px` |

- **Calidad**: AVIF en torno a 55 y WebP en torno a 72, ajustables tras medir. `scripts/verificar-imagenes.mjs` recorre `dist/` tras el build y falla si alguna AVIF supera los 300 KB.
- **Foto angosta**: se decide en el build con las dimensiones del archivo (`alto > ancho` o `ancho < 900`) y se aplica una clase. El prototipo lo hacía en el navegador al cargar cada imagen, lo que provoca un salto.
- **Imagen para compartir**: `getImage()` genera un JPEG de 1200 × 630 recortado desde la portada; WhatsApp no muestra de forma fiable AVIF ni WebP en sus tarjetas.
- **Por qué**: las fotos son el 99 % del peso. Centralizar la política en un componente impide que una página nueva se salte la optimización.
- **Por qué `getImage()` y no `<Picture>`**: `<Picture>` aplica una sola calidad a todos los formatos, y AVIF y WebP necesitan valores distintos para pesar poco sin perder detalle. Además permite dejar las fuentes en atributos `data-` para las láminas aplazadas del carrusel.
- **Originales fuera de `dist/`**: Astro publica el archivo original de cualquier imagen cuyas propiedades se lean fuera de su servicio de imágenes, y aquí se leen las medidas. `lib/obras.ts` trabaja sobre una copia sin rastreo de cada imagen para que solo se publiquen las versiones optimizadas (`dist/` baja de 150 MB a 42 MB).
- **Alternativa**: pre-generar variantes con un script propio y servirlas desde `public/`. Da más control pero duplica lo que Astro ya hace y pierde el tipado de dimensiones.

### 6. Carrusel con marcado estático y un script pequeño

Las láminas se generan en el servidor, apiladas en la misma celda. Solo la primera lleva la imagen cargada (`loading="eager"`, `fetchpriority="high"`); las demás llevan sus fuentes en atributos `data-` y el script las activa una lámina antes de su turno, de modo que al abrir el inicio no se descargan las seis.

El script (`carrusel.ts`) maneja: índice actual, temporizador de 6 s, botones, gesto táctil con umbral de 40 px, pausa con `visibilitychange` y `prefers-reduced-motion`. El fundido (1,8 s) y el acercamiento (escala 1 → 1,05 en 8 s) son transiciones CSS activadas por un atributo en la lámina visible. El título, la ubicación y el enlace de cada lámina están en el HTML; el script solo cambia cuál se ve. Los cambios de lámina se anuncian mediante una región `aria-live="polite"` únicamente cuando el cambio es manual.

- **Por qué**: sin dependencias, funciona sin JavaScript (se ve la primera lámina) y pesa menos de 2 KB.
- **Alternativas**: Swiper o Embla (decenas de KB para un fundido entre seis fotos); un componente React/Preact como isla (añade runtime sin beneficio).

### 7. Filtros en el cliente sobre la grilla completa

La grilla se entrega con todas las obras y cada tarjeta lleva `data-categoria`. Los filtros son botones con `aria-pressed`; `filtros.ts` alterna el atributo `hidden` de las tarjetas. No se cambia la URL. Los botones miden 44 px de alto para el dedo (en el prototipo, 36 px); los márgenes de alrededor se redujeron en la misma medida para que la composición no cambie. Lo mismo se hizo con el enlace "← Obras" de la ficha.

Los controles que sin JavaScript no hacen nada (filtros y botones del carrusel) se ocultan con `visibility: hidden` hasta que un script en línea marca `<html class="con-scripts">`, de modo que no hay saltos al cargar.

- **Por qué**: con ~15 obras no hay nada que paginar ni que pedir al servidor, y sin JavaScript se ven todas.
- **Alternativa**: páginas separadas `/casas/` y `/edificios-publicos/`. Darían URLs compartibles por categoría y encajarían con un futuro menú de categorías en la cabecera, pero el diseño elegido las trata como filtro de una misma vista. Si el cliente pide el menú, se añade entonces.

### 8. Contacto como ancla del pie

El enlace de la cabecera apunta a `#contacto` en la página actual; el desplazamiento suave se resuelve con CSS (`scroll-behavior`, desactivado con movimiento reducido). En el prototipo `#/contacto` llevaba siempre al inicio; aquí la persona no pierde la ficha que está viendo.

`config/site.ts` exporta el número, los dos mensajes (general y por obra, este con el nombre interpolado) y las redes. `lib/whatsapp.ts` construye `https://wa.me/<dígitos>?text=<mensaje codificado>`. Los valores iniciales son los del prototipo (`+56 9 0000 0000`, Instagram y Facebook genéricos) y quedan marcados como provisionales.

### 9. Estilos: CSS propio con tokens

`tokens.css` define como propiedades personalizadas los valores del prototipo: colores (`#0d1828`, `#f4f3ef`, `#eef0f3`, `#5f6a7a`, `#a3adbc`, `#d5dae2`, `#e6e4df`), tamaño base de 13 px, espaciado de letra `.16em` para rótulos, y títulos con `clamp()` y `font-stretch: 72%`. Los estilos de cada componente van en su bloque `<style>` con alcance local. El quiebre de 720 px pasa de JavaScript a consultas de medios.

- **Por qué**: el sistema visual cabe en una pantalla; un framework de utilidades añadiría configuración y una dependencia para ahorrar muy poco.
- **Alternativa**: Tailwind. Razonable si el sitio creciera en variedad de pantallas; hoy no.

### 10. Tipografía autoalojada

Archivo variable con los ejes de peso y ancho, desde el paquete `@fontsource-variable/archivo` (hoja con eje `wdth`), solo el subconjunto latino, con `font-display: swap` y precarga del archivo principal.

- **Por qué**: los títulos condensados dependen del eje de ancho, que es la seña visual del diseño. Autoalojar evita la solicitud a Google Fonts que hace el prototipo y cumple el requisito de no depender de terceros.
- **A verificar al implementar**: que la versión instalada del paquete exponga el eje `wdth` en el rango 62–125. Si no, se descarga el archivo variable de Archivo y se declara con `@font-face` propio.

### 11. Logos

Se copian las tres variantes del diseño, optimizadas con SVGO (de ~78 KB a ~10 KB cada una, sin diferencia visible), y el SVG original sin modificar, como fuente, a `src/assets/logo/`. La cabecera usa `logo-claro`, el pie `logo-marca-claro` y el favicon es la marca clara sobre un cuadrado azul de esquinas redondeadas, para que se distinga en pestañas claras y oscuras. `logo-azul` se conserva para usos sobre fondo claro (página 404 o imagen para compartir) aunque el diseño actual no lo coloque en ninguna vista.

### 12. Metadatos e indexación

`Base.astro` recibe `titulo`, `descripcion` e `imagen` y emite `<html lang="es">`, título, descripción y etiquetas Open Graph con direcciones absolutas. La dirección base sale de la variable de entorno `SITE_URL` (con un valor local por defecto) y la indexación de `PUBLIC_INDEXABLE` (`false` por defecto): con ella en falso se emite `<meta name="robots" content="noindex">` y `robots.txt` bloquea todo. No se genera sitemap.

### 13. Herramientas y verificación

- **pnpm** con la versión fijada en `packageManager`. Se instala con `npm install -g pnpm` porque Node 26 no trae corepack.
- **TypeScript 6**: `@astrojs/check` todavía no admite TypeScript 7.
- **Scripts**: `dev`, `build`, `preview`, `check` (`astro check`), `test` (Vitest, unitarias), `test:e2e` (Playwright sobre `preview`) y `verificar` (los encadena junto con el control de peso de imágenes). El cambio de CI solo tendrá que ejecutar `pnpm verificar`.
- **Pruebas unitarias**: enlaces de WhatsApp (dígitos, codificación, mensaje por obra) y consultas de obras (orden, siguiente con vuelta al inicio, láminas del carrusel, regla de foto angosta).
- **Prueba de humo en navegador**: en 390 px y 1440 px, cubre carrusel, filtros, navegación a ficha, siguiente obra, enlaces de WhatsApp, 404, ausencia de solicitudes a terceros y ausencia de desplazamiento horizontal.
- **Por qué este nivel**: es un sitio pequeño; las pruebas cubren la lógica que puede romperse en silencio al cambiar contenido, no la apariencia. La fidelidad visual se revisa comparando con el prototipo.

## Risks / Trade-offs

- **[Fotos provisionales en el historial de git]** → ~110 MB que seguirán en el historial tras reemplazarlas. Se acepta por simplicidad (el hosting construye desde el repositorio). Si molesta al entregar, se puede reescribir el historial antes del traspaso al cliente o mover las fotos a Git LFS.
- **[Tiempo de build por las imágenes]** → 60 fotos × 2 formatos × hasta 4 anchos ≈ 480 archivos, y AVIF es lento de codificar. Astro guarda en caché las imágenes ya procesadas; el cambio de CI deberá conservar esa caché. Con 150 fotos el primer build puede tardar varios minutos.
- **[Peso de las AVIF]** → fotos muy detalladas pueden superar los 300 KB con la calidad inicial. El script de verificación lo detecta y la calidad se ajusta en un único lugar (`Foto.astro`).
- **[API de Astro 7]** → los detalles del cargador de colecciones y de `<Picture>` pueden diferir de versiones anteriores. La primera tarea de contenido los contrasta con la documentación vigente antes de escribir el esquema.
- **[Eje de ancho de la fuente]** → si el paquete no lo trae, los títulos se verían anchos. Mitigación descrita en la decisión 10.
- **[Categorías en el menú]** → el hito H1 las pide en la cabecera y el diseño las pone como filtros. Si el cliente lo objeta, el cambio es acotado (añadir enlaces a la cabecera y, opcionalmente, páginas por categoría); no afecta al modelo de contenido.
- **[Datos de relleno publicados]** → el número `+56 9 0000 0000` y los nombres de obra inventados no deben llegar a producción. Mitigación: `noindex` por defecto y una nota en el README con la lista de datos provisionales a reemplazar.
- **[Carrusel automático y accesibilidad]** → el contenido que se mueve solo exige un modo de detenerlo. Se cubre con la pausa por movimiento reducido y porque cualquier interacción reinicia la cuenta; no se añade un botón de pausa porque el diseño no lo contempla. Queda como posible ajuste tras las pruebas del hito H3.

## Open Questions

- Número de WhatsApp real y direcciones de Instagram y Facebook (se cambian en `config/site.ts`).
- Nombres y ubicaciones definitivos de las obras, y qué foto es la portada de cada una (PB-002, PB-017).
- Dirección pública del ambiente de prueba, necesaria para que la tarjeta de WhatsApp funcione fuera de local (llega con el cambio de CI/CD).

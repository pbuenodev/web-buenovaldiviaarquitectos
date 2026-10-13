# Proposal

## Why

El repositorio solo contiene OpenSpec y un README: no existe todavía ningún sitio. El equipo ya eligió una dirección de diseño (prototipo `Sitio 1c` hecho en Claude Design) y hay un compromiso con el cliente de mostrar una maqueta navegable cerca del 18 de octubre de 2026 (hito H1). Este cambio convierte ese prototipo, que es una sola página con ruteo por hash y estilos en línea, en un sitio de producción mantenible al que se puedan sumar las ~15 obras reales sin tocar componentes.

## What Changes

- Se crea el proyecto web desde cero: sitio estático generado con Astro y TypeScript estricto, con pnpm como gestor de paquetes.
- Se define el catálogo de obras como contenido tipado y validado: cada obra es una carpeta con sus datos (nombre, ciudad, ubicación, categoría, orden) y sus fotos.
- Página de inicio con carrusel de fotos a gran formato (fundido y zoom lento, avance automático, flechas, gesto de deslizar), filtros por categoría (Todas / Casas / Edificios públicos) y grilla de obras.
- Ficha de obra con URL propia (`/obras/<slug>/`): título, ubicación, fotos apiladas, enlace a la siguiente obra y botón de WhatsApp con mensaje que nombra la obra.
- Contacto en el pie de todas las páginas: botón de WhatsApp, número visible, Instagram y Facebook. Sin formulario ni página aparte.
- Optimización de imágenes en el build: AVIF con respaldo WebP, varios anchos, dimensiones declaradas y carga diferida.
- Estructura común: cabecera con logo y enlace a Contacto, sistema visual del diseño (azul `#0d1828`, fondo `#f4f3ef`, tipografía Archivo condensada), página 404, metadatos para la vista previa del enlace en WhatsApp y exclusión de buscadores mientras el sitio esté en prueba.
- Se cargan las 6 obras del diseño con las 60 fotografías disponibles (10 por obra) y las tres variantes del logo. Las fotos, los nombres de las obras y los datos de contacto son **provisionales** y se reemplazan cuando el cliente entregue los definitivos.

Fuera de alcance:

- CI/CD y despliegue en Cloudflare Pages (cambio aparte, ticket PB-009).
- Dominio (PB-016), CMS, formulario de contacto, mapa, analítica, idiomas, sección Estudio, Instagram embebido y "En proceso".
- Curaduría y tratamiento "retro" de las fotos reales (PB-017).
- Mover las categorías al menú de la cabecera: el hito H1 las pide "arriba a la derecha", pero el diseño elegido las pone como filtros bajo el carrusel. Se implementa el diseño tal cual y la diferencia queda anotada para la revisión con el cliente.

## Capabilities

### New Capabilities

- `catalogo-obras`: modelo de contenido de las obras (datos, categorías, fotos, portada, orden) y su validación al construir el sitio.
- `pagina-inicio`: carrusel de portada, filtros por categoría y grilla de obras.
- `ficha-obra`: página de detalle de cada obra con sus fotos, navegación a la siguiente obra y consulta por WhatsApp.
- `contacto`: acceso al contacto desde cualquier página, enlaces de WhatsApp y redes sociales.
- `imagenes`: formatos, tamaños, carga y presentación de las fotografías.
- `estructura-sitio`: cabecera, pie, sistema visual, comportamiento adaptable, página 404, metadatos para compartir e indexación.

### Modified Capabilities

Ninguna: el proyecto no tiene specs previas.

## Impact

- **Código**: todo es nuevo. Se agregan `src/`, `public/`, `astro.config.mjs`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml` y `.gitignore`; se amplía el `README.md`.
- **Dependencias**: Astro, sharp (procesamiento de imágenes), la fuente Archivo variable autoalojada y herramientas de verificación (`astro check`, Playwright para una prueba de humo).
- **Entorno local**: requiere instalar pnpm (Node 26 ya no incluye corepack).
- **Tamaño del repositorio**: entran unos 110 MB de fotografías provisionales en `src/assets/obras/`. Al reemplazarlas por las reales quedarán en el historial de git.
- **Recursos de origen** (fuera del repositorio): diseño en `~/Proyectos/Referencias-PabloBueno/html/Bueno Valdivia Arquitectos portafolio/` y fotos y logo en `~/Proyectos/Referencias-PabloBueno/fotografias/`.
- **Tablero**: da respuesta a PB-007 (stack) y avanza H1; deja preparado el terreno para PB-009 y PB-017.

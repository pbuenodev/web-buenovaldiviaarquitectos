# Design

## Context

Hoy `Carrusel.astro` pinta una lámina por obra (foto + nombre + ubicación), controles y contador, y `src/scripts/carrusel.ts` gestiona avance, botones, swipe y precarga. `Cabecera.astro` es una franja azul sólida (logo a la izquierda, "Contacto" a la derecha) que `Base.astro` pone en todas las páginas. Los datos no cambian: cada obra declara `carrusel: { foto, orden }` y `laminasCarrusel()` entrega las láminas ordenadas. `Foto.astro` ya soporta `prioritaria` y `aplazada` (carga diferida de las láminas que no son la primera). Motivación y alcance: ver `proposal.md`; requisitos: ver `specs/`.

El logo tiene dos colores: azul `#142e44` y ámbar `#e2921e`. Sobre fotografía se usa `logo-marca-claro.svg` (marca sola, trazos claros, ámbar).

## Goals / Non-Goals

**Goals:**
- Portada a pantalla completa, sutil, con una sola jerarquía de texto (marca) y cabecera superpuesta.
- Mantener la carga diferida de las fotos no visibles y la prioridad de la primera.
- Menú que funcione sin JavaScript y sea accesible con teclado.

**Non-Goals:**
- Selector de idioma ESP/ENG y rutas `/en/` (cambio aparte).
- Cambiar el modelo de datos del catálogo, la grilla, filtros, fichas o el pie.
- Reproductores de video o fondos animados.

## Decisions

**1. Renombrar el componente a `Portada.astro` y `portada.ts`, en vez de seguir ampliando `Carrusel`.** El componente deja de ser un carrusel (sin controles ni contador); conservar el nombre confundiría. El módulo de datos `laminasCarrusel` y el campo YAML `carrusel` se mantienen para no tocar el catálogo ni la spec `catalogo-obras`. *Alternativa:* renombrar también el campo; se descarta por costo sin beneficio visible.

**2. Fundido cruzado por clase `data-activa` y `setInterval` de 5 s, sin acercamiento.** Se mantiene el mecanismo actual (opacidad con transición de 1,8 s) y se elimina el `scale` del fondo, que añadía movimiento y no es parte de la referencia. El script se reduce a: precargar la siguiente, alternar la lámina activa, pausar con `visibilitychange` y no avanzar con `prefers-reduced-motion`. Se eliminan botones, contador, anuncio `aria-live` y swipe. *Alternativa:* animación solo con CSS (`@keyframes` por lámina): evita JS pero obligaría a cargar todas las fotos al abrir, lo que rompe `imagenes` ("Prioridad de carga").

**3. Texto fijo con el `<h1>` visible.** El `<h1>` pasa de `solo-lectores` a ser el título de la portada ("Bueno Valdivia / Arquitectos", `--titulo-xl`, mayúsculas, centrado sobre el tercio inferior). Las fotos llevan `alt` con el nombre de la obra solo la activa (`aria-hidden` en las demás), como hoy. Se agrega una flecha ↓ pequeña que enlaza a `#obras`, solo decorativa para el puntero y alcanzable con teclado.

**4. Velo en dos capas sobre las láminas, con el azul del sitio.** Una capa uniforme `rgb(13 24 40 / 0.4)` unifica tonos (resuelve las fotos de día frente a las de noche de la referencia) y un degradado hacia abajo hasta ~0.8 sostiene el título. Los valores se afinan mirando las fotos reales; el criterio es el de contraste de la spec (3:1 título/logo, 4,5:1 texto pequeño). El ámbar no se usa en el velo: lo aporta la marca del logo, para no teñir las fotos.

**5. Cabecera con tres zonas (izquierda vacía, logo al centro, menú a la derecha) en una grilla de tres columnas.** La columna izquierda queda reservada para el futuro selector de idioma sin rehacer la maqueta. En la portada, `Base.astro` recibe una variante `cabecera="sobre-foto"` que posiciona la cabecera `absolute` sobre la portada y sin fondo, con un degradado oscuro superior ligero para el logo; el resto de páginas usa la variante sólida actual. El logo es `logo-marca-claro.svg` (marca sola) a ~48–56 px.

**6. Menú con la API `popover` nativa.** El botón usa `popovertarget` y el panel `popover="auto"`: abre y cierra sin JS, cierra con Escape o clic fuera y devuelve el foco al botón. Un script mínimo cierra el panel al elegir un enlace de ancla (`#obras`, `#contacto`). Contiene "Obras" (`/#obras`), "Contacto" (`#contacto`) y las redes con dirección, tomadas de `sitio.redes`. *Alternativas:* `<details>` (cierra mal con Escape y no devuelve el foco), menú JS propio (más código y más fallos de accesibilidad).

**7. Selección de fotos revisada a mano.** No se automatiza: se revisa cada foto candidata de `carrusel.foto` y se prefiere la de ambiente azul con luz cálida (crepúsculo, interior iluminado), horizontal y sin sujeto en el tercio inferior donde va el título. Se cambia `carrusel.foto` en el YAML; si una obra no tiene foto adecuada se deja fuera del hero quitando su bloque `carrusel`. Debe quedar al menos una lámina (regla ya vigente).

## Risks / Trade-offs

- [El título tapa el sujeto de la foto, que suele estar abajo] → elegir fotos con la zona inferior despejada y probar el recorte en 390 px y 1440 px.
- [Logo claro poco legible sobre una foto muy clara] → degradado superior y velo; verificar contraste con cada foto elegida.
- [Quitar el enlace a la obra desde la portada reduce un atajo] → las obras quedan en la grilla y en "Obras" del menú; aceptado en el alcance.
- [Hero a 100svh empuja la grilla bajo el pliegue] → la flecha ↓ y el menú "Obras" llevan a ella; es el comportamiento de la referencia.
- [Fotos a 2560 px a pantalla completa pesan en móvil] → `sizes` de 100vw y la excepción de 400 KB ya vigente para AVIF anchas; verificar con `pnpm verificar:imagenes`.
- [`popover` en navegadores antiguos] → sin soporte el botón no abre; los enlaces siguen disponibles en el pie y la grilla. Se acepta porque el soporte es general en navegadores actuales.

## Migration Plan

Cambio solo de interfaz y de selección de fotos; no hay datos que migrar. Se despliega con el flujo habitual de Cloudflare Pages. Reversión: revertir el commit; `carrusel.foto` en los YAML es compatible con ambas versiones.

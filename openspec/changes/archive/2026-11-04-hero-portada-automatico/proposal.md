# Proposal

## Why

La portada actual es un carrusel con flechas, contador y un texto distinto por obra, bajo una cabecera azul sólida. Resulta recargado para un estudio de arquitectura y la cabecera ocupa espacio sin aportar. Se busca una entrada más sutil: fotografía a pantalla completa que cambia sola, con la marca como único texto y la navegación superpuesta, y con un tratamiento de color que haga convivir las fotos con el logo (azul marino `#142e44` y ámbar `#e2921e`).

## What Changes

- La portada pasa de carrusel manual a un **hero a pantalla completa** con fundido automático cada **5 segundos**, sin flechas, contador ni deslizamiento.
- El texto sobre la foto deja de ser el nombre de cada obra: pasa a ser **fijo** ("Bueno Valdivia Arquitectos") y no cambia con la lámina.
- Un **velo azul marino** sobre las fotos unifica sus tonos, y se oscurece abajo para que el título se lea.
- La **cabecera** se reorganiza: logo (la marca sola) al centro y **menú hamburguesa** a la derecha. En la portada va superpuesta y transparente sobre la foto; en las demás páginas conserva su fondo azul.
- El menú hamburguesa lista **Obras**, **Contacto** y las redes, y funciona sin JavaScript.
- Se revisa qué foto de cada obra participa en el hero, privilegiando las de ambiente azul y luz cálida que combinan con el logo.
- Se mantiene el movimiento reducido (sin avance automático ni acercamiento) y la pausa con la pestaña oculta.

**BREAKING** (de comportamiento visible): desaparecen los botones Anterior/Siguiente, el contador `01 / 06`, el gesto de deslizar y el enlace a la obra desde la portada. Se accede a las obras por la grilla.

Fuera de alcance, y supuesto aquí: el **selector de idioma ESP/ENG** de la referencia no se incluye. Hacerlo de verdad exige rutas `/en/`, contenido traducido y revisar `estructura-sitio` ("Idioma del sitio"), por lo que se tratará en un cambio aparte cuando el cliente entregue los textos en inglés.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `pagina-inicio`: la portada pasa a hero de pantalla completa con avance automático cada 5 s, título fijo de marca y velo azul; se retira el control manual; se ajustan movimiento reducido y uso sin scripts.
- `estructura-sitio`: la cabecera común pasa a logo centrado y menú hamburguesa, superpuesta sobre la foto en el inicio; se ajusta la identidad visual y el recorrido con teclado.

## Impact

- Código: `src/components/Carrusel.astro` (se reemplaza por el hero), `src/scripts/carrusel.ts` (se simplifica), `src/components/Cabecera.astro` (nuevo diseño con menú), `src/pages/index.astro`, `src/layouts/Base.astro` (variante de cabecera superpuesta), `src/pages/404.astro` si usa la cabecera.
- Contenido: `carrusel.foto` en los `index.yaml` de obras (selección de fotos).
- Pruebas: `tests/e2e/humo.spec.ts` (se retiran las comprobaciones de botones y contador).
- Sin dependencias nuevas. Las especificaciones `imagenes` y `catalogo-obras` no cambian: el hero sigue tomando una foto por obra desde `carrusel`, con la primera cargada con prioridad y la excepción de 400 KB para fotos anchas.

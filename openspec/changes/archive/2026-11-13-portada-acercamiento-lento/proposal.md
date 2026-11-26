# Proposal

## Why

La portada del inicio cambia de foto con un fundido, pero cada foto se queda quieta. El cliente quiere que cada fotografía "entre" lentamente hacia el proyecto, con un acercamiento suave y controlado, para dar una sensación más premium. En noviembre se había quitado un acercamiento anterior porque no era parte de la referencia; ahora el cliente lo pide de forma expresa, con una intensidad sutil.

## What Changes

- Cada fotografía de la portada del inicio se acerca de forma continua y lenta, de su tamaño normal a un 8 % más grande (escala 1 → 1,08), mientras está visible. El acercamiento sigue durante su fundido de salida, para que nunca se vea detenerse ni retroceder.
- El acercamiento va hacia el centro de la fotografía, a velocidad constante. Cada foto empieza de nuevo desde su tamaño normal cuando vuelve a aparecer.
- El nombre de la oficina, los integrantes, la cabecera y el velo no se mueven: solo se acerca la fotografía.
- Sin cambios para quien prefiere movimiento reducido: la primera foto queda fija, sin acercamiento (el spec ya lo exige). Sin scripts, la primera foto también queda fija.

Fuera de alcance: acercamiento en las tarjetas de la grilla, en la ficha o en "Siguiente obra"; cambiar los 5 segundos por foto o el fundido de 1,8 s; desplazamientos laterales o puntos de enfoque distintos por foto.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `pagina-inicio`: se agrega el requisito del acercamiento lento de cada fotografía de la portada.

## Impact

- `src/components/Portada.astro`: estilos de la escala y su transición.
- `src/scripts/portada.ts`: marca qué fotos se están acercando, incluida la que sale durante el fundido.
- `tests/e2e/humo.spec.ts`: pruebas del acercamiento, de que el nombre no se mueve y de la ausencia de acercamiento con movimiento reducido.
- Sin dependencias nuevas ni cambios de contenido.

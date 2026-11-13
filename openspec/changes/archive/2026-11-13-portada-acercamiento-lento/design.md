# Design

## Context

- `Portada.astro` apila las láminas con `position: absolute`. La lámina activa lleva `data-activa` y pasa a `opacity: 1` con una transición de 1,8 s. La portada tiene `overflow: hidden`.
- `portada.ts` cambia la lámina activa cada 5 s con `setInterval`, se pausa con la pestaña oculta y no arranca con `prefers-reduced-motion`. Si hay menos de 2 láminas, termina sin hacer nada.
- Una lámina es visible durante 1,8 s (entrada) + 3,2 s (sola) + 1,8 s (salida) = 6,8 s.
- El diseño original de 2026-10-13 tenía un acercamiento (1 → 1,05 en 8 s) que se quitó en `hero-portada-automatico`. Este cambio lo recupera con otra mecánica, para que la foto no retroceda al perder `data-activa`.

## Goals / Non-Goals

**Goals:**
- Que el acercamiento nunca se vea detenerse, retroceder ni saltar.
- Que solo la animen el compositor y la GPU (`transform`), sin costo de diseño ni de pintado.

**Non-Goals:**
- Que el acercamiento quede sincronizado si la pestaña estuvo oculta: al volver, la foto puede estar ya en su máximo hasta el siguiente cambio (ver Riesgos).

## Decisions

### 1. Un atributo propio, `data-acercar`, que pone el script
La escala es una animación CSS en `.lamina[data-acercar] img` (`@keyframes acercar`, de `scale(1)` a `scale(1.08)`, `7s linear forwards`). Sin el atributo no hay animación y la foto vuelve en el acto a su tamaño.
- El script pone `data-acercar` en la lámina que entra. Cada vez que el atributo aparece, la animación arranca desde la escala 1. Si la lámina aún lo tuviera, el script lo quita y fuerza un reflujo para reiniciarla. Esto no ocurre en la práctica, porque una foto pasa al menos 3,2 s sin el atributo antes de volver.
- *Alternativa descartada durante la implementación*: una `transition` sobre `transform`. Una transición solo arranca si el elemento ya tenía un estilo calculado durante un pintado. La primera foto recibe el atributo antes de que la página termine de pintarse, así que a veces saltaba directo a 1,08. Ni leer `getComputedStyle` antes ni esperar dos `requestAnimationFrame` lo resolvieron de forma fiable.
- La lámina que sale **conserva** `data-acercar` durante el fundido. El script se lo quita 1,8 s después de que deja de estar activa, cuando ya es invisible, y entonces vuelve a su tamaño sin que se note.
- 7 s lineales cubren los 6,8 s visibles, así que la foto nunca llega quieta a su máximo mientras se ve. La velocidad constante evita que se perciba un frenado.
- *Alternativa descartada*: atar la escala a `data-activa`. Al quitar el atributo, la foto que sale retrocedería durante el fundido, o se congelaría si se juega con `transition-delay`, que es justo lo que pide evitar el spec.

### 2. El fundido sigue en CSS y su duración se comparte
`Portada.astro` pasa `data-fundido="1800"` junto a `data-segundos`, y el CSS usa la misma cifra, para que el script sepa cuándo quitar `data-acercar` sin duplicar un número mágico.

### 3. Movimiento reducido y casos límite
- Con `prefers-reduced-motion: reduce`, el script no pone `data-acercar`. Además, una regla CSS dentro de esa media query anula la animación, por si la preferencia cambia con la página abierta. En ese caso, el script también quita `data-acercar` en el manejador de `change` que ya existe.
- Sin scripts, ninguna lámina recibe `data-acercar`: la primera foto queda fija, como ahora.
- Con una sola lámina, el acercamiento se aplica una vez a la primera foto antes de que el script termine; la foto queda luego en 1,08.

### 4. Rendimiento y nitidez
- `will-change: transform` solo en `.lamina[data-acercar] img` (como mucho dos fotos a la vez), para no reservar capas en todas.
- Un 8 % de escala sobre la variante que ya se sirve (hasta 2560 px) no se nota borrosa a 1440 px. No hace falta cambiar `sizes` ni el máximo de 2560 px.
- La portada ya tiene `overflow: hidden`, así que la foto escalada no puede desbordar la página.

## Risks / Trade-offs

- [Con la pestaña oculta el temporizador se detiene, pero la transición CSS sigue y la foto llega a 1,08 en reposo] → Se acepta. Al volver, el cambio siguiente ocurre a los 5 s y la foto nueva arranca desde 1. Si molesta, se puede quitar y volver a poner `data-acercar` al reanudar.
- [El acercamiento suma movimiento continuo en la primera pantalla] → Es sutil (8 % en 7 s) y respeta movimiento reducido. El cliente confirma la intensidad viendo el sitio local antes de publicar.
- [Las pruebas e2e con reloj simulado no ven las animaciones CSS] → Las pruebas verifican atributos y `getComputedStyle(...).transform` en momentos concretos, con el reloj real y márgenes amplios, en lugar de medir fotogramas.

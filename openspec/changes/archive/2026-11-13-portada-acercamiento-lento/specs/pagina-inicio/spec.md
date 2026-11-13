## ADDED Requirements

### Requirement: Acercamiento lento de cada fotografía de la portada
Mientras una fotografía de la portada está visible, SHALL acercarse de forma continua y a velocidad constante hacia su centro, desde su tamaño normal hasta 1,08 veces, sin deformarse. El acercamiento SHALL seguir durante el fundido de salida, sin detenerse ni retroceder mientras la foto se vea, y cada foto SHALL volver a empezar desde su tamaño normal cuando aparece de nuevo. El nombre de la oficina, los integrantes, la cabecera y el velo MUST NOT moverse ni cambiar de tamaño.

#### Scenario: La foto se acerca mientras está visible
- **WHEN** una fotografía de la portada lleva 2,5 segundos visible
- **THEN** se ve más grande que al aparecer y menos de 1,08 veces su tamaño normal, y sigue creciendo

#### Scenario: Sin detenerse en el fundido
- **WHEN** la portada pasa a la fotografía siguiente
- **THEN** la que sale sigue acercándose hasta desaparecer, y la que entra empieza a acercarse desde su tamaño normal

#### Scenario: Vuelve a empezar
- **WHEN** la portada da la vuelta y muestra otra vez la primera fotografía
- **THEN** esa foto vuelve a empezar desde su tamaño normal

#### Scenario: El nombre queda fijo
- **WHEN** la fotografía se acerca
- **THEN** el nombre de la oficina, los integrantes, la cabecera y el velo mantienen su posición y su tamaño

#### Scenario: Sin desborde
- **WHEN** una fotografía llega a su máximo acercamiento en una pantalla de 390 px o de 1440 px de ancho
- **THEN** la página no se desplaza en horizontal y la foto sigue cubriendo toda la portada

#### Scenario: Movimiento reducido
- **WHEN** una persona con preferencia por movimiento reducido abre la página de inicio
- **THEN** la primera fotografía se ve fija en su tamaño normal, sin acercamiento

#### Scenario: Sin scripts
- **WHEN** la página de inicio se abre con JavaScript desactivado
- **THEN** la primera fotografía se ve fija en su tamaño normal

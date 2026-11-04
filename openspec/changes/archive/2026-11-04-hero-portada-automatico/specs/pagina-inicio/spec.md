## ADDED Requirements

### Requirement: Portada de pantalla completa
La página de inicio SHALL abrir con una portada que ocupa toda la altura de la primera pantalla, con la cabecera superpuesta sobre la fotografía. La portada SHALL mostrar una fotografía por cada obra que participa en ella y, sobre las fotografías, el nombre de la oficina en mayúsculas de gran tamaño, que MUST permanecer igual mientras cambian las fotografías. Un velo azul marino SHALL cubrir las fotografías y oscurecerse hacia abajo para mantener legible el nombre.

#### Scenario: Primera carga
- **WHEN** una persona abre la página de inicio
- **THEN** ve la primera fotografía a pantalla completa con su velo azul, la cabecera sobre ella y el nombre "Bueno Valdivia Arquitectos" en mayúsculas

#### Scenario: El nombre no cambia con la fotografía
- **WHEN** la portada pasa de una fotografía a la siguiente
- **THEN** el nombre de la oficina se mantiene en el mismo lugar sin parpadear ni cambiar

#### Scenario: Sin controles de lámina
- **WHEN** se revisa la portada
- **THEN** no hay botones de anterior y siguiente, ni contador, ni enlace a una obra concreta

#### Scenario: Pantalla alta y estrecha
- **WHEN** se abre la página de inicio en un teléfono de 390 px de ancho
- **THEN** la portada ocupa toda la altura visible, la fotografía se recorta sin deformarse y el nombre cabe sin desbordar

## MODIFIED Requirements

### Requirement: Avance automático con transición lenta
La portada SHALL avanzar sola a la fotografía siguiente cada 5 segundos, con un fundido cruzado de aproximadamente 1,8 segundos. Después de la última fotografía SHALL volver a la primera. El avance MUST NOT depender de ninguna interacción de la persona.

#### Scenario: Paso del tiempo
- **WHEN** transcurren 5 segundos
- **THEN** la fotografía siguiente aparece con fundido sobre la anterior

#### Scenario: Vuelta al principio
- **WHEN** se completa el turno de la última fotografía
- **THEN** la portada vuelve a la primera

#### Scenario: Pestaña en segundo plano
- **WHEN** la pestaña del navegador deja de estar visible
- **THEN** el avance automático se detiene y se reanuda al volver a ella

### Requirement: Movimiento reducido
Cuando el dispositivo indica preferencia por movimiento reducido, la portada MUST NOT avanzar sola ni aplicar fundido o acercamiento, y SHALL mostrar de forma fija la primera fotografía.

#### Scenario: Preferencia de movimiento reducido
- **WHEN** una persona con esa preferencia activa abre la página de inicio
- **THEN** ve la primera fotografía fija con el nombre de la oficina y la cabecera, y la fotografía no cambia

### Requirement: Inicio utilizable sin scripts
Si los scripts no se ejecutan, la página de inicio SHALL seguir mostrando la primera fotografía de la portada con su velo y el nombre de la oficina, el menú de la cabecera con sus enlaces y la grilla con todas las obras.

#### Scenario: Scripts desactivados
- **WHEN** la página de inicio se abre con JavaScript desactivado
- **THEN** se ve la primera fotografía de la portada, el menú se puede abrir y cerrar, todas las obras aparecen en la grilla y todos los enlaces funcionan

## REMOVED Requirements

### Requirement: Carrusel de portada
**Reason**: sustituido por "Portada de pantalla completa": ya no es un carrusel de obras con texto propio por lámina, sino un hero con el nombre de la oficina fijo.
**Migration**: el nombre y la ubicación de cada obra siguen en la grilla y en su ficha; no se requiere migración de contenido.

### Requirement: Control manual del carrusel
**Reason**: la portada pasa a ser un hero sutil que avanza solo; las flechas, el contador y el deslizamiento restan sobriedad a la primera impresión.
**Migration**: las obras siguen accesibles desde la grilla bajo la portada y desde el menú de la cabecera ("Obras"). No se requiere migración de contenido.

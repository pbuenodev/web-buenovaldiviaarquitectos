# pagina-inicio Specification

## Purpose

Describe la página de entrada del portafolio: un carrusel de fotografías a gran formato que presenta las obras y, debajo, la grilla de todas las obras con filtros por categoría.

## Requirements

### Requirement: Portada de pantalla completa
La página de inicio SHALL abrir con una portada que ocupa toda la altura de la primera pantalla, con la cabecera superpuesta sobre la fotografía. La portada SHALL mostrar una fotografía por cada obra que participa en ella y, sobre las fotografías, el nombre de la oficina en mayúsculas, que MUST permanecer igual mientras cambian las fotografías. Un velo azul marino SHALL cubrir las fotografías y oscurecerse hacia abajo para mantener legible el nombre.

#### Scenario: Primera carga
- **WHEN** una persona abre la página de inicio
- **THEN** ve la primera fotografía a pantalla completa con su velo azul, la cabecera sobre ella y el nombre "Bueno Valdivia Arquitectos" en mayúsculas

#### Scenario: El nombre no cambia con la fotografía
- **WHEN** la portada pasa de una fotografía a la siguiente
- **THEN** el nombre de la oficina y los integrantes se mantienen en el mismo lugar sin parpadear ni cambiar

#### Scenario: Sin controles de lámina
- **WHEN** se revisa la portada
- **THEN** no hay botones de anterior y siguiente, ni contador, ni enlace a una obra concreta

#### Scenario: Pantalla alta y estrecha
- **WHEN** se abre la página de inicio en un teléfono de 390 px de ancho
- **THEN** la portada ocupa toda la altura visible, la fotografía se recorta sin deformarse y el nombre y los integrantes caben sin desbordar

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

### Requirement: Grilla de obras
Bajo el carrusel SHALL mostrarse una grilla con todas las obras que no pertenecen al álbum de otra obra: la portada en proporción 4:3 y, debajo, el nombre y la ciudad. La grilla SHALL tener 3 columnas en escritorio y 2 en teléfono, y cada elemento SHALL enlazar a la ficha de su obra.

#### Scenario: Grilla completa
- **WHEN** la persona se desplaza bajo el carrusel con el filtro "Todas" activo
- **THEN** ve todas las obras del catálogo que no pertenecen a un álbum, en el orden del catálogo

#### Scenario: Lotes fuera de la grilla
- **WHEN** la persona revisa la grilla con cualquier filtro activo
- **THEN** ve "Bosque Golf, El Condominio" y no ve ninguno de sus lotes

#### Scenario: Abrir una obra
- **WHEN** la persona pulsa la portada o el nombre de una obra
- **THEN** navega a la ficha de esa obra

### Requirement: Filtros por categoría
Sobre la grilla SHALL haber cinco filtros de texto: "Todas", "Casas", "Edificios", "Comercial" y "Colegios". "Todas" SHALL estar activo al cargar. El filtro activo SHALL distinguirse visualmente y elegir uno SHALL actualizar la grilla sin recargar la página ni mover el desplazamiento.

#### Scenario: Filtrar por casas
- **WHEN** la persona elige "Casas"
- **THEN** la grilla muestra solo las obras de la categoría casas y "Casas" queda marcado como activo

#### Scenario: Filtrar por comercial
- **WHEN** la persona elige "Comercial"
- **THEN** la grilla muestra solo las obras de la categoría comercial y "Comercial" queda marcado como activo

#### Scenario: Filtrar por colegios
- **WHEN** la persona elige "Colegios"
- **THEN** la grilla muestra solo las obras de la categoría colegios, entre ellas "Colegio Charles School", y "Colegios" queda marcado como activo

#### Scenario: Volver a todas
- **WHEN** la persona elige "Todas" después de haber filtrado
- **THEN** la grilla vuelve a mostrar todas las obras

#### Scenario: Filtro anunciado a lectores de pantalla
- **WHEN** una persona usa un lector de pantalla sobre los filtros
- **THEN** puede saber cuál de los cinco está activo

### Requirement: Inicio utilizable sin scripts
Si los scripts no se ejecutan, la página de inicio SHALL seguir mostrando la primera fotografía de la portada con su velo y el nombre de la oficina, el menú de la cabecera con sus enlaces y la grilla con todas las obras.

#### Scenario: Scripts desactivados
- **WHEN** la página de inicio se abre con JavaScript desactivado
- **THEN** se ve la primera fotografía de la portada, el menú se puede abrir y cerrar, todas las obras aparecen en la grilla y todos los enlaces funcionan

### Requirement: Nombre de la oficina en dos niveles con sus integrantes
En la portada, el nombre de la oficina SHALL presentarse en dos líneas: "Bueno Valdivia" y debajo "Arquitectos" en un tamaño claramente menor. Bajo el nombre SHALL listarse, en un tamaño aún menor, los integrantes "Pablo A. Bueno Orellana", "Teresa Y. Valdivia Ponce" y "Bruno A. Bueno Valdivia". El nombre MUST ser más pequeño que antes de este cambio. Los integrantes MUST NOT formar parte del título principal de la página.

#### Scenario: Jerarquía de tamaños
- **WHEN** se abre la página de inicio en una pantalla de 1440 px de ancho
- **THEN** "Bueno Valdivia" se ve más grande que "Arquitectos", "Arquitectos" más grande que los nombres de los integrantes, y "Bueno Valdivia" mide como máximo 88 px de alto de letra

#### Scenario: Integrantes en la portada
- **WHEN** se abre la página de inicio
- **THEN** bajo el nombre de la oficina se leen los tres integrantes, en ese orden

#### Scenario: Título accesible
- **WHEN** un lector de pantalla anuncia el título principal del inicio
- **THEN** anuncia "Bueno Valdivia Arquitectos" sin los nombres de los integrantes

#### Scenario: Contraste de los integrantes
- **WHEN** se mide el contraste de los nombres de los integrantes sobre cada fotografía de la portada con su velo
- **THEN** cumple al menos la relación 4,5:1

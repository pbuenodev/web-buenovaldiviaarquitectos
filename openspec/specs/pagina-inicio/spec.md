# pagina-inicio Specification

## Purpose

Describe la página de entrada del portafolio: un carrusel de fotografías a gran formato que presenta las obras y, debajo, la grilla de todas las obras con filtros por categoría.

## Requirements

### Requirement: Carrusel de portada
La página de inicio SHALL mostrar, bajo la cabecera, un carrusel que ocupa la mayor parte de la primera pantalla (alrededor del 78 % del alto en escritorio y del 72 % en teléfono) con una lámina por cada obra que participa en él. Sobre la fotografía SHALL verse el nombre de la obra en mayúsculas de gran tamaño y su ubicación.

#### Scenario: Primera carga
- **WHEN** una persona abre la página de inicio
- **THEN** ve la fotografía de la primera lámina, el nombre y la ubicación de esa obra, y un contador con el formato `01 / 06`

#### Scenario: Ir a la obra desde el carrusel
- **WHEN** la persona pulsa el nombre o la ubicación de la lámina visible
- **THEN** navega a la ficha de esa obra

### Requirement: Avance automático con transición lenta
El carrusel SHALL avanzar solo a la lámina siguiente cada 6 segundos, con un fundido de aproximadamente 1,8 segundos y un acercamiento lento de la fotografía visible. Después de la última lámina SHALL volver a la primera.

#### Scenario: Paso del tiempo
- **WHEN** transcurren 6 segundos sin interacción
- **THEN** la lámina siguiente aparece con fundido y se actualizan el nombre, la ubicación y el contador

#### Scenario: Pestaña en segundo plano
- **WHEN** la pestaña del navegador deja de estar visible
- **THEN** el avance automático se detiene y se reanuda al volver a ella

### Requirement: Control manual del carrusel
El carrusel SHALL ofrecer botones "Anterior" y "Siguiente", y en pantallas táctiles SHALL responder al gesto de deslizar horizontalmente. Toda interacción manual SHALL reiniciar la cuenta del avance automático.

#### Scenario: Botón siguiente
- **WHEN** la persona pulsa "Siguiente"
- **THEN** se muestra la lámina siguiente y los próximos 6 segundos se cuentan desde ese momento

#### Scenario: Botón anterior en la primera lámina
- **WHEN** la persona pulsa "Anterior" estando en la primera lámina
- **THEN** se muestra la última lámina

#### Scenario: Deslizar en teléfono
- **WHEN** la persona desliza el dedo hacia la izquierda más de 40 píxeles sobre el carrusel
- **THEN** se muestra la lámina siguiente; hacia la derecha, la anterior

#### Scenario: Uso con teclado
- **WHEN** la persona llega con el teclado a los botones del carrusel y los activa
- **THEN** el carrusel cambia de lámina igual que con el puntero y el foco es visible

### Requirement: Movimiento reducido
Cuando el dispositivo indica preferencia por movimiento reducido, el carrusel MUST NOT avanzar solo ni aplicar el acercamiento, y el cambio de lámina MUST ser inmediato.

#### Scenario: Preferencia de movimiento reducido
- **WHEN** una persona con esa preferencia activa abre la página de inicio
- **THEN** la lámina solo cambia mediante los botones o el gesto, sin fundido ni acercamiento

### Requirement: Grilla de obras
Bajo el carrusel SHALL mostrarse una grilla con todas las obras: la portada en proporción 4:3 y, debajo, el nombre y la ciudad. La grilla SHALL tener 3 columnas en escritorio y 2 en teléfono, y cada elemento SHALL enlazar a la ficha de su obra.

#### Scenario: Grilla completa
- **WHEN** la persona se desplaza bajo el carrusel con el filtro "Todas" activo
- **THEN** ve todas las obras del catálogo en el orden del catálogo

#### Scenario: Abrir una obra
- **WHEN** la persona pulsa la portada o el nombre de una obra
- **THEN** navega a la ficha de esa obra

### Requirement: Filtros por categoría
Sobre la grilla SHALL haber tres filtros de texto: "Todas", "Casas" y "Edificios públicos". "Todas" SHALL estar activo al cargar. El filtro activo SHALL distinguirse visualmente y elegir uno SHALL actualizar la grilla sin recargar la página ni mover el desplazamiento.

#### Scenario: Filtrar por casas
- **WHEN** la persona elige "Casas"
- **THEN** la grilla muestra solo las obras de la categoría casas y "Casas" queda marcado como activo

#### Scenario: Volver a todas
- **WHEN** la persona elige "Todas" después de haber filtrado
- **THEN** la grilla vuelve a mostrar todas las obras

#### Scenario: Filtro anunciado a lectores de pantalla
- **WHEN** una persona usa un lector de pantalla sobre los filtros
- **THEN** puede saber cuál de los tres está activo

### Requirement: Inicio utilizable sin scripts
Si los scripts no se ejecutan, la página de inicio SHALL seguir mostrando la primera lámina del carrusel con su enlace y la grilla con todas las obras.

#### Scenario: Scripts desactivados
- **WHEN** la página de inicio se abre con JavaScript desactivado
- **THEN** se ve la primera fotografía del carrusel, todas las obras en la grilla y todos los enlaces funcionan

# Spec Delta

## MODIFIED Requirements

### Requirement: Portada de pantalla completa
La página de inicio SHALL abrir con una portada que ocupa toda la altura de la primera pantalla, con la cabecera superpuesta sobre la fotografía. La portada SHALL mostrar, en su orden, cada fotografía de la selección de portada y, sobre las fotografías, el nombre de la oficina en mayúsculas, que MUST permanecer igual mientras cambian las fotografías. Un velo azul marino SHALL cubrir las fotografías y oscurecerse hacia abajo para mantener legible el nombre.

#### Scenario: Primera carga
- **WHEN** una persona abre la página de inicio
- **THEN** ve la primera fotografía a pantalla completa con su velo azul, la cabecera sobre ella y el nombre "Bueno Valdivia Arquitectos" en mayúsculas

#### Scenario: Selección del cliente
- **WHEN** se recorre la portada completa
- **THEN** pasan seis fotografías: Bosque Golf El Condominio, dos del Edificio Central Tráfico Alameda, Casa en El San Cristóbal y dos del Edificio Panamericana, en ese orden, cada una con el nombre de su obra como texto alternativo

#### Scenario: El nombre no cambia con la fotografía
- **WHEN** la portada pasa de una fotografía a la siguiente
- **THEN** el nombre de la oficina y los integrantes se mantienen en el mismo lugar sin parpadear ni cambiar

#### Scenario: Sin controles de lámina
- **WHEN** se revisa la portada
- **THEN** no hay botones de anterior y siguiente, ni contador, ni enlace a una obra concreta

#### Scenario: Pantalla alta y estrecha
- **WHEN** se abre la página de inicio en un teléfono de 390 px de ancho
- **THEN** la portada ocupa toda la altura visible, la fotografía se recorta sin deformarse y el nombre y los integrantes caben sin desbordar

### Requirement: Filtros por categoría
Sobre la grilla SHALL haber cinco filtros de texto: "Todas", "Casas", "Edificios", "Comercial" y "Colegios". "Todas" SHALL estar activo al cargar. El filtro activo SHALL distinguirse visualmente y elegir uno SHALL actualizar la grilla sin recargar la página ni mover el desplazamiento.

#### Scenario: Filtrar por casas
- **WHEN** la persona elige "Casas"
- **THEN** la grilla muestra solo las obras de la categoría casas y "Casas" queda marcado como activo

#### Scenario: Filtrar por comercial
- **WHEN** la persona elige "Comercial"
- **THEN** la grilla muestra solo las obras de la categoría comercial, entre ellas los dos centros de diálisis, y "Comercial" queda marcado como activo

#### Scenario: Filtrar por colegios
- **WHEN** la persona elige "Colegios"
- **THEN** la grilla muestra solo las obras de la categoría colegios: "Colegio Charles School", "Colegio Ecole Noel", "Colegio Jean Jeaques" y "Colegio Zoltan Dienes", y "Colegios" queda marcado como activo

#### Scenario: Volver a todas
- **WHEN** la persona elige "Todas" después de haber filtrado
- **THEN** la grilla vuelve a mostrar todas las obras

#### Scenario: Filtro anunciado a lectores de pantalla
- **WHEN** una persona usa un lector de pantalla sobre los filtros
- **THEN** puede saber cuál de los cinco está activo

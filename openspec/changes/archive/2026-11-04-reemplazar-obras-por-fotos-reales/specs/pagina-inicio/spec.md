# Spec Delta

## MODIFIED Requirements

### Requirement: Filtros por categoría
Sobre la grilla SHALL haber cuatro filtros de texto: "Todas", "Casas", "Edificios" y "Comercial". "Todas" SHALL estar activo al cargar. El filtro activo SHALL distinguirse visualmente y elegir uno SHALL actualizar la grilla sin recargar la página ni mover el desplazamiento.

#### Scenario: Filtrar por casas
- **WHEN** la persona elige "Casas"
- **THEN** la grilla muestra solo las obras de la categoría casas y "Casas" queda marcado como activo

#### Scenario: Filtrar por comercial
- **WHEN** la persona elige "Comercial"
- **THEN** la grilla muestra solo las obras de la categoría comercial y "Comercial" queda marcado como activo

#### Scenario: Volver a todas
- **WHEN** la persona elige "Todas" después de haber filtrado
- **THEN** la grilla vuelve a mostrar todas las obras

#### Scenario: Filtro anunciado a lectores de pantalla
- **WHEN** una persona usa un lector de pantalla sobre los filtros
- **THEN** puede saber cuál de los cuatro está activo

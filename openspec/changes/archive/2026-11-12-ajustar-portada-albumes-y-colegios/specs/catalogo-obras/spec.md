## MODIFIED Requirements

### Requirement: Categorías cerradas
La categoría de una obra MUST ser exactamente una de cuatro: `casas` (rotulada "Casas"), `edificios` (rotulada "Edificios"), `comercial` (rotulada "Comercial") o `colegios` (rotulada "Colegios").

#### Scenario: Categoría desconocida
- **WHEN** una obra declara una categoría distinta de `casas`, `edificios`, `comercial` o `colegios`
- **THEN** la construcción del sitio falla indicando la obra y el valor no admitido

#### Scenario: Obra comercial
- **WHEN** una obra declara la categoría `comercial`
- **THEN** el sitio se construye y la obra aparece en la grilla y en el filtro "Comercial"

#### Scenario: Obra de colegio
- **WHEN** una obra declara la categoría `colegios`
- **THEN** el sitio se construye y la obra aparece en la grilla y en el filtro "Colegios"

### Requirement: Orden de las obras
Las obras SHALL listarse en orden ascendente según su posición de orden, tanto en la grilla de inicio como al determinar cuál es la obra siguiente. Las obras de un mismo álbum SHALL listarse entre sí con la misma regla.

#### Scenario: Reordenar obras
- **WHEN** se intercambian las posiciones de orden de dos obras
- **THEN** ambas intercambian su lugar en la grilla y cambia en consecuencia la obra siguiente de cada una

#### Scenario: Reordenar obras de un álbum
- **WHEN** se intercambian las posiciones de orden de dos lotes del condominio Bosque Golf
- **THEN** ambos intercambian su lugar en la ficha del condominio

## ADDED Requirements

### Requirement: Obras dentro del álbum de otra obra
Una obra MAY declarar que pertenece al álbum de otra obra, indicando el slug de esa obra. Una obra que pertenece a un álbum SHALL seguir teniendo todos los datos obligatorios, fotografías y ficha propia. Declarar la pertenencia SHALL requerir únicamente un dato en la carpeta de la obra interna, sin cambios en el código.

#### Scenario: Lotes del condominio
- **WHEN** los lotes 1, 2, 4 y 5 de Bosque Golf declaran pertenecer al álbum de "Bosque Golf, El Condominio"
- **THEN** el sitio se construye, el condominio tiene cuatro obras internas y cada lote conserva su ficha en `/obras/<slug>/`

#### Scenario: Agregar un lote nuevo
- **WHEN** se añade una carpeta de obra válida que declara pertenecer al álbum del condominio y se reconstruye el sitio
- **THEN** el lote aparece en la ficha del condominio en la posición que indica su orden, sin cambios en ningún otro archivo

### Requirement: Validación de los álbumes
La construcción del sitio MUST fallar si una obra declara pertenecer al álbum de un slug que no existe, al suyo propio o al de una obra que a su vez pertenece a otro álbum. Los álbumes tienen un solo nivel.

#### Scenario: Álbum inexistente
- **WHEN** una obra declara pertenecer al álbum de un slug que no corresponde a ninguna obra
- **THEN** la construcción del sitio falla identificando la obra y el slug

#### Scenario: Álbum anidado
- **WHEN** una obra declara pertenecer al álbum de otra obra que a su vez pertenece a un álbum
- **THEN** la construcción del sitio falla identificando ambas obras

#### Scenario: Obra en su propio álbum
- **WHEN** una obra declara pertenecer a su propio álbum
- **THEN** la construcción del sitio falla identificando la obra

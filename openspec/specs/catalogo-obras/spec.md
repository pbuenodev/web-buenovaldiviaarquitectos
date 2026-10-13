# catalogo-obras Specification

## Purpose

Define qué es una obra dentro del sitio, qué datos y fotografías la componen y cómo se valida ese contenido, de modo que el equipo pueda agregar, quitar o reordenar obras sin modificar el código de las páginas.

## Requirements

### Requirement: Datos de una obra
Cada obra SHALL tener un identificador de URL (slug) único, un nombre, una ciudad, una ubicación completa, una categoría y una posición de orden. Las obras no llevan texto descriptivo.

#### Scenario: Obra completa
- **WHEN** una obra declara nombre, ciudad, ubicación, categoría y orden, y tiene al menos una fotografía
- **THEN** el sitio se construye e incluye esa obra en la grilla de inicio y con su propia ficha

#### Scenario: Falta un dato obligatorio
- **WHEN** una obra no declara alguno de los datos obligatorios
- **THEN** la construcción del sitio falla con un mensaje que identifica la obra y el dato faltante

#### Scenario: Slug repetido
- **WHEN** dos obras resuelven al mismo slug
- **THEN** la construcción del sitio falla identificando el slug en conflicto

### Requirement: Categorías cerradas
La categoría de una obra MUST ser exactamente una de dos: `casas` (rotulada "Casas") o `edificios` (rotulada "Edificios públicos").

#### Scenario: Categoría desconocida
- **WHEN** una obra declara una categoría distinta de `casas` o `edificios`
- **THEN** la construcción del sitio falla indicando la obra y el valor no admitido

### Requirement: Fotografías de una obra
Cada obra SHALL tener al menos una fotografía. Las fotografías de una obra SHALL presentarse en el orden alfabético de sus nombres de archivo, y todas las fotografías presentes en la carpeta de la obra SHALL mostrarse en su ficha.

#### Scenario: Obra con diez fotos
- **WHEN** la carpeta de una obra contiene cinco fotos `exterior-01` a `exterior-05` y cinco `interior-01` a `interior-05`
- **THEN** la ficha muestra las diez, primero las exteriores y luego las interiores, cada grupo en orden numérico

#### Scenario: Obra sin fotos
- **WHEN** la carpeta de una obra no contiene ninguna fotografía
- **THEN** la construcción del sitio falla identificando la obra

### Requirement: Portada de una obra
Cada obra SHALL tener una fotografía de portada. Por defecto es la primera fotografía de la obra; la obra MAY indicar otra por su nombre de archivo.

#### Scenario: Portada por defecto
- **WHEN** una obra no indica portada
- **THEN** su portada es la primera fotografía según el orden de la obra

#### Scenario: Portada inexistente
- **WHEN** una obra indica como portada un archivo que no existe en su carpeta
- **THEN** la construcción del sitio falla identificando la obra y el archivo

### Requirement: Participación en el carrusel
El carrusel de inicio SHALL componerse únicamente de las obras que declaran participar en él, cada una indicando qué fotografía suya se usa y en qué posición aparece. El carrusel MUST tener al menos una lámina.

#### Scenario: Obra con fotografía de carrusel
- **WHEN** una obra declara una fotografía y una posición para el carrusel
- **THEN** el carrusel de inicio incluye una lámina de esa obra con esa fotografía en esa posición

#### Scenario: Ninguna obra en el carrusel
- **WHEN** ninguna obra declara participación en el carrusel
- **THEN** la construcción del sitio falla indicando que el carrusel no tiene láminas

### Requirement: Orden de las obras
Las obras SHALL listarse en orden ascendente según su posición de orden, tanto en la grilla de inicio como al determinar cuál es la obra siguiente.

#### Scenario: Reordenar obras
- **WHEN** se intercambian las posiciones de orden de dos obras
- **THEN** ambas intercambian su lugar en la grilla y cambia en consecuencia la obra siguiente de cada una

### Requirement: Agregar una obra sin tocar código
Agregar una obra nueva SHALL requerir únicamente añadir su carpeta con sus datos y fotografías.

#### Scenario: Obra nueva
- **WHEN** se añade una carpeta de obra válida y se reconstruye el sitio
- **THEN** la obra aparece en la grilla, responde al filtro de su categoría y tiene ficha propia, sin cambios en ningún otro archivo

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

### Requirement: Fotografías de una obra
Cada obra SHALL tener al menos una fotografía. Las fotografías de una obra SHALL presentarse en el orden alfabético de sus nombres de archivo, y todas las fotografías presentes en la carpeta de la obra SHALL mostrarse en su ficha. Un número de dos dígitos al final del nombre decide el orden entre fotos con el mismo prefijo.

#### Scenario: Obra con diez fotos
- **WHEN** la carpeta de una obra contiene diez fotos `foto-01` a `foto-10`
- **THEN** la ficha muestra las diez en orden numérico, de `foto-01` a `foto-10`

#### Scenario: Cambiar el orden de una foto
- **WHEN** se renombra `foto-05` como `foto-01` y `foto-01` como `foto-05` en la carpeta de una obra
- **THEN** la ficha muestra ambas fotos con sus posiciones intercambiadas

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
Las obras SHALL listarse en orden ascendente según su posición de orden, tanto en la grilla de inicio como al determinar cuál es la obra siguiente. Las obras de un mismo álbum SHALL listarse entre sí con la misma regla.

#### Scenario: Reordenar obras
- **WHEN** se intercambian las posiciones de orden de dos obras
- **THEN** ambas intercambian su lugar en la grilla y cambia en consecuencia la obra siguiente de cada una

#### Scenario: Reordenar obras de un álbum
- **WHEN** se intercambian las posiciones de orden de dos lotes del condominio Bosque Golf
- **THEN** ambos intercambian su lugar en la ficha del condominio

### Requirement: Agregar una obra sin tocar código
Agregar una obra nueva SHALL requerir únicamente añadir su carpeta con sus datos y fotografías.

#### Scenario: Obra nueva
- **WHEN** se añade una carpeta de obra válida y se reconstruye el sitio
- **THEN** la obra aparece en la grilla, responde al filtro de su categoría y tiene ficha propia, sin cambios en ningún otro archivo

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

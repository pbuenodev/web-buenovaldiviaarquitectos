## MODIFIED Requirements

### Requirement: Encabezado de la ficha
La ficha SHALL mostrar un enlace de regreso, el nombre de la obra como título principal en mayúsculas y, debajo, su ubicación completa. El título MUST ser más pequeño que antes de este cambio y medir como máximo 64 px de alto de letra. El enlace de regreso SHALL ser "← Obras" hacia el inicio y, en una obra que pertenece a un álbum, "← <nombre del álbum>" hacia la ficha de ese álbum. La ficha MUST NOT incluir texto descriptivo de la obra.

#### Scenario: Contenido del encabezado
- **WHEN** se abre la ficha de "Casa La Quebrada"
- **THEN** el título principal es el nombre de la obra y bajo él aparece "Viña del Mar, Valparaíso"

#### Scenario: Tamaño del título
- **WHEN** se abre una ficha en una pantalla de 1440 px de ancho
- **THEN** el título mide como máximo 64 px de alto de letra y un nombre de obra largo cabe en no más de dos líneas

#### Scenario: Volver a las obras
- **WHEN** la persona pulsa "← Obras"
- **THEN** navega a la página de inicio

#### Scenario: Volver al álbum desde un lote
- **WHEN** la persona abre la ficha de "Bosque Golf, Lote 1" y pulsa "← Bosque Golf, El Condominio"
- **THEN** navega a la ficha del condominio

### Requirement: Siguiente obra
Al final de la ficha SHALL haber un enlace "Siguiente obra" con la miniatura de la portada y el nombre de la obra que sigue. En una obra que no pertenece a un álbum, la siguiente SHALL ser la que sigue en el orden del catálogo entre las obras que tampoco pertenecen a uno. En una obra que pertenece a un álbum, la siguiente SHALL ser la que sigue entre las obras de ese mismo álbum. Desde la última, la siguiente SHALL ser la primera.

#### Scenario: Obra intermedia
- **WHEN** la persona pulsa "Siguiente obra" en una ficha que no es la última
- **THEN** navega a la ficha de la obra siguiente en el catálogo y la ve desde arriba

#### Scenario: Última obra
- **WHEN** la persona pulsa "Siguiente obra" en la última obra del catálogo
- **THEN** navega a la ficha de la primera obra

#### Scenario: El recorrido del catálogo salta los lotes
- **WHEN** la persona recorre "Siguiente obra" desde la primera obra de la grilla hasta volver a ella
- **THEN** pasa por todas las obras de la grilla y por ningún lote

#### Scenario: Recorrer los lotes de un álbum
- **WHEN** la persona pulsa "Siguiente obra" en la ficha de "Bosque Golf, Lote 1"
- **THEN** navega a la ficha de "Bosque Golf, Lote 2"; y desde el último lote vuelve a "Bosque Golf, Lote 1"

## ADDED Requirements

### Requirement: Obras internas de un álbum
La ficha de una obra que tiene obras en su álbum SHALL mostrar, después de sus fotografías y antes de "Siguiente obra", un bloque titulado con el rótulo "Lotes". El bloque SHALL tener una tarjeta por cada obra interna, en su orden, con su portada en proporción 4:3 y su nombre, y cada tarjeta SHALL enlazar a la ficha de esa obra. Una ficha sin obras internas MUST NOT mostrar el bloque.

#### Scenario: Ficha del condominio
- **WHEN** se abre la ficha de "Bosque Golf, El Condominio"
- **THEN** después de sus fotos se ve el bloque "Lotes" con las tarjetas de los lotes 1, 2, 4 y 5, en ese orden

#### Scenario: Abrir un lote
- **WHEN** la persona pulsa la tarjeta de "Bosque Golf, Lote 4" en la ficha del condominio
- **THEN** navega a `/obras/bosque-golf-lote-4/` y ve la ficha del lote con todas sus fotos

#### Scenario: Ficha sin álbum
- **WHEN** se abre la ficha de "Pub Los Amigos"
- **THEN** no se ve el bloque "Lotes"

#### Scenario: Disposición de las tarjetas
- **WHEN** se abre la ficha del condominio en pantallas de 390 px y de 1440 px de ancho
- **THEN** las tarjetas de los lotes se ven en 2 y en 3 columnas respectivamente, sin desbordar la pantalla

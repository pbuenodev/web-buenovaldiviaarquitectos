# ficha-obra Specification

## Purpose

Describe la página de detalle de una obra: una ficha casi sin texto donde las fotografías son protagonistas y que termina invitando a ver la obra siguiente o a escribir por WhatsApp.

## Requirements

### Requirement: Dirección propia por obra
Cada obra SHALL tener una página en `/obras/<slug>/` que pueda abrirse directamente desde un enlace compartido.

#### Scenario: Abrir un enlace compartido
- **WHEN** una persona abre `/obras/casa-la-quebrada/` desde un mensaje, sin pasar por el inicio
- **THEN** ve la ficha de esa obra completa

#### Scenario: Obra inexistente
- **WHEN** una persona abre `/obras/<slug>/` con un slug que no corresponde a ninguna obra
- **THEN** ve la página de "no encontrado" del sitio

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

### Requirement: Fotografías apiladas
La ficha SHALL mostrar todas las fotografías de la obra en el orden del catálogo, sin recortes. En pantallas de hasta 1080 px de ancho SHALL presentarlas en una sola columna centrada, con separación amplia entre ellas (alrededor de 96 px desde 720 px y 40 px en teléfono). En pantallas de más de 1080 px SHALL presentarlas en 2 columnas, leídas de izquierda a derecha y de arriba abajo.

#### Scenario: Obra con diez fotografías
- **WHEN** se abre la ficha de una obra con diez fotografías en una pantalla de 390 px de ancho
- **THEN** se ven las diez, una bajo otra, sin recortes

#### Scenario: Dos columnas en escritorio
- **WHEN** se abre la ficha de una obra con diez fotografías en una pantalla de 1440 px de ancho
- **THEN** se ven las diez en 5 filas de 2, sin recortes, la primera arriba a la izquierda y la segunda a su derecha

#### Scenario: Límite de 1080 px
- **WHEN** se abre una ficha en una pantalla de exactamente 1080 px de ancho
- **THEN** las fotografías se ven en una sola columna

#### Scenario: Cantidad impar de fotografías
- **WHEN** se abre en una pantalla de 1440 px la ficha de una obra con un número impar de fotografías
- **THEN** la última fotografía queda sola en su fila, centrada y con el ancho de una columna

### Requirement: Fotografías angostas
En la disposición de una columna, las fotografías verticales y las de baja resolución (menos de 900 px de ancho en su archivo de origen) SHALL mostrarse más angostas y centradas: como máximo 680 px de ancho desde 720 px y al 78 % del ancho en teléfono; las demás SHALL ocupar todo el ancho de la columna. En la disposición de 2 columnas, toda fotografía SHALL ocupar el ancho de su columna sin ampliarse más allá de su tamaño de origen, centrada en ella.

#### Scenario: Fotografía horizontal de buena resolución
- **WHEN** una fotografía es horizontal y mide 900 px de ancho o más, en una pantalla de hasta 1080 px
- **THEN** ocupa el ancho completo de la columna

#### Scenario: Fotografía antigua de baja resolución
- **WHEN** una fotografía mide menos de 900 px de ancho
- **THEN** se muestra angosta y centrada, sin ampliarse más allá de su tamaño de origen

#### Scenario: Fotografía vertical
- **WHEN** una fotografía es más alta que ancha, en una pantalla de hasta 1080 px
- **THEN** se muestra angosta y centrada

#### Scenario: Fotografía vertical en dos columnas
- **WHEN** una fotografía es más alta que ancha y se ve en una pantalla de 1440 px
- **THEN** ocupa el ancho de su columna, completa y sin recortes

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

### Requirement: Consulta por WhatsApp desde la ficha
La ficha SHALL terminar con un botón "Consultar por WhatsApp", con el logo oficial de WhatsApp en sus colores originales a la izquierda del texto, que abre una conversación con el número de la oficina y un mensaje ya escrito que nombra la obra.

#### Scenario: Consultar por una obra
- **WHEN** la persona pulsa "Consultar por WhatsApp" en la ficha de "Edificio Los Leones"
- **THEN** se abre WhatsApp en una pestaña nueva con el mensaje "Hola, vi el proyecto Edificio Los Leones en su portafolio y me gustaría conversar."

#### Scenario: Botón con logo
- **WHEN** la persona llega al final de una ficha
- **THEN** el botón "Consultar por WhatsApp" muestra el logo oficial de WhatsApp junto al texto

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

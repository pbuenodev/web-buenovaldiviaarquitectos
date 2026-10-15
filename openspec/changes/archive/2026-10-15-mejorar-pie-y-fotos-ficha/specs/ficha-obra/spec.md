# Spec Delta

## MODIFIED Requirements

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

### Requirement: Consulta por WhatsApp desde la ficha
La ficha SHALL terminar con un botón "Consultar por WhatsApp", con el logo oficial de WhatsApp en sus colores originales a la izquierda del texto, que abre una conversación con el número de la oficina y un mensaje ya escrito que nombra la obra.

#### Scenario: Consultar por una obra
- **WHEN** la persona pulsa "Consultar por WhatsApp" en la ficha de "Edificio Los Leones"
- **THEN** se abre WhatsApp en una pestaña nueva con el mensaje "Hola, vi el proyecto Edificio Los Leones en su portafolio y me gustaría conversar."

#### Scenario: Botón con logo
- **WHEN** la persona llega al final de una ficha
- **THEN** el botón "Consultar por WhatsApp" muestra el logo oficial de WhatsApp junto al texto

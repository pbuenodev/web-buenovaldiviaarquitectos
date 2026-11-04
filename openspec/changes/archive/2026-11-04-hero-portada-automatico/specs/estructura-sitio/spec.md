## MODIFIED Requirements

### Requirement: Cabecera común
Todas las páginas SHALL mostrar una cabecera con el logo de la oficina (su marca) centrado, que enlaza al inicio, y un botón de menú tipo hamburguesa a la derecha. En el inicio la cabecera SHALL ir superpuesta y transparente sobre la fotografía de la portada; en las demás páginas SHALL tener fondo azul marino. El menú SHALL listar "Obras", "Contacto" y las redes de la oficina que tengan dirección, y SHALL poder abrirse y cerrarse sin scripts.

#### Scenario: Volver al inicio desde el logo
- **WHEN** la persona pulsa el logo desde una ficha
- **THEN** navega a la página de inicio

#### Scenario: Logo accesible
- **WHEN** un lector de pantalla llega al logo
- **THEN** lo anuncia como "Bueno Valdivia Arquitectos"

#### Scenario: Cabecera sobre la portada
- **WHEN** se abre la página de inicio
- **THEN** el logo y el botón de menú se ven sobre la fotografía, sin franja de color propia, y siguen legibles sobre cualquier fotografía de la portada

#### Scenario: Cabecera en otras páginas
- **WHEN** se abre la ficha de una obra o la página de "no encontrado"
- **THEN** la cabecera tiene fondo azul marino con el mismo logo centrado y el mismo botón de menú

#### Scenario: Abrir y usar el menú
- **WHEN** la persona pulsa el botón de menú y luego "Contacto"
- **THEN** el menú se cierra y la página se desplaza al bloque de contacto del pie

#### Scenario: Menú anunciado
- **WHEN** un lector de pantalla llega al botón de menú
- **THEN** lo anuncia con un nombre como "Menú" y, si está abierto, lo indica

### Requirement: Identidad visual
El sitio SHALL usar azul marino `#0d1828` en la cabecera de las páginas interiores, el velo de la portada y el pie; fondo claro `#f4f3ef` en el contenido; y la tipografía Archivo, con títulos grandes en mayúsculas de trazo condensado y texto pequeño en mayúsculas espaciadas para rótulos y enlaces. El logo SHALL usarse en su versión clara sobre fondo azul o fotografía.

#### Scenario: Coherencia entre páginas
- **WHEN** se comparan el inicio, una ficha y la página de "no encontrado"
- **THEN** las tres usan los mismos colores, la misma tipografía y la misma cabecera y pie

#### Scenario: Contraste del texto
- **WHEN** se mide el contraste del texto pequeño sobre sus fondos
- **THEN** cumple al menos la relación 4,5:1

#### Scenario: Contraste sobre la portada
- **WHEN** se mide el contraste del nombre de la oficina y del logo sobre cada fotografía de la portada con su velo
- **THEN** cumple al menos la relación 4,5:1 para el texto pequeño y 3:1 para el título y el logo

### Requirement: Navegación con teclado
Todos los enlaces y botones SHALL poder alcanzarse y activarse con el teclado, con un indicador de foco visible, y las áreas pulsables de la navegación SHALL medir al menos 44 px de alto.

#### Scenario: Recorrido con tabulador
- **WHEN** la persona recorre el inicio con la tecla Tab
- **THEN** pasa por el logo, el botón de menú, los filtros, cada obra y los enlaces del pie, viendo siempre dónde está el foco

#### Scenario: Menú con teclado
- **WHEN** la persona abre el menú con Enter o Espacio y lo cierra con Escape
- **THEN** el menú se abre y se cierra, y el foco vuelve al botón de menú

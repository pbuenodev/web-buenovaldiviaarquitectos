# Spec Delta

## Purpose

Reúne lo que comparten todas las páginas del portafolio: cabecera, identidad visual, comportamiento en teléfono y escritorio, página de "no encontrado", vista previa al compartir el enlace y visibilidad ante buscadores.

## ADDED Requirements

### Requirement: Cabecera común
Todas las páginas SHALL mostrar una cabecera de fondo azul marino con el logo de la oficina a la izquierda, que enlaza al inicio, y el enlace "Contacto" a la derecha.

#### Scenario: Volver al inicio desde el logo
- **WHEN** la persona pulsa el logo desde una ficha
- **THEN** navega a la página de inicio

#### Scenario: Logo accesible
- **WHEN** un lector de pantalla llega al logo
- **THEN** lo anuncia como "Bueno Valdivia Arquitectos"

### Requirement: Identidad visual
El sitio SHALL usar azul marino `#0d1828` en cabecera, carrusel y pie; fondo claro `#f4f3ef` en el contenido; y la tipografía Archivo, con títulos grandes en mayúsculas de trazo condensado y texto pequeño en mayúsculas espaciadas para rótulos y enlaces. El logo SHALL usarse en su versión clara sobre fondo azul.

#### Scenario: Coherencia entre páginas
- **WHEN** se comparan el inicio, una ficha y la página de "no encontrado"
- **THEN** las tres usan los mismos colores, la misma tipografía y la misma cabecera y pie

#### Scenario: Contraste del texto
- **WHEN** se mide el contraste del texto pequeño sobre sus fondos
- **THEN** cumple al menos la relación 4,5:1

### Requirement: Recursos servidos desde el propio sitio
Las páginas MUST NOT solicitar tipografías, estilos, scripts ni imágenes a dominios de terceros.

#### Scenario: Carga de una página
- **WHEN** se abre cualquier página del sitio y se revisan las solicitudes de red
- **THEN** todas van al dominio del propio sitio

### Requirement: Diseño adaptable
El sitio SHALL presentarse correctamente desde 320 px de ancho, con una disposición para teléfono por debajo de 720 px y otra para pantallas mayores, sin desplazamiento horizontal en ningún ancho.

#### Scenario: Teléfono
- **WHEN** se abre el sitio en una pantalla de 390 px de ancho
- **THEN** la grilla tiene 2 columnas, los márgenes y el logo son los de teléfono y nada desborda la pantalla

#### Scenario: Escritorio
- **WHEN** se abre el sitio en una pantalla de 1440 px de ancho
- **THEN** la grilla tiene 3 columnas y el contenido se centra con un ancho máximo de 1440 px

### Requirement: Navegación con teclado
Todos los enlaces y botones SHALL poder alcanzarse y activarse con el teclado, con un indicador de foco visible, y las áreas pulsables de la navegación SHALL medir al menos 44 px de alto.

#### Scenario: Recorrido con tabulador
- **WHEN** la persona recorre el inicio con la tecla Tab
- **THEN** pasa por el logo, Contacto, los controles del carrusel, los filtros, cada obra y los enlaces del pie, viendo siempre dónde está el foco

### Requirement: Página de no encontrado
Las direcciones que no corresponden a ninguna página SHALL mostrar una página con la cabecera y el pie del sitio, un mensaje breve y un enlace para volver a las obras.

#### Scenario: Dirección inexistente
- **WHEN** una persona abre una dirección que no existe
- **THEN** ve la página de "no encontrado" con un enlace al inicio

### Requirement: Vista previa al compartir
Cada página SHALL declarar título, descripción e imagen de vista previa para que al compartir su enlace por WhatsApp se muestre una tarjeta. La ficha de una obra SHALL usar el nombre de la obra y su portada; el inicio, el nombre de la oficina y una fotografía representativa.

#### Scenario: Compartir una obra
- **WHEN** se pega en WhatsApp el enlace de la ficha de "Casas Chicureo"
- **THEN** la tarjeta muestra "Casas Chicureo", el nombre de la oficina y la portada de la obra

#### Scenario: Formato de la imagen de vista previa
- **WHEN** se revisa la imagen de vista previa de cualquier página
- **THEN** es un JPEG de 1200 × 630 px con dirección absoluta

### Requirement: Idioma del sitio
Todo el contenido SHALL estar en español y cada página SHALL declarar el idioma español.

#### Scenario: Idioma declarado
- **WHEN** un navegador o lector de pantalla carga cualquier página
- **THEN** detecta que el idioma es español

### Requirement: Exclusión de buscadores mientras está en prueba
El sitio SHALL pedir a los buscadores que no lo indexen, en todas sus páginas, salvo que se active de forma explícita la indexación al construirlo.

#### Scenario: Construcción por defecto
- **WHEN** el sitio se construye sin activar la indexación
- **THEN** todas las páginas indican a los buscadores que no las indexen

#### Scenario: Indexación activada
- **WHEN** el sitio se construye con la indexación activada
- **THEN** ninguna página incluye esa indicación

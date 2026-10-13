# imagenes Specification

## Purpose

Define cómo se entregan las fotografías al visitante para que el portafolio cargue rápido en teléfonos con datos móviles sin perder calidad visible, que es el principal riesgo de un sitio cuyo contenido son las fotos.

## Requirements

### Requirement: Formatos modernos con respaldo
Cada fotografía SHALL ofrecerse en AVIF y en WebP, de modo que el navegador use AVIF cuando lo admite y WebP en caso contrario.

#### Scenario: Navegador con AVIF
- **WHEN** un navegador que admite AVIF carga una fotografía
- **THEN** descarga la versión AVIF

#### Scenario: Navegador sin AVIF
- **WHEN** un navegador que no admite AVIF carga una fotografía
- **THEN** descarga la versión WebP y la fotografía se ve igualmente

### Requirement: Tamaño según la pantalla
Cada fotografía SHALL ofrecerse en varios anchos para que el navegador descargue el adecuado al espacio que ocupa y a la densidad de la pantalla. Ninguna versión MUST superar el ancho del archivo de origen.

#### Scenario: Miniatura en teléfono
- **WHEN** un teléfono carga la grilla de obras, donde cada portada ocupa media pantalla
- **THEN** descarga una versión cercana a ese tamaño y no la de ancho completo

#### Scenario: Fotografía de origen pequeña
- **WHEN** una fotografía de origen mide 800 px de ancho
- **THEN** no se genera ni se sirve ninguna versión de más de 800 px

### Requirement: Peso máximo
La versión AVIF más grande de cada fotografía MUST pesar 300 KB o menos.

#### Scenario: Verificación del peso
- **WHEN** se construye el sitio y se revisan las imágenes generadas
- **THEN** ninguna versión AVIF supera los 300 KB; si alguna lo hace, la verificación falla nombrando el archivo

### Requirement: Sin saltos de contenido
Toda fotografía SHALL reservar su espacio antes de cargar, de forma que el contenido no se desplace cuando la imagen aparece.

#### Scenario: Carga lenta de una ficha
- **WHEN** una ficha se abre con una conexión lenta
- **THEN** los espacios de las fotografías ya tienen su tamaño final, con un fondo neutro, y el texto no se mueve al completarse la carga

### Requirement: Prioridad de carga
La fotografía de la primera lámina del carrusel SHALL cargarse con prioridad. Las demás fotografías del sitio SHALL cargarse de forma diferida, a medida que se acercan a la zona visible o a su turno en el carrusel.

#### Scenario: Primera pantalla del inicio
- **WHEN** se abre la página de inicio
- **THEN** la primera fotografía del carrusel se solicita de inmediato y con prioridad, y las portadas de la grilla quedan marcadas para carga diferida, de modo que el navegador las solicita al acercarse a la zona visible

#### Scenario: Láminas siguientes del carrusel
- **WHEN** se abre la página de inicio y aún no ha cambiado la lámina
- **THEN** no se han descargado las fotografías de todas las láminas; cada una se obtiene antes de su turno para que el fundido no muestre una imagen a medio cargar

### Requirement: Texto alternativo
Toda fotografía de contenido SHALL tener un texto alternativo que incluya el nombre de la obra. Las imágenes decorativas SHALL marcarse como tales.

#### Scenario: Lector de pantalla en la grilla
- **WHEN** un lector de pantalla recorre la grilla de obras
- **THEN** cada portada se anuncia con el nombre de su obra

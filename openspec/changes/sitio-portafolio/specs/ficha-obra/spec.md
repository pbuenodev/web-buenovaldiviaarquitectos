# Spec Delta

## Purpose

Describe la página de detalle de una obra: una ficha casi sin texto donde las fotografías son protagonistas y que termina invitando a ver la obra siguiente o a escribir por WhatsApp.

## ADDED Requirements

### Requirement: Dirección propia por obra
Cada obra SHALL tener una página en `/obras/<slug>/` que pueda abrirse directamente desde un enlace compartido.

#### Scenario: Abrir un enlace compartido
- **WHEN** una persona abre `/obras/casa-la-quebrada/` desde un mensaje, sin pasar por el inicio
- **THEN** ve la ficha de esa obra completa

#### Scenario: Obra inexistente
- **WHEN** una persona abre `/obras/<slug>/` con un slug que no corresponde a ninguna obra
- **THEN** ve la página de "no encontrado" del sitio

### Requirement: Encabezado de la ficha
La ficha SHALL mostrar un enlace "← Obras" que vuelve al inicio, el nombre de la obra como título principal en mayúsculas de gran tamaño y, debajo, su ubicación completa. La ficha MUST NOT incluir texto descriptivo de la obra.

#### Scenario: Contenido del encabezado
- **WHEN** se abre la ficha de "Casa La Quebrada"
- **THEN** el título principal es el nombre de la obra y bajo él aparece "Viña del Mar, Valparaíso"

#### Scenario: Volver a las obras
- **WHEN** la persona pulsa "← Obras"
- **THEN** navega a la página de inicio

### Requirement: Fotografías apiladas
La ficha SHALL mostrar todas las fotografías de la obra en una sola columna centrada, en el orden del catálogo, con separación amplia entre ellas (alrededor de 96 px en escritorio y 40 px en teléfono).

#### Scenario: Obra con diez fotografías
- **WHEN** se abre la ficha de una obra con diez fotografías
- **THEN** se ven las diez, una bajo otra, sin recortes

### Requirement: Fotografías angostas
Las fotografías verticales y las de baja resolución (menos de 900 px de ancho en su archivo de origen) SHALL mostrarse más angostas y centradas: como máximo 680 px de ancho en escritorio y al 78 % del ancho en teléfono. Las demás SHALL ocupar todo el ancho de la columna.

#### Scenario: Fotografía horizontal de buena resolución
- **WHEN** una fotografía es horizontal y mide 900 px de ancho o más
- **THEN** ocupa el ancho completo de la columna

#### Scenario: Fotografía antigua de baja resolución
- **WHEN** una fotografía mide menos de 900 px de ancho
- **THEN** se muestra angosta y centrada, sin ampliarse más allá de su tamaño de origen

#### Scenario: Fotografía vertical
- **WHEN** una fotografía es más alta que ancha
- **THEN** se muestra angosta y centrada

### Requirement: Siguiente obra
Al final de la ficha SHALL haber un enlace "Siguiente obra" con la miniatura de la portada y el nombre de la obra que sigue en el orden del catálogo. Desde la última obra, la siguiente SHALL ser la primera.

#### Scenario: Obra intermedia
- **WHEN** la persona pulsa "Siguiente obra" en una ficha que no es la última
- **THEN** navega a la ficha de la obra siguiente en el catálogo y la ve desde arriba

#### Scenario: Última obra
- **WHEN** la persona pulsa "Siguiente obra" en la última obra del catálogo
- **THEN** navega a la ficha de la primera obra

### Requirement: Consulta por WhatsApp desde la ficha
La ficha SHALL terminar con un botón "Consultar por WhatsApp" que abre una conversación con el número de la oficina y un mensaje ya escrito que nombra la obra.

#### Scenario: Consultar por una obra
- **WHEN** la persona pulsa "Consultar por WhatsApp" en la ficha de "Edificio Los Leones"
- **THEN** se abre WhatsApp en una pestaña nueva con el mensaje "Hola, vi el proyecto Edificio Los Leones en su portafolio y me gustaría conversar."

# contacto Specification

## Purpose

Describe cómo una persona que recorre el portafolio llega a contactar a la oficina: un contacto discreto pero siempre accesible, por WhatsApp y redes sociales, sin formulario.

## Requirements

### Requirement: Sección de contacto en todas las páginas
Todas las páginas SHALL terminar con una sección de contacto sobre fondo azul que muestra el rótulo "Contacto", el nombre "Bueno Valdivia Arquitectos" en gran tamaño, el botón de WhatsApp, el número de teléfono, los enlaces a redes sociales, la marca de la oficina y el texto "Chile · Más de 30 años". El sitio MUST NOT incluir formulario de contacto ni mapa.

#### Scenario: Contacto al final del inicio
- **WHEN** la persona llega al final de la página de inicio
- **THEN** ve la sección de contacto completa

#### Scenario: Contacto al final de una ficha
- **WHEN** la persona llega al final de la ficha de cualquier obra
- **THEN** ve la misma sección de contacto

### Requirement: Acceso al contacto desde la cabecera
La cabecera SHALL incluir un enlace "Contacto" que lleva a la sección de contacto de la página actual, con desplazamiento suave salvo cuando el dispositivo prefiere movimiento reducido.

#### Scenario: Ir al contacto desde una ficha
- **WHEN** la persona pulsa "Contacto" en la cabecera mientras ve una ficha
- **THEN** la página se desplaza hasta la sección de contacto sin salir de la ficha

#### Scenario: Enlace directo al contacto
- **WHEN** una persona abre la dirección del inicio terminada en `#contacto`
- **THEN** la página se abre posicionada en la sección de contacto

### Requirement: Escribir por WhatsApp
El botón "Escribir por WhatsApp" SHALL abrir, en una pestaña nueva, una conversación con el número de la oficina y el mensaje "Hola, vi su portafolio y me gustaría conversar sobre un proyecto." ya escrito. El botón SHALL mostrar el logo oficial de WhatsApp, en sus colores originales, a la izquierda del texto. El número SHALL mostrarse también como texto junto al botón.

#### Scenario: Abrir la conversación
- **WHEN** la persona pulsa "Escribir por WhatsApp"
- **THEN** se abre una conversación de WhatsApp con el número de la oficina y el mensaje general ya escrito

#### Scenario: Número con espacios y signo más
- **WHEN** el número configurado es `+56 9 0000 0000`
- **THEN** se muestra tal cual junto al botón y el enlace usa solo sus dígitos (`56900000000`)

#### Scenario: Botón reconocible como WhatsApp
- **WHEN** la persona llega a la sección de contacto
- **THEN** el botón muestra el logo oficial de WhatsApp en sus colores originales junto al texto "Escribir por WhatsApp"

#### Scenario: Nombre accesible del botón
- **WHEN** un lector de pantalla llega al botón
- **THEN** lo anuncia como "Escribir por WhatsApp", sin leer el logo por separado

### Requirement: Redes sociales
La sección de contacto SHALL incluir enlaces a Instagram y a Facebook que se abren en una pestaña nueva. Cada enlace SHALL mostrar el logo oficial de su red junto a su nombre, en una versión monocromática clara legible sobre el fondo azul.

#### Scenario: Abrir Instagram
- **WHEN** la persona pulsa "Instagram"
- **THEN** el perfil configurado se abre en una pestaña nueva y el portafolio sigue abierto

#### Scenario: Red social sin dirección configurada
- **WHEN** una red social no tiene dirección configurada
- **THEN** su enlace no se muestra, ni su logo

#### Scenario: Logo de cada red
- **WHEN** la persona ve los enlaces a redes en el pie
- **THEN** el enlace a Instagram muestra el logo de Instagram y el de Facebook el logo de Facebook, cada uno junto al nombre de la red

### Requirement: Datos de contacto en un único lugar
El número de WhatsApp, los mensajes ya escritos y las direcciones de las redes SHALL definirse en un único lugar del proyecto, de modo que cambiarlos allí los actualice en todas las páginas.

#### Scenario: Cambiar el número
- **WHEN** se cambia el número de WhatsApp en la configuración y se reconstruye el sitio
- **THEN** el botón del pie, el número visible y el botón de todas las fichas usan el número nuevo

### Requirement: Logos de marcas desde fuentes oficiales
Los logos de WhatsApp, Instagram y Facebook SHALL provenir de los recursos de marca oficiales de cada empresa, en formato SVG, y SHALL servirse desde el propio sitio, sin alterar su forma ni sus proporciones.

#### Scenario: Carga del pie
- **WHEN** se abre cualquier página y se revisan las solicitudes de red
- **THEN** ningún logo de marca se solicita a un dominio de terceros

#### Scenario: Nitidez en pantallas de alta densidad
- **WHEN** se ve el pie en una pantalla de alta densidad
- **THEN** los logos se ven nítidos, sin pixelado

### Requirement: Tamaño de la marca en el pie
La marca de Bueno Valdivia Arquitectos en el cierre del pie SHALL mostrarse con 40 px de alto en teléfono y 48 px de alto desde 720 px de ancho, conservando sus proporciones.

#### Scenario: Marca en escritorio
- **WHEN** se abre el sitio en una pantalla de 1440 px de ancho
- **THEN** la marca del cierre del pie mide 48 px de alto

#### Scenario: Marca en teléfono
- **WHEN** se abre el sitio en una pantalla de 390 px de ancho
- **THEN** la marca del cierre del pie mide 40 px de alto y nada desborda la pantalla

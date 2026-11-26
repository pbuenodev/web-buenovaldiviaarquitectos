# Spec Delta

## ADDED Requirements

### Requirement: Fotografías de la portada del inicio
La portada del inicio SHALL tener su propio conjunto de fotografías, presentadas en el orden de sus nombres de archivo. Cada fotografía SHALL indicar a qué obra del catálogo corresponde. Una misma obra MAY aportar varias fotografías, y estas MUST NOT agregarse a la ficha de esa obra. El conjunto MUST tener al menos una fotografía.

#### Scenario: Varias fotos de una obra
- **WHEN** la selección de la portada incluye dos fotografías del Edificio Central Tráfico Alameda
- **THEN** la portada muestra ambas, cada una en su posición

#### Scenario: Foto de portada que no está en la ficha
- **WHEN** una fotografía de la portada no está entre las fotografías de su obra
- **THEN** la ficha de esa obra no la muestra

#### Scenario: Portada sin fotografías
- **WHEN** la selección de la portada está vacía
- **THEN** la construcción del sitio falla indicando que la portada no tiene fotografías

#### Scenario: Obra inexistente
- **WHEN** una fotografía de la portada se asocia a un slug que no corresponde a ninguna obra
- **THEN** la construcción del sitio falla identificando la fotografía y el slug

### Requirement: Sin fotografías repetidas
El catálogo MUST NOT mostrar dos veces la misma imagen, ni dentro de una obra ni entre obras distintas, aunque tengan otro nombre, otro tamaño u otra compresión. Al importar la entrega del cliente, dos fotografías que se ven iguales SHALL hacer fallar la importación, salvo que la obra declare el par como repetido. En ese caso se conserva una sola: la de mayor resolución, en la posición más temprana del par. Las fotografías de la portada del inicio quedan fuera de esta comparación.

#### Scenario: Misma foto en dos tamaños
- **WHEN** una obra trae la misma imagen como `00.webp` (576 px) y `07.webp` (1024 px) y declara el par como repetido
- **THEN** la ficha la muestra una sola vez, en la primera posición, con la versión de 1024 px

#### Scenario: Repetida no declarada
- **WHEN** dos fotografías de la entrega se ven iguales y ninguna obra declara el par
- **THEN** la importación falla nombrando ambos archivos

#### Scenario: Fotos parecidas pero distintas
- **WHEN** una obra trae dos tomas del mismo edificio desde ángulos o con luces distintas
- **THEN** la importación no las trata como repetidas y la ficha muestra ambas

## MODIFIED Requirements

### Requirement: Obras dentro del álbum de otra obra
Una obra MAY declarar que pertenece al álbum de otra obra, indicando el slug de esa obra. Una obra que pertenece a un álbum SHALL seguir teniendo todos los datos obligatorios, fotografías y ficha propia. Declarar la pertenencia SHALL requerir únicamente un dato en la carpeta de la obra interna, sin cambios en el código.

#### Scenario: Lotes del condominio
- **WHEN** los lotes 1, 2, 3, 4 y 5 de Bosque Golf declaran pertenecer al álbum de "Bosque Golf, El Condominio"
- **THEN** el sitio se construye, el condominio tiene cinco obras internas y cada lote conserva su ficha en `/obras/<slug>/`

#### Scenario: Agregar un lote nuevo
- **WHEN** se añade una carpeta de obra válida que declara pertenecer al álbum del condominio y se reconstruye el sitio
- **THEN** el lote aparece en la ficha del condominio en la posición que indica su orden, sin cambios en ningún otro archivo

## REMOVED Requirements

### Requirement: Participación en el carrusel
**Reason**: El cliente eligió fotos de portada que no están en las fichas y varias de una misma obra. El modelo de una foto por obra, declarada en su `index.yaml`, no permite ninguna de las dos cosas.
**Migration**: Las láminas se definen en «Fotografías de la portada del inicio». Se quita `carrusel` de todos los `index.yaml` y del esquema. Las fotos van en la carpeta de la portada, con su obra indicada en el manifiesto de la portada.

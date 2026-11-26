# Spec Delta

## MODIFIED Requirements

### Requirement: Obras internas de un álbum
La ficha de una obra que tiene obras en su álbum SHALL mostrar, después de sus fotografías y antes de "Siguiente obra", un bloque titulado con el rótulo "Lotes". El bloque SHALL tener una tarjeta por cada obra interna, en su orden, con su portada en proporción 4:3 y su nombre, y cada tarjeta SHALL enlazar a la ficha de esa obra. Una ficha sin obras internas MUST NOT mostrar el bloque.

#### Scenario: Ficha del condominio
- **WHEN** se abre la ficha de "Bosque Golf, El Condominio"
- **THEN** después de sus fotos se ve el bloque "Lotes" con las tarjetas de los lotes 1, 2, 3, 4 y 5, en ese orden

#### Scenario: Abrir un lote
- **WHEN** la persona pulsa la tarjeta de "Bosque Golf, Lote 4" en la ficha del condominio
- **THEN** navega a `/obras/bosque-golf-lote-4/` y ve la ficha del lote con todas sus fotos

#### Scenario: Ficha sin álbum
- **WHEN** se abre la ficha de "Pub Los Amigos"
- **THEN** no se ve el bloque "Lotes"

#### Scenario: Disposición de las tarjetas
- **WHEN** se abre la ficha del condominio en pantallas de 390 px y de 1440 px de ancho
- **THEN** las tarjetas de los lotes se ven en 2 y en 3 columnas respectivamente, sin desbordar la pantalla

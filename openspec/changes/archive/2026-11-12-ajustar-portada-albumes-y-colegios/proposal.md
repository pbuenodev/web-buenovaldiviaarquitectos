# Proposal

## Why

Al revisar el sitio con fotos reales, el cliente pidió cuatro ajustes. El nombre de la oficina en la portada y el título de cada ficha se ven demasiado grandes. El condominio Bosque Golf y sus lotes aparecen como obras sueltas, cuando son un solo proyecto con varias alternativas de lote. Y falta una categoría propia para los colegios.

## What Changes

- **Portada del inicio**: el nombre de la oficina se achica y se jerarquiza en dos niveles: "Bueno Valdivia" más grande y "Arquitectos" más pequeño debajo. Bajo él se agregan, aún más pequeños, los nombres de los tres integrantes: Pablo A. Bueno Orellana, Teresa Y. Valdivia Ponce y Bruno A. Bueno Valdivia. Los nombres se configuran en el archivo de datos de la oficina.
- **Ficha de obra**: el título (nombre de la obra) baja de tamaño.
- **Álbum dentro de un álbum**: una obra puede declarar que pertenece al álbum de otra obra. El condominio Bosque Golf pasa a contener los lotes L1, L2, L4 y L5 (no hay fotos de un L3; si llega, basta con agregar su carpeta). **BREAKING** (contenido visible):
  - Los lotes dejan de aparecer en la grilla del inicio; solo aparece el condominio.
  - La ficha del condominio muestra sus fotos y, debajo, las tarjetas de sus lotes, de L1 a L5.
  - Cada lote conserva su propia dirección (`/obras/bosque-golf-lote-N/`). Su enlace de regreso lleva al condominio, y "Siguiente obra" recorre los lotes del mismo álbum.
- **Categoría "Colegios"**: se agrega como cuarta categoría con su filtro, después de "Comercial". El Colegio Charles School pasa de "Edificios" a "Colegios".

Fuera de alcance: cambiar los nombres de las obras ("Bosque Golf, El Condominio" no pasa a llamarse "Condominio Bosque Golf"), crear una página o entrada de menú para los colegios, y agregar fotos de un Lote 3.

## Capabilities

### New Capabilities
<!-- Ninguna: los álbumes amplían el catálogo y la ficha existentes. -->

### Modified Capabilities
- `catalogo-obras`: se agrega la categoría `colegios` y la pertenencia de una obra al álbum de otra, con sus validaciones.
- `pagina-inicio`: la portada muestra el nombre en dos tamaños con los integrantes debajo, la grilla excluye las obras que están dentro de un álbum y hay cinco filtros.
- `ficha-obra`: el título se achica, la ficha de un álbum lista sus obras internas, y en una obra interna cambian el enlace de regreso y "Siguiente obra".

## Impact

- `src/content.config.ts`, `src/lib/catalogo.ts` y `src/lib/obras.ts`: nueva categoría, campo de álbum, validaciones y orden de "siguiente".
- `src/components/Portada.astro`, `src/config/site.ts` y `src/styles/tokens.css`: nombre en dos niveles, integrantes y nuevos tamaños de título.
- `src/pages/index.astro` y `src/pages/obras/[slug].astro`, más un componente nuevo para los lotes de un álbum (se reutiliza `TarjetaObra`).
- Contenido: el `index.yaml` de los cuatro lotes (álbum y orden de L1 a L5) y el del Colegio Charles School (categoría).
- Pruebas: `tests/unit/catalogo.test.ts` y `tests/e2e/humo.spec.ts`. Hoy la primera obra del e2e es el Lote 5, que deja de estar en la grilla.
- Sin dependencias nuevas.

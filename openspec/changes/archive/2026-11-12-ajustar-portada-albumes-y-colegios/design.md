# Design

## Context

- El catálogo se arma en `src/lib/catalogo.ts` (`armarCatalogo`, `obraSiguiente`, `laminasCarrusel`), sin depender de Astro. Los datos de cada obra se validan con el esquema zod de `src/content.config.ts`.
- `index.yaml` no se escribe a mano: lo genera `scripts/importar-obras.mjs` a partir de `scripts/obras/<slug>.json` y de la carpeta del cliente `NN-<slug>/`, donde `NN` fija el `orden`. Los lotes hoy tienen orden 5 (L1), 4 (L2), 3 (L4) y 1 (L5). Mostrados por `orden`, aparecerían de L5 a L1.
- Los filtros (`Filtros.astro`) se construyen a partir de `CATEGORIAS`, así que una categoría nueva genera su botón sola.
- Tamaños actuales: la portada y el título de la ficha usan `--titulo-xl: clamp(52px, 9vw, 128px)`. Ya existe `--titulo-l: clamp(40px, 6vw, 88px)`, que no se usa.
- El Lote 5 es la primera lámina del carrusel. El carrusel no enlaza a obras, así que el Lote 5 puede seguir ahí aunque salga de la grilla.

## Goals / Non-Goals

**Goals:**
- Un único modelo de catálogo: los lotes siguen siendo obras completas, con un dato más (`album`).
- El orden de los lotes (L1 a L5) debe resistir una nueva importación de la entrega del cliente.

**Non-Goals:**
- Álbumes de más de un nivel, o una obra en varios álbumes.
- Cambiar el rótulo "Lotes" por obra (cuando haya un segundo álbum de otro tipo se verá si hace falta).
- Rediseñar la tarjeta de obra: se reutiliza `TarjetaObra` tal cual.

## Decisions

### 1. La obra interna declara su álbum (`album: <slug>`)
Se agrega `album?: string` al esquema y a `DatosObra`. `armarCatalogo` sigue devolviendo **todas** las obras, porque `getStaticPaths` y el carrusel las necesitan, y además valida cada `album`: el slug debe existir, no puede ser el de la propia obra y la obra madre no puede tener `album`. Las validaciones lanzan errores con el mismo estilo de los actuales.
- *Alternativa descartada*: que la obra madre liste a sus hijas (`lotes: [...]`). Agregar un lote obligaría a editar dos carpetas, en contra del requisito "agregar una obra sin tocar código", y duplicaría el orden.

### 2. Selectores puros en `catalogo.ts`
- `obrasDeLaGrilla(obras)`: las obras sin `album`. Las usan la grilla del inicio y el recorrido de "Siguiente obra" del catálogo.
- `obrasDelAlbum(obras, slug)`: las obras internas de `slug`, ordenadas como el catálogo.
- `obraSiguiente` no cambia de firma. El que la llama le pasa la lista adecuada: la grilla, o las hermanas del mismo álbum. Así la regla de "vuelta al principio" sigue en un solo lugar.

### 3. El orden de los lotes viene del manifiesto
`importar-obras.mjs` acepta en el manifiesto JSON dos campos opcionales: `album`, que copia a `index.yaml`, y `orden`, que reemplaza al número de la carpeta del cliente. Los cuatro manifiestos de los lotes declaran `album: "bosque-golf-el-condominio"` y `orden` 1, 2, 4 y 5, según el número de lote. Dentro de un álbum, el orden solo compara a las hermanas entre sí, así que no importa que coincida con el `orden` de obras de la grilla (el desempate por slug ya existe).
- *Alternativa descartada*: ordenar los lotes por nombre. El nombre sería un dato con doble función y fallaría con un "Lote 10".
- *Alternativa descartada*: editar `index.yaml` a mano. La siguiente importación lo sobrescribiría.

### 4. Ficha: bloque "Lotes", regreso y siguiente
En `[slug].astro`:
- `getStaticPaths` calcula, por obra, su álbum (la obra madre o ninguno), sus obras internas y su siguiente: `obraSiguiente(album ? hermanas : grilla, slug)`.
- Un componente nuevo, `ObrasDelAlbum.astro`, muestra un `<section>` con un rótulo `<h2 class="rotulo">Lotes</h2>` y reutiliza `GrillaObras`, que ya da 2 y 3 columnas. El script de filtros solo se carga en el inicio, así que el `data-categoria` de las tarjetas no tiene efecto en la ficha.
- El enlace de regreso es `← Obras` (`/`) o `← {madre.nombre}` (`/obras/{madre.slug}/`).

### 5. Tipografía de la portada y de la ficha
- Portada: `<h1 class="titular marca">Bueno Valdivia<br /><span class="marca-sub">Arquitectos</span></h1>`. "Bueno Valdivia" usa `--titulo-l` (40 a 88 px) y "Arquitectos" `0.5em` (20 a 44 px). Los integrantes van **fuera** del `h1`, en una `<ul class="rotulo integrantes">` con el tamaño de texto del sitio (13 px) y el color `--gris-foto`, el mismo del botón para bajar, que ya cumple el contraste sobre el velo. El nombre accesible del `h1` sigue siendo "Bueno Valdivia Arquitectos", como hoy.
- Los integrantes se guardan en `sitio.integrantes` (`src/config/site.ts`), junto al resto de los datos de la oficina.
- Ficha: un token nuevo, `--titulo-m: clamp(32px, 4.5vw, 64px)`, para el `h1`. Se descartó `--titulo-l` (88 px), porque con nombres como "Edificio Central Tráfico Alameda" seguía viéndose grande. `--titulo-xl` queda sin uso y se elimina.

### 6. Categoría `colegios`
Se agrega `colegios: 'Colegios'` al final de `CATEGORIAS`, y al `z.enum`, para que el filtro quede después de "Comercial". El manifiesto y el `index.yaml` del Colegio Charles School pasan a `categoria: colegios`.

## Risks / Trade-offs

- [El velo es más claro en la parte media de la foto. Si el bloque del nombre crece hacia arriba, los integrantes podrían quedar sobre una zona más clara] → El bloque se ancla abajo (`inset: auto 0 12svh`), donde el degradado es más oscuro. En la verificación se mide el contraste de los integrantes sobre las tres láminas.
- [Las pruebas e2e usan el Lote 5 como primera obra y como primera lámina] → Se separan las constantes: la primera obra de la grilla pasa a ser el condominio, y la lámina 1 sigue siendo el Lote 5. Se agregan pruebas del bloque "Lotes", del regreso al álbum y del recorrido de "Siguiente obra" entre lotes.
- [Una obra madre con pocas fotos y muchos lotes alarga la ficha] → Se acepta. El bloque va antes de "Siguiente obra" y no repite fotos.

## Migration Plan

Se publica como cualquier cambio de contenido en Cloudflare Pages. Las direcciones de los lotes no cambian, así que los enlaces ya compartidos siguen funcionando. Para revertir, basta con volver al commit anterior.

# Web Bueno Valdivia Arquitectos

Portafolio de obras de la oficina Bueno Valdivia Arquitectos. Sitio estático hecho con [Astro](https://astro.build): una página de inicio con un hero a pantalla completa (fotos que cambian solas cada 5 segundos, bajo una cabecera con menú) y la grilla de obras, una ficha por obra y el contacto por WhatsApp en el pie.

## Requisitos

- Node 22.12 o superior
- pnpm 12 (`npm install -g pnpm`)
- Para la prueba de navegador, una sola vez: `pnpm exec playwright install chromium`

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm install` | Instala las dependencias |
| `pnpm dev` | Servidor de desarrollo en `http://localhost:4321` |
| `pnpm build` | Construye el sitio en `dist/` |
| `pnpm preview` | Sirve `dist/` para revisarlo como quedará publicado |
| `pnpm check` | Revisa tipos en archivos `.astro` y `.ts` |
| `pnpm test` | Pruebas unitarias (catálogo de obras y enlaces de WhatsApp) |
| `pnpm test:e2e` | Prueba de humo en navegador, en teléfono y escritorio. Requiere `pnpm build` antes |
| `pnpm reescalar:instalar` | Descarga Real-ESRGAN (IA) a `tools/`, una sola vez. Ver «Reescalar fotos» |
| `pnpm reescalar` | Amplía fotos con IA para usarlas de fondo. Ver «Reescalar fotos» |
| `pnpm verificar:imagenes` | Falla si alguna imagen AVIF de `dist/` supera los 300 KB (400 KB las de más de 1600 px, que son las del carrusel) |
| `pnpm verificar` | Todo lo anterior en orden: tipos, pruebas, build, peso de imágenes y navegador |

El primer `pnpm build` tarda unos minutos porque genera todas las versiones de las fotos; los siguientes reutilizan la caché de `node_modules/.astro/`.

## Estructura

```
public/                  favicon
scripts/                 importar-obras, reescalar-imagenes y verificar-imagenes
tools/                   herramientas descargadas (Real-ESRGAN); no se versiona
src/
  assets/logo/           variantes del logo (original.svg es la fuente)
  content/obras/<slug>/  una carpeta por obra: index.yaml y sus fotos
  content.config.ts      esquema que valida cada index.yaml
  config/site.ts         nombre, WhatsApp, mensajes y redes
  lib/                   reglas del catálogo y enlaces de WhatsApp
  styles/                tokens.css (colores, tipografía, medidas) y base.css
  layouts/Base.astro     <head>, metadatos, cabecera y pie
  components/            piezas de las páginas; Foto.astro es la única que emite fotografías
  scripts/               hero (portada.ts) y filtros (lo único que corre en el navegador)
  pages/                 inicio, obras/[slug], 404 y robots.txt
tests/
  unit/                  Vitest
  e2e/                   Playwright
openspec/                especificaciones y cambios del proyecto
```

## Agregar una obra

No hace falta tocar código: se añade una carpeta y el sitio hace el resto.

1. Crear `src/content/obras/<slug>/`. El nombre de la carpeta es la dirección de la obra (`/obras/<slug>/`): minúsculas, sin tildes y con guiones.
2. Copiar ahí las fotos (`.webp`, `.jpg`, `.png` o `.avif`). Se muestran **en orden alfabético de nombre de archivo**, así que el nombre decide el orden: `foto-01.webp`, `foto-02.webp`, `foto-03.webp`… Para reordenar, renombrar.
3. Crear `index.yaml` en la misma carpeta:

   ```yaml
   nombre: Casa La Quebrada
   ciudad: Viña del Mar # se ve en la grilla
   ubicacion: Viña del Mar, Valparaíso # se ve en la ficha
   categoria: casas # casas | edificios | comercial
   orden: 2 # posición en la grilla y en "Siguiente obra"
   portada: foto-02 # opcional; por defecto, la primera foto
   carrusel: # opcional; sin esto la obra no entra al hero del inicio (el campo se llama así por historia)
     foto: foto-03
     orden: 1 # posición de la lámina
   ```

4. Ejecutar `pnpm build`. Si falta un dato, la categoría no existe, la carpeta no tiene fotos o `portada` / `carrusel.foto` nombran un archivo que no está, el build falla y dice qué obra y qué dato corregir.

Para quitar una obra, borrar su carpeta.

Sobre las fotos:

- Subir un archivo de buena calidad por foto, de **hasta 2000 px de lado mayor** (el sitio no sirve más de 1600 px en las fichas y la grilla; `pnpm importar` ya reduce las fotos a ese tamaño). Una fuente de 4096 px solo pesa más en el repositorio y alarga el build. La **foto del hero (`carrusel`)** es la excepción: se ve a pantalla completa, así que se conserva hasta **2880 px** y el sitio sirve hasta **2560 px**. Para ella conviene una foto de al menos 2560 px de ancho (ver «Reescalar fotos»). Los originales sin comprimir se guardan fuera del repositorio.
- Las fotos verticales y las de menos de 900 px de ancho se muestran más angostas y centradas en la ficha, sin ampliarse.
- Si `pnpm verificar:imagenes` falla, bajar la calidad AVIF en `src/components/Foto.astro` (hoy 50).

## Importar obras desde la selección del cliente

El cliente entrega una carpeta curada, `~/Descargas/Seleccion Portafolio` (fuera del repositorio), y esa carpeta manda:

- `NN-<slug>/` es una obra: `NN` es su posición en la grilla (`orden`) y `<slug>` su dirección.
- Dentro, cada foto se llama `<slug>-NN.webp`. El número es el orden en la ficha; los huecos (fotos que el cliente descartó) no importan.
- La foto que lleva `FAVORITA` (`<slug>-03FAVORITA.webp`) es la portada de la obra. Debe haber exactamente una por obra.
- `reescaladas/` puede traer una versión ampliada de una foto con el mismo nombre; si existe, se usa en su lugar.

Los datos que no vienen de la carpeta están en `scripts/obras/<slug>.json`: `origen` (la carpeta `NN-<slug>`), `nombre`, `categoria`, `ciudad`, `ubicacion`, `pendientes` (los datos aún por confirmar se dejan como `Por confirmar` y salen marcados con `# PREGUNTA ABIERTA` en el `index.yaml`) y, si la obra va en el carrusel, `carrusel: { "orden": N }` (la foto es la favorita).

```sh
pnpm importar                              # todas las obras
pnpm importar casa-santo-domingo           # solo una
pnpm importar --entrega /ruta/a/la/entrega # si la selección está en otro lugar
```

El script renombra las fotos a `foto-01`, `foto-02`… (en el orden del cliente, sin huecos), las reduce a 2000 px de lado mayor (2880 la favorita de una obra del carrusel; sin ampliar) y reescribe la carpeta de la obra. Falla, nombrando el archivo, si una foto no sigue el patrón, si un número se repite o si una obra no tiene exactamente una favorita. Para cambiar el orden o la portada, el cliente renombra en su carpeta y se vuelve a importar. Los originales y los `.DS_Store` no se guardan en el repositorio.

## Reescalar fotos

Para una foto que se va a ver a pantalla completa (fondo del hero) y es más pequeña que el ancho necesario, `pnpm reescalar` la amplía con [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan), una red neuronal que corre en la GPU (Vulkan). Una sola vez por equipo:

```sh
pnpm reescalar:instalar        # descarga el release oficial a tools/realesrgan/ y comprueba su SHA-256
```

Después:

```sh
pnpm reescalar foto.webp otra.webp --salida ../reescaladas              # 2880 px de ancho
pnpm reescalar carpeta/ --salida ../reescaladas --ancho 2560 --mezcla 0.8
```

| Opción | Predeterminado | Qué hace |
|---|---|---|
| `--salida` | (obligatoria) | Carpeta de destino. Nunca se sobrescribe el original |
| `--ancho` | 2880 | Ancho final en px. Una foto que ya lo alcanza solo se convierte a WebP |
| `--mezcla` | 0.85 | Peso de la IA frente a la ampliación clásica (0 a 1). Bajarlo si la IA «plastifica» la textura |
| `--calidad` | 90 | Calidad WebP |
| `--modelo` | `realesrgan-x4plus` | Modelo para fotografía. No usar los `anime` |

La IA amplía 4× y el resultado se reduce con Lanczos al ancho pedido, lo que atenúa sus artefactos. **Ampliar no crea detalle real**: sirve para que un fondo no se vea blando, no para rescatar una foto mala. Revisar siempre el resultado al 100 %.

Las fotos de las fichas y la grilla se reducen igualmente a 2000 px al importar; solo la marcada como `carrusel` conserva hasta 2880 px. El instalador solo cubre Linux.

## Datos de contacto

El número de WhatsApp, los mensajes ya escritos y las redes están en `src/config/site.ts`. Una red con la dirección vacía no se muestra.

## Variables de entorno

Ver `.env.example`.

| Variable | Por defecto | Para qué |
|---|---|---|
| `SITE_URL` | `http://localhost:4321` | Dirección pública del sitio. Las tarjetas que se ven al compartir un enlace por WhatsApp necesitan direcciones absolutas |
| `PUBLIC_INDEXABLE` | `false` | Con `true` se permite a los buscadores indexar el sitio. Mientras esté en prueba, todas las páginas llevan `noindex` y `robots.txt` lo bloquea |

## Datos provisionales por reemplazar

Antes de publicar para el cliente hay que cambiar:

- [x] Fotografías, nombres, orden de las obras y de las fotos y portadas: ya son la selección del cliente (14 obras, 89 fotos)
- [ ] Ciudad y ubicación de las obras: valen `Por confirmar` (salvo Zapallar y Santo Domingo, tomadas del nombre y aún sin confirmar). Están marcadas con `# PREGUNTA ABIERTA` en cada `index.yaml`; editarlas en `scripts/obras/<slug>.json` y reimportar
- [ ] Confirmar las 3 láminas del hero y su orden (quedaron las de mejor tono; el resto se retiró por no combinar con el azul del sitio; pedir al cliente fotos de atardecer o con luz cálida para ampliarlo) y que la portada vertical de Edificio Panamericana se ve bien en la grilla
- [ ] Bosque Golf: confirmar que va en cinco fichas (El Condominio y Lotes 1, 2, 4 y 5) y no en una sola, y pedir las fotos mejoradas de Lote 3 (solo llegaron los originales)
- [ ] Confirmar los rótulos de categoría "Edificios" y "Comercial" y que el Colegio Charles School va con los edificios
- [ ] Número de WhatsApp `+56 9 0000 0000` en `src/config/site.ts`
- [ ] Direcciones de Instagram y Facebook en `src/config/site.ts`
- [ ] `SITE_URL` con el dominio definitivo

## Despliegue

El sitio se publica en Cloudflare Pages, en <https://web-buenovaldiviaarquitectos.pages.dev/>. Cloudflare construye y publica solo con cada push a la rama de producción; la configuración vive en el panel de Cloudflare, no en el repositorio.

Configuración del proyecto en Cloudflare:

| Campo | Valor |
|---|---|
| Rama de producción | `develop` |
| Comando de build | `pnpm build` |
| Carpeta de salida | `dist` |
| Variables | `SITE_URL` con la dirección pública; `NODE_VERSION` 22 o superior; `PNPM_VERSION` igual a la de `packageManager` en `package.json` |

Mientras `PUBLIC_INDEXABLE` no se defina, el sitio publicado lleva `noindex` y los buscadores no lo muestran.

## Ramas

Se trabaja en `develop` y se integra a `main` (protegida) por pull request.

Cada pull request fusionado deja en `main` un commit de fusión que `develop` no tiene. Después de fusionar, y antes de empezar el cambio siguiente, hay que poner `develop` al día:

```sh
git switch develop
git fetch origin
git merge origin/main
git push
```

El `git push` a `develop` vuelve a publicar el sitio en Cloudflare Pages, aunque el contenido no cambie.

# Web Bueno Valdivia Arquitectos

Portafolio de obras de la oficina Bueno Valdivia Arquitectos. Sitio estático hecho con [Astro](https://astro.build): una página de inicio con carrusel y grilla de obras, una ficha por obra y el contacto por WhatsApp en el pie.

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
| `pnpm verificar:imagenes` | Falla si alguna imagen AVIF de `dist/` supera los 300 KB |
| `pnpm verificar` | Todo lo anterior en orden: tipos, pruebas, build, peso de imágenes y navegador |

El primer `pnpm build` tarda unos minutos porque genera todas las versiones de las fotos; los siguientes reutilizan la caché de `node_modules/.astro/`.

## Estructura

```
public/                  favicon
scripts/                 verificar-imagenes.mjs
src/
  assets/logo/           variantes del logo (original.svg es la fuente)
  content/obras/<slug>/  una carpeta por obra: index.yaml y sus fotos
  content.config.ts      esquema que valida cada index.yaml
  config/site.ts         nombre, WhatsApp, mensajes y redes
  lib/                   reglas del catálogo y enlaces de WhatsApp
  styles/                tokens.css (colores, tipografía, medidas) y base.css
  layouts/Base.astro     <head>, metadatos, cabecera y pie
  components/            piezas de las páginas; Foto.astro es la única que emite fotografías
  scripts/               carrusel y filtros (lo único que corre en el navegador)
  pages/                 inicio, obras/[slug], 404 y robots.txt
tests/
  unit/                  Vitest
  e2e/                   Playwright
openspec/                especificaciones y cambios del proyecto
```

## Agregar una obra

No hace falta tocar código: se añade una carpeta y el sitio hace el resto.

1. Crear `src/content/obras/<slug>/`. El nombre de la carpeta es la dirección de la obra (`/obras/<slug>/`): minúsculas, sin tildes y con guiones.
2. Copiar ahí las fotos (`.webp`, `.jpg`, `.png` o `.avif`). Se muestran **en orden alfabético de nombre de archivo**, así que el nombre decide el orden: `exterior-01.webp`, `exterior-02.webp`, `interior-01.webp`… Para reordenar, renombrar.
3. Crear `index.yaml` en la misma carpeta:

   ```yaml
   nombre: Casa La Quebrada
   ciudad: Viña del Mar # se ve en la grilla
   ubicacion: Viña del Mar, Valparaíso # se ve en el carrusel y en la ficha
   categoria: casas # casas | edificios
   orden: 2 # posición en la grilla y en "Siguiente obra"
   portada: exterior-02 # opcional; por defecto, la primera foto
   carrusel: # opcional; sin esto la obra no aparece en el carrusel
     foto: exterior-03
     orden: 1 # posición de la lámina
   ```

4. Ejecutar `pnpm build`. Si falta un dato, la categoría no existe, la carpeta no tiene fotos o `portada` / `carrusel.foto` nombran un archivo que no está, el build falla y dice qué obra y qué dato corregir.

Para quitar una obra, borrar su carpeta.

Sobre las fotos:

- Subir un archivo de buena calidad por foto; el build genera las versiones AVIF y WebP en varios tamaños. Los originales sin comprimir se guardan fuera del repositorio.
- Las fotos verticales y las de menos de 900 px de ancho (por ejemplo, las antiguas) se muestran más angostas y centradas en la ficha, sin ampliarse.
- Si `pnpm verificar:imagenes` falla, bajar la calidad AVIF en `src/components/Foto.astro`.

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

- [ ] Las 60 fotografías de `src/content/obras/` (son imágenes de previsualización)
- [ ] Nombres, ciudades y ubicaciones de las obras (vienen del prototipo de diseño)
- [ ] Número de WhatsApp `+56 9 0000 0000` en `src/config/site.ts`
- [ ] Direcciones de Instagram y Facebook en `src/config/site.ts`
- [ ] `SITE_URL` con el dominio definitivo

## Ramas

Se trabaja en `develop` y se integra a `main` (protegida) por pull request.

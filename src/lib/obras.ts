import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { armarCatalogo, laminasPortada, type FotoObra, type Lamina, type Obra } from './catalogo';

export type ObraDelSitio = Obra<ImageMetadata>;
export type FotoDelSitio = FotoObra<ImageMetadata>;
export type LaminaDelSitio = Lamina<ImageMetadata>;

// Las fotos no se listan en el YAML: se toman de la carpeta de cada obra.
const modulos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/obras/*/*.{webp,avif,jpg,jpeg,png}',
  { eager: true },
);

// Las fotos del hero no son de ninguna ficha: viven aparte y su nombre, `NN-<slug>`, dice su orden y su obra.
const modulosPortada = import.meta.glob<{ default: ImageMetadata }>('/src/assets/portada/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
});

// Astro copia a `dist/` el original de toda imagen cuyas propiedades se lean fuera de su
// servicio de imágenes. Aquí se leen las medidas (foto angosta, anchos de `srcset`), así que
// se trabaja sobre una copia: los originales de ~2 MB no se publican, solo sus versiones optimizadas.
function copiaSinRastreo(imagen: ImageMetadata): ImageMetadata {
  const rastreada = imagen as ImageMetadata & { clone?: ImageMetadata; fsPath?: string };
  if (!rastreada.clone) return imagen;
  // La copia pierde la ruta del original, que Astro necesita para saber qué archivo descartar.
  return Object.defineProperty(rastreada.clone, 'fsPath', { value: rastreada.fsPath, enumerable: false });
}

function fotosPorSlug(): Map<string, FotoDelSitio[]> {
  const mapa = new Map<string, FotoDelSitio[]>();
  for (const [ruta, modulo] of Object.entries(modulos)) {
    const [slug, archivo] = ruta.split('/').slice(-2) as [string, string];
    const fotos = mapa.get(slug) ?? [];
    fotos.push({ archivo, imagen: copiaSinRastreo(modulo.default) });
    mapa.set(slug, fotos);
  }
  return mapa;
}

let catalogo: Promise<ObraDelSitio[]> | undefined;

/** Todas las obras, validadas y en el orden del catálogo. */
export function obtenerObras(): Promise<ObraDelSitio[]> {
  catalogo ??= getCollection('obras').then((entradas) =>
    armarCatalogo(
      entradas.map((entrada) => ({ slug: entrada.id, datos: entrada.data })),
      fotosPorSlug(),
    ),
  );
  return catalogo;
}

/** Láminas de la portada del inicio, en el orden de sus archivos. */
export async function obtenerLaminas(): Promise<LaminaDelSitio[]> {
  const fotos = Object.entries(modulosPortada).map(([ruta, modulo]) => ({
    archivo: ruta.split('/').at(-1)!,
    imagen: copiaSinRastreo(modulo.default),
  }));
  return laminasPortada(fotos, await obtenerObras());
}

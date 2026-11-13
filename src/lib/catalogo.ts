// Reglas del catálogo de obras. No depende de Astro para poder probarse de forma aislada.

export const CATEGORIAS = {
  casas: 'Casas',
  edificios: 'Edificios',
  comercial: 'Comercial',
  colegios: 'Colegios',
} as const;

export type Categoria = keyof typeof CATEGORIAS;

export interface DatosObra {
  nombre: string;
  ciudad: string;
  ubicacion: string;
  categoria: Categoria;
  orden: number;
  portada?: string | undefined;
  carrusel?: { foto: string; orden: number } | undefined;
  /** Slug de la obra en cuyo álbum está esta obra (p. ej. un lote dentro de su condominio). */
  album?: string | undefined;
}

export interface FotoObra<I> {
  /** Nombre de archivo con extensión, p. ej. `exterior-01.webp`. */
  archivo: string;
  imagen: I;
}

export interface Obra<I> extends DatosObra {
  slug: string;
  fotos: FotoObra<I>[];
  fotoPortada: FotoObra<I>;
}

export interface Lamina<I> {
  obra: Obra<I>;
  foto: FotoObra<I>;
}

/** Ancho mínimo, en píxeles del archivo de origen, para mostrar una foto a todo el ancho. */
export const ANCHO_MINIMO_COMPLETO = 900;

const sinExtension = (archivo: string) => archivo.replace(/\.[^.]+$/, '');

function buscarFoto<I>(obra: { slug: string; fotos: FotoObra<I>[] }, nombre: string, campo: string): FotoObra<I> {
  const foto = obra.fotos.find((f) => f.archivo === nombre || sinExtension(f.archivo) === nombre);
  if (!foto) {
    throw new Error(`Obra "${obra.slug}": el archivo "${nombre}" indicado en "${campo}" no existe en su carpeta.`);
  }
  return foto;
}

/**
 * Une los datos de cada obra con sus fotos, valida que estén completas y las
 * devuelve ordenadas por `orden`.
 */
export function armarCatalogo<I>(
  entradas: { slug: string; datos: DatosObra }[],
  fotosPorSlug: Map<string, FotoObra<I>[]>,
): Obra<I>[] {
  const vistos = new Set<string>();
  const obras = entradas.map(({ slug, datos }) => {
    if (vistos.has(slug)) throw new Error(`Slug repetido en el catálogo: "${slug}".`);
    vistos.add(slug);

    const fotos = [...(fotosPorSlug.get(slug) ?? [])].sort((a, b) =>
      a.archivo.localeCompare(b.archivo, 'es', { numeric: true }),
    );
    const primera = fotos[0];
    if (!primera) throw new Error(`Obra "${slug}": su carpeta no contiene ninguna fotografía.`);

    const fotoPortada = datos.portada ? buscarFoto({ slug, fotos }, datos.portada, 'portada') : primera;
    return { ...datos, slug, fotos, fotoPortada };
  });

  validarAlbumes(obras);
  return obras.sort((a, b) => a.orden - b.orden || a.slug.localeCompare(b.slug));
}

/** Los álbumes tienen un solo nivel y deben apuntar a una obra existente distinta de la propia. */
function validarAlbumes(obras: { slug: string; album?: string | undefined }[]) {
  const porSlug = new Map(obras.map((o) => [o.slug, o]));
  for (const obra of obras) {
    if (obra.album === undefined) continue;
    if (obra.album === obra.slug) throw new Error(`Obra "${obra.slug}": no puede estar en su propio álbum.`);
    const madre = porSlug.get(obra.album);
    if (!madre) throw new Error(`Obra "${obra.slug}": el álbum "${obra.album}" no corresponde a ninguna obra.`);
    if (madre.album !== undefined) {
      throw new Error(
        `Obra "${obra.slug}": su álbum "${madre.slug}" está a su vez en el álbum "${madre.album}"; los álbumes tienen un solo nivel.`,
      );
    }
  }
}

/** Obras que se muestran en la grilla del inicio: las que no están dentro del álbum de otra. */
export function obrasDeLaGrilla<I>(obras: Obra<I>[]): Obra<I>[] {
  return obras.filter((obra) => obra.album === undefined);
}

/** Obras dentro del álbum de `slug`, en el orden del catálogo. */
export function obrasDelAlbum<I>(obras: Obra<I>[], slug: string): Obra<I>[] {
  return obras.filter((obra) => obra.album === slug);
}

/** Obra que sigue a `slug` en el orden del catálogo; desde la última vuelve a la primera. */
export function obraSiguiente<I>(obras: Obra<I>[], slug: string): Obra<I> {
  const indice = obras.findIndex((o) => o.slug === slug);
  if (indice === -1) throw new Error(`No existe la obra "${slug}".`);
  return obras[(indice + 1) % obras.length]!;
}

/** Láminas del carrusel: solo las obras que lo declaran, en el orden que indican. */
export function laminasCarrusel<I>(obras: Obra<I>[]): Lamina<I>[] {
  const laminas = obras
    .filter((obra) => obra.carrusel)
    .sort((a, b) => a.carrusel!.orden - b.carrusel!.orden || a.orden - b.orden)
    .map((obra) => ({ obra, foto: buscarFoto(obra, obra.carrusel!.foto, 'carrusel.foto') }));

  if (laminas.length === 0) {
    throw new Error('El carrusel no tiene láminas: ninguna obra declara "carrusel" en su index.yaml.');
  }
  return laminas;
}

/** Las fotos verticales o de baja resolución se muestran angostas y centradas. */
export function esAngosta(medidas: { width: number; height: number }, anchoMinimo = ANCHO_MINIMO_COMPLETO): boolean {
  return medidas.height > medidas.width || medidas.width < anchoMinimo;
}

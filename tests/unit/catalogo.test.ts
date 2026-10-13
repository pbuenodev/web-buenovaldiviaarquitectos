import { describe, expect, it } from 'vitest';
import {
  armarCatalogo,
  esAngosta,
  laminasCarrusel,
  obraSiguiente,
  type DatosObra,
  type FotoObra,
} from '../../src/lib/catalogo';

const datos = (extra: Partial<DatosObra> = {}): DatosObra => ({
  nombre: 'Obra',
  ciudad: 'Ciudad',
  ubicacion: 'Ciudad, Región',
  categoria: 'casas',
  orden: 1,
  ...extra,
});

const fotos = (...archivos: string[]): FotoObra<string>[] => archivos.map((archivo) => ({ archivo, imagen: archivo }));

const diez = fotos(
  'interior-02.webp', 'exterior-05.webp', 'interior-01.webp', 'exterior-01.webp', 'exterior-03.webp',
  'interior-05.webp', 'exterior-02.webp', 'interior-04.webp', 'exterior-04.webp', 'interior-03.webp',
);

function catalogoDeTres() {
  return armarCatalogo(
    [
      { slug: 'c', datos: datos({ orden: 3, carrusel: { foto: 'exterior-02', orden: 1 } }) },
      { slug: 'a', datos: datos({ orden: 1, carrusel: { foto: 'exterior-01.webp', orden: 2 } }) },
      { slug: 'b', datos: datos({ orden: 2 }) },
    ],
    new Map([
      ['a', fotos('exterior-01.webp', 'exterior-02.webp')],
      ['b', fotos('exterior-01.webp')],
      ['c', fotos('exterior-01.webp', 'exterior-02.webp')],
    ]),
  );
}

describe('armarCatalogo', () => {
  it('ordena las obras por su posición de orden', () => {
    expect(catalogoDeTres().map((o) => o.slug)).toEqual(['a', 'b', 'c']);
  });

  it('ordena las fotos por nombre de archivo: exteriores antes que interiores', () => {
    const [obra] = armarCatalogo([{ slug: 'a', datos: datos() }], new Map([['a', diez]]));
    expect(obra!.fotos.map((f) => f.archivo)).toEqual([
      'exterior-01.webp', 'exterior-02.webp', 'exterior-03.webp', 'exterior-04.webp', 'exterior-05.webp',
      'interior-01.webp', 'interior-02.webp', 'interior-03.webp', 'interior-04.webp', 'interior-05.webp',
    ]);
  });

  it('usa la primera foto como portada por defecto', () => {
    const [obra] = armarCatalogo([{ slug: 'a', datos: datos() }], new Map([['a', diez]]));
    expect(obra!.fotoPortada.archivo).toBe('exterior-01.webp');
  });

  it('respeta la portada indicada, con o sin extensión', () => {
    for (const portada of ['interior-03', 'interior-03.webp']) {
      const [obra] = armarCatalogo([{ slug: 'a', datos: datos({ portada }) }], new Map([['a', diez]]));
      expect(obra!.fotoPortada.archivo).toBe('interior-03.webp');
    }
  });

  it('falla si la portada no existe en la carpeta', () => {
    expect(() =>
      armarCatalogo([{ slug: 'a', datos: datos({ portada: 'fachada' }) }], new Map([['a', diez]])),
    ).toThrow(/"a".*"fachada".*portada/);
  });

  it('falla si una obra no tiene fotos', () => {
    expect(() => armarCatalogo([{ slug: 'a', datos: datos() }], new Map())).toThrow(/"a".*ninguna fotografía/);
  });

  it('falla si un slug se repite', () => {
    expect(() =>
      armarCatalogo(
        [
          { slug: 'a', datos: datos() },
          { slug: 'a', datos: datos() },
        ],
        new Map([['a', diez]]),
      ),
    ).toThrow(/Slug repetido.*"a"/);
  });
});

describe('obraSiguiente', () => {
  it('devuelve la obra que sigue en el orden del catálogo', () => {
    expect(obraSiguiente(catalogoDeTres(), 'a').slug).toBe('b');
  });

  it('desde la última vuelve a la primera', () => {
    expect(obraSiguiente(catalogoDeTres(), 'c').slug).toBe('a');
  });

  it('falla con un slug desconocido', () => {
    expect(() => obraSiguiente(catalogoDeTres(), 'z')).toThrow(/"z"/);
  });
});

describe('laminasCarrusel', () => {
  it('incluye solo las obras que lo declaran, en el orden del carrusel', () => {
    const laminas = laminasCarrusel(catalogoDeTres());
    expect(laminas.map((l) => [l.obra.slug, l.foto.archivo])).toEqual([
      ['c', 'exterior-02.webp'],
      ['a', 'exterior-01.webp'],
    ]);
  });

  it('falla si la foto del carrusel no existe', () => {
    const obras = armarCatalogo(
      [{ slug: 'a', datos: datos({ carrusel: { foto: 'aerea', orden: 1 } }) }],
      new Map([['a', diez]]),
    );
    expect(() => laminasCarrusel(obras)).toThrow(/"a".*"aerea".*carrusel\.foto/);
  });

  it('falla si ninguna obra participa', () => {
    const obras = armarCatalogo([{ slug: 'a', datos: datos() }], new Map([['a', diez]]));
    expect(() => laminasCarrusel(obras)).toThrow(/no tiene láminas/);
  });
});

describe('esAngosta', () => {
  it('una foto horizontal de buena resolución va a todo el ancho', () => {
    expect(esAngosta({ width: 1448, height: 1086 })).toBe(false);
    expect(esAngosta({ width: 900, height: 600 })).toBe(false);
  });

  it('una foto de menos de 900 px de ancho va angosta', () => {
    expect(esAngosta({ width: 899, height: 600 })).toBe(true);
  });

  it('una foto vertical va angosta', () => {
    expect(esAngosta({ width: 2000, height: 3000 })).toBe(true);
  });
});

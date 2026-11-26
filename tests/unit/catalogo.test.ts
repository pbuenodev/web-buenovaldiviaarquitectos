import { describe, expect, it } from 'vitest';
import {
  armarCatalogo,
  CATEGORIAS,
  esAngosta,
  laminasPortada,
  obrasDeLaGrilla,
  obrasDelAlbum,
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
      { slug: 'c', datos: datos({ orden: 3 }) },
      { slug: 'a', datos: datos({ orden: 1 }) },
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

describe('categorías', () => {
  it('rotula las cuatro categorías', () => {
    expect(CATEGORIAS).toEqual({ casas: 'Casas', edificios: 'Edificios', comercial: 'Comercial', colegios: 'Colegios' });
  });

  it('acepta una obra comercial en el catálogo', () => {
    const [obra] = armarCatalogo(
      [{ slug: 'a', datos: datos({ categoria: 'comercial' }) }],
      new Map([['a', fotos('exterior-01.webp')]]),
    );
    expect(obra!.categoria).toBe('comercial');
  });
});

describe('álbumes', () => {
  const foto = new Map(['madre', 'l1', 'l2', 'l4', 'otra'].map((slug) => [slug, fotos('foto-01.webp')]));

  const condominio = () =>
    armarCatalogo(
      [
        { slug: 'l4', datos: datos({ orden: 4, album: 'madre' }) },
        { slug: 'madre', datos: datos({ orden: 2 }) },
        { slug: 'l1', datos: datos({ orden: 1, album: 'madre' }) },
        { slug: 'otra', datos: datos({ orden: 3 }) },
        { slug: 'l2', datos: datos({ orden: 2, album: 'madre' }) },
      ],
      foto,
    );

  it('las obras de un álbum siguen en el catálogo, pero no en la grilla', () => {
    const obras = condominio();
    expect(obras).toHaveLength(5);
    expect(obrasDeLaGrilla(obras).map((o) => o.slug)).toEqual(['madre', 'otra']);
  });

  it('lista las obras del álbum en su orden', () => {
    expect(obrasDelAlbum(condominio(), 'madre').map((o) => o.slug)).toEqual(['l1', 'l2', 'l4']);
    expect(obrasDelAlbum(condominio(), 'otra')).toEqual([]);
  });

  it('"siguiente" recorre las hermanas y vuelve a la primera', () => {
    const hermanas = obrasDelAlbum(condominio(), 'madre');
    expect(obraSiguiente(hermanas, 'l1').slug).toBe('l2');
    expect(obraSiguiente(hermanas, 'l4').slug).toBe('l1');
    expect(obraSiguiente(obrasDeLaGrilla(condominio()), 'otra').slug).toBe('madre');
  });

  it('falla si el álbum no existe', () => {
    expect(() => armarCatalogo([{ slug: 'l1', datos: datos({ album: 'nadie' }) }], foto)).toThrow(/"l1".*"nadie"/);
  });

  it('falla si una obra está en su propio álbum', () => {
    expect(() => armarCatalogo([{ slug: 'l1', datos: datos({ album: 'l1' }) }], foto)).toThrow(/"l1".*propio álbum/);
  });

  it('falla si los álbumes se anidan', () => {
    expect(() =>
      armarCatalogo(
        [
          { slug: 'madre', datos: datos() },
          { slug: 'l1', datos: datos({ album: 'madre' }) },
          { slug: 'l2', datos: datos({ album: 'l1' }) },
        ],
        foto,
      ),
    ).toThrow(/"l2".*"l1".*"madre"/);
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

describe('laminasPortada', () => {
  it('ordena por nombre de archivo, toma la obra del nombre y admite varias fotos de una obra', () => {
    const laminas = laminasPortada(fotos('02-c.webp', '00-a.webp', '01-c.webp', '10-b.webp'), catalogoDeTres());
    expect(laminas.map((l) => [l.foto.archivo, l.obra.slug])).toEqual([
      ['00-a.webp', 'a'],
      ['01-c.webp', 'c'],
      ['02-c.webp', 'c'],
      ['10-b.webp', 'b'],
    ]);
  });

  it('falla si la portada no tiene fotos', () => {
    expect(() => laminasPortada([], catalogoDeTres())).toThrow(/no tiene fotografías/);
  });

  it('falla nombrando el archivo y el slug si la obra no existe', () => {
    expect(() => laminasPortada(fotos('00-z.webp'), catalogoDeTres())).toThrow(/"00-z\.webp".*"z"/);
  });

  it('falla si el archivo no sigue NN-<slug>', () => {
    expect(() => laminasPortada(fotos('portada.webp'), catalogoDeTres())).toThrow(/"portada\.webp".*NN-<slug>/);
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

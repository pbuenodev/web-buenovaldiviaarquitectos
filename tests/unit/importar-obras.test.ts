import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { importarObra, importarPortada, revisarRepetidas } from '../../scripts/importar-obras.mjs';

let base: string;
let opciones: { entrega: string; destino: string; manifiestos: string; portada: string; destinoPortada: string };

const ORIGEN = 'Casa de Prueba';
const carpeta = () => join(opciones.entrega, ORIGEN);

// Cada semilla da un mosaico de bloques distinto, así que su huella también lo es. La misma semilla
// en otro tamaño es la misma imagen, como las repetidas de la entrega real.
async function foto(ancho: number, alto: number, semilla = 1) {
  let x = semilla * 2654435761;
  const azar = () => ((x = (x * 1103515245 + 12345) >>> 0) >>> 16) & 255;
  const bloques = Buffer.from(Array.from({ length: 16 * 12 * 3 }, azar));
  return sharp(bloques, { raw: { width: 16, height: 12, channels: 3 } })
    .resize(ancho, alto, { kernel: 'nearest' })
    .webp({ quality: 90 })
    .toBuffer();
}

const manifiesto = (slug = 'casa-prueba', extra: object = {}) =>
  writeFile(
    join(opciones.manifiestos, `${slug}.json`),
    JSON.stringify({
      origen: ORIGEN,
      nombre: 'Casa de Prueba',
      ciudad: 'Por confirmar',
      ubicacion: 'Por confirmar',
      categoria: 'casas',
      pendientes: ['ciudad', 'ubicacion'],
      orden: 7,
      ...extra,
    }),
  );

const crear = async (nombre: string, ancho = 1200, alto = 800, semilla = Number.parseInt(nombre, 10) + 1, dir = carpeta()) => {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, nombre), await foto(ancho, alto, semilla));
};

const medidas = async (ruta: string) => {
  const { width, height } = await sharp(ruta).metadata();
  return [width, height];
};

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'importar-'));
  opciones = {
    entrega: join(base, 'entrega'),
    destino: join(base, 'destino'),
    manifiestos: join(base, 'manifiestos'),
    portada: join(base, 'portada.json'),
    destinoPortada: join(base, 'assets-portada'),
  };
  await mkdir(carpeta(), { recursive: true });
  await mkdir(opciones.manifiestos, { recursive: true });
  await writeFile(join(carpeta(), '.DS_Store'), 'x');
});

afterEach(() => rm(base, { recursive: true, force: true }));

describe('importarObra', () => {
  it('renumera sin huecos por número de archivo y la primera foto es la portada', async () => {
    await crear('02.webp');
    await crear('00.webp', 4096, 3072);
    await crear('09.webp');
    await manifiesto();
    await importarObra('casa-prueba', opciones);

    const destino = join(opciones.destino, 'casa-prueba');
    expect((await readdir(destino)).sort()).toEqual(['foto-01.webp', 'foto-02.webp', 'foto-03.webp', 'index.yaml']);
    expect(await medidas(join(destino, 'foto-01.webp'))).toEqual([2000, 1500]);

    const yaml = await readFile(join(destino, 'index.yaml'), 'utf8');
    expect(yaml).toContain('orden: 7\n');
    expect(yaml).toContain('portada: foto-01\n');
    expect(yaml).toContain('ciudad: "Por confirmar" # PREGUNTA ABIERTA');
    expect(yaml).not.toContain('carrusel');
    expect(yaml).not.toContain('album');
  });

  it('lee el origen dentro de una subcarpeta y escribe el álbum', async () => {
    const lote = join(opciones.entrega, 'Condominio - Marbella', 'Lote 3');
    await crear('00.webp', 1200, 800, 1, lote);
    await manifiesto('casa-prueba', { origen: 'Condominio - Marbella/Lote 3', orden: 3, album: 'condominio-prueba' });
    await importarObra('casa-prueba', opciones);

    const yaml = await readFile(join(opciones.destino, 'casa-prueba', 'index.yaml'), 'utf8');
    expect(yaml).toContain('orden: 3\n');
    expect(yaml).toContain('album: condominio-prueba\n');
  });

  it('falla si falta el orden o no es entero', async () => {
    await crear('00.webp');
    await manifiesto('casa-prueba', { orden: undefined });
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('falta "orden"');
    await manifiesto('casa-prueba', { orden: '4' });
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('"orden" debe ser un entero');
  });

  it('una reescalada en reescaladas/<origen>/ con el mismo nombre sustituye a la de la carpeta', async () => {
    await crear('00.webp', 1448, 1086);
    await crear('00.webp', 2880, 2160, 1, join(opciones.entrega, 'reescaladas', ORIGEN));
    await manifiesto();
    await importarObra('casa-prueba', opciones);

    expect(await medidas(join(opciones.destino, 'casa-prueba', 'foto-01.webp'))).toEqual([2000, 1500]);
  });

  it('falla nombrando el archivo si no sigue el patrón', async () => {
    await crear('00.webp');
    await crear('IMG_0001.webp', 1200, 800, 5);
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('IMG_0001.webp');
  });

  it('falla si un número se repite', async () => {
    await crear('01.webp');
    await crear('001.webp', 1200, 800, 9);
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('repetido');
  });

  it('falla si la carpeta no tiene fotos', async () => {
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('no tiene fotos');
  });
});

describe('fotos repetidas', () => {
  it('un par declarado deja una sola foto: la mayor, en la posición del número menor', async () => {
    await crear('00.webp', 576, 324, 1);
    await crear('01.webp', 1200, 800, 2);
    await crear('07.webp', 1024, 576, 1);
    await manifiesto('casa-prueba', { repetidas: [['00.webp', '07.webp']] });
    await revisarRepetidas(['casa-prueba'], opciones);
    await importarObra('casa-prueba', opciones);

    const destino = join(opciones.destino, 'casa-prueba');
    expect((await readdir(destino)).filter((n) => n.endsWith('.webp'))).toEqual(['foto-01.webp', 'foto-02.webp']);
    expect(await medidas(join(destino, 'foto-01.webp'))).toEqual([1024, 576]);
    expect(await medidas(join(destino, 'foto-02.webp'))).toEqual([1200, 800]);
  });

  it('una repetida no declarada hace fallar nombrando ambos archivos', async () => {
    await crear('00.webp', 576, 324, 1);
    await crear('07.webp', 1024, 576, 1);
    await manifiesto();
    await expect(revisarRepetidas(['casa-prueba'], opciones)).rejects.toThrow(
      /Casa de Prueba\/00\.webp\s+=\s+Casa de Prueba\/07\.webp/,
    );
  });

  it('una repetida entre obras distintas falla aunque una obra la declare', async () => {
    await crear('00.webp', 1200, 800, 1);
    await crear('00.webp', 600, 400, 1, join(opciones.entrega, 'Otra Casa'));
    await manifiesto('casa-prueba', { repetidas: [['00.webp', '00.webp']] });
    await manifiesto('otra-casa', { origen: 'Otra Casa' });
    await expect(revisarRepetidas(['casa-prueba', 'otra-casa'], opciones)).rejects.toThrow('Otra Casa/00.webp');
  });

  it('fotos distintas no se toman por repetidas', async () => {
    for (let i = 0; i < 6; i++) await crear(`0${i}.webp`, 1200, 800, i + 10);
    await manifiesto();
    await expect(revisarRepetidas(['casa-prueba'], opciones)).resolves.toBeUndefined();
  });

  it('falla si el par declarado no es la misma foto', async () => {
    await crear('00.webp', 1200, 800, 1);
    await crear('01.webp', 1200, 800, 2);
    await manifiesto('casa-prueba', { repetidas: [['00.webp', '01.webp']] });
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('no son la misma foto');
  });
});

describe('importarPortada', () => {
  const PORTADA = '00 PARA LA PORTADA';
  const dirPortada = () => join(opciones.entrega, PORTADA);
  const declarar = (fotos: Record<string, string>) =>
    writeFile(opciones.portada, JSON.stringify({ origen: PORTADA, fotos }));

  beforeEach(async () => {
    await manifiesto();
    await manifiesto('otra-casa', { origen: 'Otra Casa' });
  });

  it('escribe NN-<slug>.webp en orden, con hasta 2880 px y aceptando dos fotos de una obra', async () => {
    await crear('00.webp', 4032, 3024, 1, dirPortada());
    await crear('01.webp', 3024, 4032, 2, dirPortada());
    await crear('02.webp', 1000, 750, 3, dirPortada());
    await crear('02.webp', 2880, 2160, 3, join(opciones.entrega, 'reescaladas', PORTADA));
    await declarar({ '00.webp': 'casa-prueba', '01.webp': 'otra-casa', '02.webp': 'otra-casa' });
    await mkdir(opciones.destinoPortada, { recursive: true });
    await writeFile(join(opciones.destinoPortada, '09-vieja.webp'), 'x');
    await importarPortada(opciones);

    expect((await readdir(opciones.destinoPortada)).sort()).toEqual(['00-casa-prueba.webp', '01-otra-casa.webp', '02-otra-casa.webp']);
    expect(await medidas(join(opciones.destinoPortada, '00-casa-prueba.webp'))).toEqual([2880, 2160]);
    expect(await medidas(join(opciones.destinoPortada, '01-otra-casa.webp'))).toEqual([2160, 2880]);
    expect(await medidas(join(opciones.destinoPortada, '02-otra-casa.webp'))).toEqual([2880, 2160]);
  });

  it('falla si una foto de la carpeta no tiene obra', async () => {
    await crear('00.webp', 1200, 800, 1, dirPortada());
    await crear('01.webp', 1200, 800, 2, dirPortada());
    await declarar({ '00.webp': 'casa-prueba' });
    await expect(importarPortada(opciones)).rejects.toThrow('01.webp no tiene obra');
  });

  it('falla si una foto declarada no existe', async () => {
    await crear('00.webp', 1200, 800, 1, dirPortada());
    await declarar({ '00.webp': 'casa-prueba', '03.webp': 'casa-prueba' });
    await expect(importarPortada(opciones)).rejects.toThrow('no existe 00 PARA LA PORTADA/03.webp');
  });

  it('falla si la obra no existe', async () => {
    await crear('00.webp', 1200, 800, 1, dirPortada());
    await declarar({ '00.webp': 'casa-inventada' });
    await expect(importarPortada(opciones)).rejects.toThrow('"casa-inventada", que no existe');
  });
});

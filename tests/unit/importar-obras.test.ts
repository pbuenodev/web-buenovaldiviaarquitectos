import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { importarObra } from '../../scripts/importar-obras.mjs';

let base: string;
let opciones: { entrega: string; destino: string; manifiestos: string };
let carpeta: string;

const foto = (ancho: number, alto: number) =>
  sharp({ create: { width: ancho, height: alto, channels: 3, background: '#888' } }).webp().toBuffer();

const manifiesto = (extra: object = {}) =>
  writeFile(
    join(opciones.manifiestos, 'casa-prueba.json'),
    JSON.stringify({
      origen: '07-casa-prueba',
      nombre: 'Casa de Prueba',
      ciudad: 'Por confirmar',
      ubicacion: 'Por confirmar',
      categoria: 'casas',
      pendientes: ['ciudad', 'ubicacion'],
      ...extra,
    }),
  );

const crear = async (nombre: string, ancho = 1200, alto = 800) =>
  writeFile(join(carpeta, nombre), await foto(ancho, alto));

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'importar-'));
  opciones = { entrega: join(base, 'entrega'), destino: join(base, 'destino'), manifiestos: join(base, 'manifiestos') };
  carpeta = join(opciones.entrega, '07-casa-prueba');
  await mkdir(carpeta, { recursive: true });
  await mkdir(join(opciones.entrega, 'reescaladas'), { recursive: true });
  await mkdir(opciones.manifiestos, { recursive: true });
  await writeFile(join(carpeta, '.DS_Store'), 'x');
});

afterEach(() => rm(base, { recursive: true, force: true }));

describe('importarObra', () => {
  it('renumera sin huecos, toma el orden de la carpeta y la favorita como portada', async () => {
    await crear('casa-prueba-02.webp');
    await crear('casa-prueba-05FAVORITA.webp', 4096, 3072);
    await crear('casa-prueba-09.webp');
    await manifiesto();
    await importarObra('casa-prueba', opciones);

    const destino = join(opciones.destino, 'casa-prueba');
    expect((await readdir(destino)).sort()).toEqual(['foto-01.webp', 'foto-02.webp', 'foto-03.webp', 'index.yaml']);
    expect((await sharp(join(destino, 'foto-02.webp')).metadata()).width).toBe(2000);

    const yaml = await readFile(join(destino, 'index.yaml'), 'utf8');
    expect(yaml).toContain('orden: 7\n');
    expect(yaml).toContain('portada: foto-02\n');
    expect(yaml).toContain('ciudad: "Por confirmar" # PREGUNTA ABIERTA');
    expect(yaml).not.toContain('carrusel');
    expect(yaml).not.toContain('album');
  });

  it('la foto del carrusel conserva hasta 2880 px', async () => {
    await crear('casa-prueba-01FAVORITA.webp', 4096, 3072);
    await manifiesto({ carrusel: { orden: 3 } });
    await importarObra('casa-prueba', opciones);

    const destino = join(opciones.destino, 'casa-prueba');
    expect((await sharp(join(destino, 'foto-01.webp')).metadata()).width).toBe(2880);
    expect(await readFile(join(destino, 'index.yaml'), 'utf8')).toContain('carrusel:\n  foto: foto-01\n  orden: 3');
  });

  it('el manifiesto puede fijar el orden y el álbum', async () => {
    await crear('casa-prueba-01FAVORITA.webp');
    await manifiesto({ orden: 4, album: 'condominio-prueba' });
    await importarObra('casa-prueba', opciones);

    const yaml = await readFile(join(opciones.destino, 'casa-prueba', 'index.yaml'), 'utf8');
    expect(yaml).toContain('orden: 4\n');
    expect(yaml).toContain('album: condominio-prueba\n');
  });

  it('falla si el orden del manifiesto no es entero', async () => {
    await crear('casa-prueba-01FAVORITA.webp');
    await manifiesto({ orden: '4' });
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('"orden" debe ser un entero');
  });

  it('una reescalada con el mismo nombre sustituye a la de la carpeta', async () => {
    await crear('casa-prueba-01FAVORITA.webp', 1448, 1086);
    await writeFile(join(opciones.entrega, 'reescaladas', 'casa-prueba-01FAVORITA.webp'), await foto(2880, 2160));
    await manifiesto();
    await importarObra('casa-prueba', opciones);

    const metadatos = await sharp(join(opciones.destino, 'casa-prueba', 'foto-01.webp')).metadata();
    expect(metadatos.width).toBe(2000);
  });

  it('falla si la obra no tiene favorita', async () => {
    await crear('casa-prueba-01.webp');
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('una sola foto FAVORITA y hay 0');
  });

  it('falla si hay dos favoritas', async () => {
    await crear('casa-prueba-01FAVORITA.webp');
    await crear('casa-prueba-02FAVORITA.webp');
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('una sola foto FAVORITA y hay 2');
  });

  it('falla nombrando el archivo si no sigue el patrón', async () => {
    await crear('casa-prueba-01FAVORITA.webp');
    await crear('IMG_0001.webp');
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('IMG_0001.webp');
  });

  it('falla si un número se repite', async () => {
    await crear('casa-prueba-01FAVORITA.webp');
    await crear('casa-prueba-01.webp');
    await manifiesto();
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('repetido');
  });

  it('falla si el origen no corresponde al slug', async () => {
    await crear('casa-prueba-01FAVORITA.webp');
    await manifiesto({ origen: '07-otra-casa' });
    await expect(importarObra('casa-prueba', opciones)).rejects.toThrow('NN-casa-prueba');
  });
});

import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  leerArgumentos,
  planificar,
  PREDETERMINADOS,
  reescalarFoto,
  rutaSalida,
} from '../../scripts/reescalar-imagenes.mjs';

let base: string;
beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), 'reescalar-test-'));
});
afterEach(() => rm(base, { recursive: true, force: true }));

const crear = (ruta: string, ancho: number, alto: number) =>
  sharp({ create: { width: ancho, height: alto, channels: 3, background: '#888' } }).webp().toFile(ruta);

// Sustituto de Real-ESRGAN: amplía 4× de forma clásica, sin necesitar GPU ni el binario.
const iaFalsa = async (entrada: string, salida: string) => {
  const { width } = await sharp(entrada).metadata();
  await sharp(entrada).resize({ width: width! * 4 }).toFile(salida);
};

describe('planificar', () => {
  it('amplía al ancho pedido conservando la proporción', () => {
    expect(planificar(1448, 1086, 2880)).toEqual({ reescalar: true, anchoFinal: 2880, altoFinal: 2160 });
  });

  it('no amplía una foto que ya alcanza el ancho', () => {
    expect(planificar(3200, 2400, 2880)).toEqual({ reescalar: false, anchoFinal: 3200, altoFinal: 2400 });
    expect(planificar(2880, 2160, 2880).reescalar).toBe(false);
  });
});

describe('rutaSalida', () => {
  it('conserva el nombre y deja siempre .webp', () => {
    expect(rutaSalida('/a/b/foto-01FAVORITA.png', '/x')).toBe('/x/foto-01FAVORITA.webp');
  });
});

describe('leerArgumentos', () => {
  it('usa los valores predeterminados y separa entradas de opciones', () => {
    const o = leerArgumentos(['a.webp', 'carpeta', '--salida', '/tmp/s', '--ancho', '2560']);
    expect(o).toMatchObject({ ...PREDETERMINADOS, ancho: 2560, entradas: ['a.webp', 'carpeta'], salida: '/tmp/s' });
  });

  it('rechaza opciones desconocidas y valores fuera de rango', () => {
    expect(() => leerArgumentos(['--nada', '1'])).toThrow(/desconocida/);
    expect(() => leerArgumentos(['--mezcla', '1.5'])).toThrow(/mezcla/);
    expect(() => leerArgumentos(['--ancho', 'x'])).toThrow(/ancho/);
  });
});

describe('reescalarFoto', () => {
  it('amplía al ancho pedido y no toca el original', async () => {
    const entrada = join(base, 'entrada.webp');
    const salida = join(base, 'salida', 'foto.webp');
    await crear(entrada, 400, 300);
    const antes = (await stat(entrada)).mtimeMs;

    const r = await reescalarFoto(entrada, salida, { ancho: 1000, ia: iaFalsa });

    expect(r).toMatchObject({ omitida: false, anchoFinal: 1000, altoFinal: 750 });
    expect(await sharp(salida).metadata()).toMatchObject({ width: 1000, height: 750, format: 'webp' });
    expect((await stat(entrada)).mtimeMs).toBe(antes);
  });

  it('con una foto que ya es grande no llama a la IA y solo convierte a WebP', async () => {
    const entrada = join(base, 'grande.webp');
    const salida = join(base, 'salida.webp');
    await crear(entrada, 1200, 800);
    const r = await reescalarFoto(entrada, salida, {
      ancho: 1000,
      ia: async () => {
        throw new Error('no debía llamarse');
      },
    });
    expect(r.omitida).toBe(true);
    expect((await sharp(salida).metadata()).width).toBe(1200);
  });

  it('se niega a sobrescribir el original', async () => {
    const entrada = join(base, 'a.webp');
    await crear(entrada, 400, 300);
    await expect(reescalarFoto(entrada, entrada, { ancho: 1000, ia: iaFalsa })).rejects.toThrow(/mismo archivo/);
  });
});

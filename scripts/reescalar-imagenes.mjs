#!/usr/bin/env node
// Reescala fotografías con Real-ESRGAN (IA, corre en la GPU vía Vulkan) para usarlas de fondo a pantalla completa.
//
// Uso:
//   node scripts/reescalar-imagenes.mjs instalar
//   node scripts/reescalar-imagenes.mjs <foto|carpeta> [...] --salida <carpeta> [--ancho 2880] [--mezcla 0.85] [--calidad 90] [--modelo realesrgan-x4plus]
//
// Receta: la IA amplía 4× y el resultado se reduce al ancho pedido con Lanczos (esto atenúa sus artefactos); luego se
// mezcla con la foto ampliada de forma clásica para conservar la textura natural (--mezcla = peso de la IA, 0 a 1).
// Nunca modifica los originales: siempre escribe en otra carpeta.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const ejecutar = promisify(execFile);
const RAIZ = fileURLToPath(new URL('../', import.meta.url));

// Release oficial de Real-ESRGAN-ncnn-vulkan (incluye los modelos). El hash fija exactamente ese archivo.
const RELEASE = {
  version: 'v0.2.5.0',
  url: 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip',
  sha256: 'e5aa6eb131234b87c0c51f82b89390f5e3e642b7b70f2b9bbe95b6a285a40c96',
};
const CARPETA_HERRAMIENTA = join(RAIZ, 'tools/realesrgan');
const BINARIO = join(CARPETA_HERRAMIENTA, 'realesrgan-ncnn-vulkan');
const MODELOS = join(CARPETA_HERRAMIENTA, 'models');
const EXTENSIONES = new Set(['.webp', '.jpg', '.jpeg', '.png']);

export const PREDETERMINADOS = { ancho: 2880, mezcla: 0.85, calidad: 90, modelo: 'realesrgan-x4plus' };

/** Decide si una foto necesita ampliarse y a qué tamaño final queda. */
export function planificar(anchoOrigen, altoOrigen, anchoObjetivo) {
  if (anchoOrigen >= anchoObjetivo) return { reescalar: false, anchoFinal: anchoOrigen, altoFinal: altoOrigen };
  return {
    reescalar: true,
    anchoFinal: anchoObjetivo,
    altoFinal: Math.round((altoOrigen * anchoObjetivo) / anchoOrigen),
  };
}

export function rutaSalida(entrada, carpetaSalida) {
  return join(carpetaSalida, `${basename(entrada, extname(entrada))}.webp`);
}

export function leerArgumentos(argv) {
  const opciones = { ...PREDETERMINADOS, salida: undefined, entradas: [] };
  const numericas = new Set(['ancho', 'mezcla', 'calidad']);
  for (let i = 0; i < argv.length; i++) {
    const clave = argv[i].startsWith('--') ? argv[i].slice(2) : null;
    if (!clave) opciones.entradas.push(argv[i]);
    else if (clave === 'salida') opciones.salida = resolve(argv[++i] ?? '');
    else if (clave === 'modelo') opciones.modelo = argv[++i];
    else if (numericas.has(clave)) opciones[clave] = Number(argv[++i]);
    else throw new Error(`Opción desconocida: --${clave}`);
  }
  if (!Number.isFinite(opciones.ancho) || opciones.ancho < 100) throw new Error('--ancho debe ser un número de píxeles');
  if (!(opciones.mezcla >= 0 && opciones.mezcla <= 1)) throw new Error('--mezcla debe estar entre 0 y 1');
  if (!(opciones.calidad >= 1 && opciones.calidad <= 100)) throw new Error('--calidad debe estar entre 1 y 100');
  return opciones;
}

async function listarFotos(entradas) {
  const fotos = [];
  for (const entrada of entradas) {
    const ruta = resolve(entrada);
    if ((await stat(ruta)).isDirectory()) {
      const nombres = (await readdir(ruta)).filter((n) => EXTENSIONES.has(extname(n).toLowerCase())).sort();
      fotos.push(...nombres.map((n) => join(ruta, n)));
    } else fotos.push(ruta);
  }
  return fotos;
}

/** Ejecuta Real-ESRGAN sobre un PNG. Se puede sustituir (las pruebas lo hacen) pasando `ia` a reescalarFoto. */
async function ejecutarRealEsrgan(entradaPng, salidaPng, { modelo }) {
  try {
    await stat(BINARIO);
  } catch {
    throw new Error('Real-ESRGAN no está instalado. Ejecuta `pnpm reescalar:instalar`.');
  }
  await ejecutar(BINARIO, ['-i', entradaPng, '-o', salidaPng, '-n', modelo, '-m', MODELOS, '-s', '4', '-f', 'png'], {
    timeout: 10 * 60 * 1000,
  });
}

export async function reescalarFoto(entrada, salida, opciones = {}) {
  const { ancho, mezcla, calidad, modelo } = { ...PREDETERMINADOS, ...opciones };
  const ia = opciones.ia ?? ejecutarRealEsrgan;
  if (resolve(salida) === resolve(entrada)) throw new Error('La salida no puede ser el mismo archivo que la entrada.');

  const { data: png, info } = await sharp(entrada).rotate().png().toBuffer({ resolveWithObject: true });
  const plan = planificar(info.width, info.height, ancho);
  await mkdir(dirname(salida), { recursive: true });
  if (!plan.reescalar) {
    await sharp(png).webp({ quality: calidad, effort: 6 }).toFile(salida);
    return { omitida: true, ...plan, anchoOrigen: info.width, altoOrigen: info.height };
  }

  const temporal = await mkdtemp(join(tmpdir(), 'reescalar-'));
  try {
    const entradaPng = join(temporal, 'entrada.png');
    const salidaPng = join(temporal, 'salida.png');
    await writeFile(entradaPng, png);
    await ia(entradaPng, salidaPng, { modelo });

    const clasica = await sharp(png).resize({ width: plan.anchoFinal, kernel: 'lanczos3' }).png().toBuffer();
    const porIA = await sharp(salidaPng)
      .resize({ width: plan.anchoFinal, kernel: 'lanczos3' })
      .ensureAlpha(mezcla)
      .png()
      .toBuffer();
    await sharp(clasica)
      .composite([{ input: porIA }])
      .webp({ quality: calidad, effort: 6 })
      .toFile(salida);
    return { omitida: false, ...plan, anchoOrigen: info.width, altoOrigen: info.height };
  } finally {
    await rm(temporal, { recursive: true, force: true });
  }
}

/** Descarga el release oficial, comprueba su hash y deja binario y modelos en tools/realesrgan/ (ignorada por git). */
export async function instalar() {
  if (process.platform !== 'linux') {
    throw new Error('El instalador solo cubre Linux. En otro sistema descarga Real-ESRGAN-ncnn-vulkan a mano en tools/realesrgan/.');
  }
  const respuesta = await fetch(RELEASE.url);
  if (!respuesta.ok) throw new Error(`No se pudo descargar ${RELEASE.url} (HTTP ${respuesta.status})`);
  const contenido = Buffer.from(await respuesta.arrayBuffer());
  const hash = createHash('sha256').update(contenido).digest('hex');
  if (hash !== RELEASE.sha256) throw new Error(`El hash del archivo descargado no coincide.\n  esperado: ${RELEASE.sha256}\n  obtenido: ${hash}`);

  const temporal = await mkdtemp(join(tmpdir(), 'realesrgan-'));
  try {
    const zip = join(temporal, 'release.zip');
    await writeFile(zip, contenido);
    await mkdir(CARPETA_HERRAMIENTA, { recursive: true });
    await ejecutar('unzip', ['-q', '-o', zip, 'realesrgan-ncnn-vulkan', 'models/*', '-d', CARPETA_HERRAMIENTA]);
    await chmod(BINARIO, 0o755);
  } finally {
    await rm(temporal, { recursive: true, force: true });
  }
  return CARPETA_HERRAMIENTA;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'instalar') {
      console.log(`✓ Real-ESRGAN ${RELEASE.version} instalado en ${await instalar()}`);
    } else {
      const opciones = leerArgumentos(process.argv.slice(2));
      if (!opciones.entradas.length || !opciones.salida) {
        throw new Error('Uso: pnpm reescalar <foto|carpeta> [...] --salida <carpeta> [--ancho 2880] [--mezcla 0.85] [--calidad 90]');
      }
      const fotos = await listarFotos(opciones.entradas);
      if (!fotos.length) throw new Error('No se encontró ninguna foto (.webp, .jpg, .png).');
      for (const foto of fotos) {
        const destino = rutaSalida(foto, opciones.salida);
        const r = await reescalarFoto(foto, destino, opciones);
        console.log(
          r.omitida
            ? `= ${basename(foto)}: ya mide ${r.anchoOrigen} px, solo se convirtió a WebP`
            : `✓ ${basename(foto)}: ${r.anchoOrigen}×${r.altoOrigen} → ${r.anchoFinal}×${r.altoFinal}`,
        );
      }
    }
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
}

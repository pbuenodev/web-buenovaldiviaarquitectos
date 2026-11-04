#!/usr/bin/env node
// Falla si alguna imagen AVIF generada en dist/ supera el peso máximo.
// Las de hasta 1600 px de ancho tienen el límite base; las más anchas (solo el carrusel) tienen uno mayor.
// Uso: node scripts/verificar-imagenes.mjs [límite en KB] [límite para > 1600 px en KB]   (por defecto 300 y 400)
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const DIST = new URL('../dist/', import.meta.url).pathname;
const limiteKB = Number(process.argv[2] ?? 300);
const limiteAnchasKB = Number(process.argv[3] ?? 400);
const ANCHO_BASE = 1600;

async function* archivos(carpeta) {
  for (const entrada of await readdir(carpeta, { withFileTypes: true })) {
    const ruta = join(carpeta, entrada.name);
    if (entrada.isDirectory()) yield* archivos(ruta);
    else yield ruta;
  }
}

let total = 0;
let mayor = 0;
const excedidas = [];
try {
  for await (const ruta of archivos(DIST)) {
    if (!ruta.endsWith('.avif')) continue;
    total++;
    const kb = (await stat(ruta)).size / 1024;
    mayor = Math.max(mayor, kb);
    const { width } = await sharp(ruta).metadata();
    const limite = width > ANCHO_BASE ? limiteAnchasKB : limiteKB;
    if (kb > limite) excedidas.push([relative(DIST, ruta), kb, width, limite]);
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('No existe dist/. Ejecuta primero `pnpm build`.');
    process.exit(1);
  }
  throw error;
}

if (total === 0) {
  console.error('No se encontró ninguna imagen AVIF en dist/.');
  process.exit(1);
}

if (excedidas.length > 0) {
  console.error(`${excedidas.length} de ${total} imágenes AVIF superan su límite:`);
  for (const [ruta, kb, ancho, limite] of excedidas.sort((a, b) => b[1] - a[1])) {
    console.error(`  ${kb.toFixed(0)} KB (límite ${limite} KB, ${ancho} px)  ${ruta}`);
  }
  process.exit(1);
}

console.log(`${total} imágenes AVIF, la mayor de ${mayor.toFixed(0)} KB (límite ${limiteKB} KB hasta ${ANCHO_BASE} px, ${limiteAnchasKB} KB más anchas).`);

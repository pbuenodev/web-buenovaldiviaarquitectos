#!/usr/bin/env node
// Falla si alguna imagen AVIF generada en dist/ supera el peso máximo.
// Uso: node scripts/verificar-imagenes.mjs [límite en KB]   (por defecto 300)
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const limiteKB = Number(process.argv[2] ?? 300);

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
    if (kb > limiteKB) excedidas.push([relative(DIST, ruta), kb]);
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
  console.error(`${excedidas.length} de ${total} imágenes AVIF superan los ${limiteKB} KB:`);
  for (const [ruta, kb] of excedidas.sort((a, b) => b[1] - a[1])) console.error(`  ${kb.toFixed(0)} KB  ${ruta}`);
  process.exit(1);
}

console.log(`${total} imágenes AVIF, la mayor de ${mayor.toFixed(0)} KB (límite ${limiteKB} KB).`);

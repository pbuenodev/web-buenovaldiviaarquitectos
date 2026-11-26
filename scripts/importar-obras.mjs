#!/usr/bin/env node
// Importa la entrega del cliente («webPabloBueno-fotografiasCierre») a src/content/obras/<slug>/ y a src/assets/portada/.
// Uso: node scripts/importar-obras.mjs [--entrega <carpeta>] [--destino <carpeta>] [--manifiestos <carpeta>]
//        [--portada <manifiesto>] [--destino-portada <carpeta>] [slug ... | portada]
// Cada obra tiene un manifiesto scripts/obras/<slug>.json que dice de qué carpeta de la entrega salen sus fotos
// (`origen`) y su posición (`orden`). Dentro de la carpeta, las fotos se llaman 00.webp, 01.webp…: el número
// fija el orden en la ficha y la primera es la portada. scripts/portada.json dice qué fotos forman el hero y
// de qué obra es cada una. Antes de importar se buscan fotos repetidas en toda la entrega. Sin argumentos,
// importa todas las obras y el hero.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const LADO_MAXIMO = 2000;
// Las fotos del hero se ven a pantalla completa (hasta 2560 px de ancho en el sitio), así que conservan más resolución.
const LADO_MAXIMO_PORTADA = 2880;
const CALIDAD_WEBP = 85;
// Distancia de Hamming máxima entre huellas para considerar dos fotos la misma imagen. En la entrega del cierre,
// las repetidas reales dieron 0 y las fotos distintas más parecidas, 12 o más.
const UMBRAL_REPETIDA = 6;
const PATRON_FOTO = /^(\d{2,3})\.webp$/;

function leerArgumentos(argv) {
  const opciones = {
    entrega: join(process.env.HOME ?? '', 'Descargas/webPabloBueno-fotografiasCierre'),
    destino: join(RAIZ, 'src/content/obras'),
    manifiestos: join(RAIZ, 'scripts/obras'),
    portada: join(RAIZ, 'scripts/portada.json'),
    destinoPortada: join(RAIZ, 'src/assets/portada'),
    slugs: [],
  };
  const banderas = { '--entrega': 'entrega', '--destino': 'destino', '--manifiestos': 'manifiestos', '--portada': 'portada', '--destino-portada': 'destinoPortada' };
  for (let i = 0; i < argv.length; i++) {
    if (banderas[argv[i]]) opciones[banderas[argv[i]]] = resolve(argv[++i] ?? '');
    else opciones.slugs.push(argv[i]);
  }
  return opciones;
}

const existe = (ruta) => stat(ruta).then(() => true, () => false);

async function leerManifiesto(slug, manifiestos) {
  const m = JSON.parse(await readFile(join(manifiestos, `${slug}.json`), 'utf8'));
  for (const campo of ['origen', 'nombre', 'ciudad', 'ubicacion', 'categoria', 'orden']) {
    if (m[campo] === undefined) throw new Error(`${slug}: falta "${campo}" en el manifiesto`);
  }
  if (!Number.isInteger(m.orden)) throw new Error(`${slug}: "orden" debe ser un entero`);
  return m;
}

/** Fotos de una carpeta de la entrega, ordenadas por número. Falla nombrando el archivo que no sigue el patrón. */
async function listarFotos(carpeta, etiqueta) {
  if (!(await existe(carpeta))) throw new Error(`${etiqueta}: no existe la carpeta ${carpeta}`);
  const fotos = [];
  for (const nombre of (await readdir(carpeta)).filter((n) => n !== '.DS_Store' && n !== 'reescaladas').sort()) {
    const partes = PATRON_FOTO.exec(nombre);
    if (!partes) throw new Error(`${etiqueta}: el nombre ${nombre} no sigue el patrón NN.webp`);
    fotos.push({ nombre, numero: Number(partes[1]), ruta: join(carpeta, nombre) });
  }
  const repetido = fotos.find((f, i) => fotos.findIndex((g) => g.numero === f.numero) !== i);
  if (repetido) throw new Error(`${etiqueta}: el número ${repetido.numero} está repetido (${repetido.nombre})`);
  return fotos.sort((a, b) => a.numero - b.numero);
}

/** Huella perceptual (dHash de 64 bits): compara el brillo de cada píxel con su vecino en una miniatura de 9×8. */
export async function huella(ruta) {
  const px = await sharp(ruta).rotate().grayscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = 0n;
  for (let fila = 0; fila < 8; fila++) {
    for (let col = 0; col < 8; col++) {
      bits = (bits << 1n) | (px[fila * 9 + col] > px[fila * 9 + col + 1] ? 1n : 0n);
    }
  }
  return bits;
}

export function distancia(a, b) {
  let x = a ^ b;
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

const mismoPar = (par, a, b) => (par[0] === a && par[1] === b) || (par[0] === b && par[1] === a);

/**
 * Busca fotos repetidas en las carpetas de todas las obras de la entrega (no en la portada).
 * Un par dentro de una obra que su manifiesto declara en `repetidas` se acepta; cualquier otro hace fallar.
 */
export async function revisarRepetidas(slugs, { entrega, manifiestos }) {
  const fotos = [];
  for (const slug of slugs) {
    const m = await leerManifiesto(slug, manifiestos);
    for (const f of await listarFotos(join(entrega, m.origen), slug)) {
      fotos.push({ slug, nombre: f.nombre, ruta: join(m.origen, f.nombre), huella: await huella(f.ruta), declaradas: m.repetidas ?? [] });
    }
  }
  const problemas = [];
  for (let i = 0; i < fotos.length; i++) {
    for (let j = i + 1; j < fotos.length; j++) {
      const [a, b] = [fotos[i], fotos[j]];
      const d = distancia(a.huella, b.huella);
      if (d > UMBRAL_REPETIDA) continue;
      const declarada = a.slug === b.slug && a.declaradas.some((par) => mismoPar(par, a.nombre, b.nombre));
      if (!declarada) problemas.push(`  ${a.ruta}  =  ${b.ruta}  (distancia ${d})`);
    }
  }
  if (problemas.length) {
    throw new Error(
      `Hay fotos repetidas. Si están en la misma obra, declara el par en "repetidas" de su manifiesto; si no, corrige la entrega:\n${problemas.join('\n')}`,
    );
  }
}

/** Aplica los pares de `repetidas`: queda la de mayor resolución, en la posición del número menor. */
async function quitarRepetidas(slug, fotos, repetidas = []) {
  for (const par of repetidas) {
    const [a, b] = par.map((nombre) => fotos.find((f) => f.nombre === nombre));
    if (!a || !b) throw new Error(`${slug}: el par repetido ${par.join(' / ')} nombra una foto que no está`);
    const d = distancia(await huella(a.ruta), await huella(b.ruta));
    if (d > UMBRAL_REPETIDA) throw new Error(`${slug}: ${par.join(' y ')} no son la misma foto (distancia ${d})`);
    const area = async (f) => {
      const { width = 0, height = 0 } = await sharp(f.ruta).metadata();
      return width * height;
    };
    const mayor = (await area(a)) >= (await area(b)) ? a : b;
    const [primera, segunda] = a.numero < b.numero ? [a, b] : [b, a];
    primera.ruta = mayor.ruta;
    fotos.splice(fotos.indexOf(segunda), 1);
  }
  return fotos;
}

// Una versión ampliada con el mismo nombre en reescaladas/<origen>/ sustituye a la de la entrega.
async function fuente(entrega, origen, foto) {
  const reescalada = join(entrega, 'reescaladas', origen, foto.nombre);
  return (await existe(reescalada)) ? reescalada : foto.ruta;
}

const convertir = (ruta, lado, salida) =>
  sharp(ruta)
    .rotate()
    .resize({ width: lado, height: lado, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: CALIDAD_WEBP })
    .toFile(salida);

function yamlObra(m, portada) {
  const pendiente = (campo) => (m.pendientes?.includes(campo) ? ' # PREGUNTA ABIERTA' : '');
  const lineas = [
    `nombre: ${JSON.stringify(m.nombre)}`,
    `ciudad: ${JSON.stringify(m.ciudad)}${pendiente('ciudad')}`,
    `ubicacion: ${JSON.stringify(m.ubicacion)}${pendiente('ubicacion')}`,
    `categoria: ${m.categoria}`,
    `orden: ${m.orden}`,
    `portada: ${portada}`,
  ];
  if (m.album) lineas.push(`album: ${m.album}`);
  return lineas.join('\n') + '\n';
}

export async function importarObra(slug, { entrega, destino, manifiestos }) {
  const m = await leerManifiesto(slug, manifiestos);
  const fotos = await quitarRepetidas(slug, await listarFotos(join(entrega, m.origen), slug), m.repetidas);
  if (!fotos.length) throw new Error(`${slug}: la carpeta ${m.origen} no tiene fotos`);

  const carpeta = join(destino, slug);
  await rm(carpeta, { recursive: true, force: true });
  await mkdir(carpeta, { recursive: true });

  const ancho = Math.max(2, String(fotos.length).length);
  const archivos = fotos.map((_, i) => `foto-${String(i + 1).padStart(ancho, '0')}.webp`);
  for (const [i, f] of fotos.entries()) {
    // Tras quitar una repetida, la foto puede venir de otro archivo: la reescalada se busca por ese archivo.
    const ruta = await fuente(entrega, m.origen, { nombre: basename(f.ruta), ruta: f.ruta });
    await convertir(ruta, LADO_MAXIMO, join(carpeta, archivos[i]));
  }

  await writeFile(join(carpeta, 'index.yaml'), yamlObra(m, basename(archivos[0], '.webp')));
  return { slug, fotos: fotos.length };
}

/** Escribe las fotos del hero como NN-<slug>.webp: el nombre lleva el orden y la obra (para su texto alternativo). */
export async function importarPortada({ entrega, manifiestos, portada, destinoPortada }) {
  const m = JSON.parse(await readFile(portada, 'utf8'));
  if (!m.origen || !m.fotos) throw new Error('portada: el manifiesto necesita "origen" y "fotos"');
  const fotos = await listarFotos(join(entrega, m.origen), 'portada');
  const sinDeclarar = fotos.filter((f) => !m.fotos[f.nombre]);
  if (sinDeclarar.length) throw new Error(`portada: ${sinDeclarar.map((f) => f.nombre).join(', ')} no tiene obra en el manifiesto`);
  for (const [nombre, slug] of Object.entries(m.fotos)) {
    if (!fotos.some((f) => f.nombre === nombre)) throw new Error(`portada: no existe ${join(m.origen, nombre)}`);
    if (!(await existe(join(manifiestos, `${slug}.json`)))) throw new Error(`portada: ${nombre} nombra la obra "${slug}", que no existe`);
  }
  if (!fotos.length) throw new Error('portada: la carpeta no tiene fotos');

  await rm(destinoPortada, { recursive: true, force: true });
  await mkdir(destinoPortada, { recursive: true });
  for (const f of fotos) {
    const salida = `${String(f.numero).padStart(2, '0')}-${m.fotos[f.nombre]}.webp`;
    await convertir(await fuente(entrega, m.origen, f), LADO_MAXIMO_PORTADA, join(destinoPortada, salida));
  }
  return { fotos: fotos.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const opciones = leerArgumentos(process.argv.slice(2));
  const todas = (await readdir(opciones.manifiestos)).filter((n) => n.endsWith('.json')).map((n) => basename(n, '.json')).sort();
  const pedidas = opciones.slugs.length ? opciones.slugs : [...todas, 'portada'];
  let fallos = 0;
  try {
    // Siempre sobre toda la entrega: una obra importada sola tampoco puede repetir la foto de otra.
    await revisarRepetidas(todas, opciones);
    console.log(`✓ sin fotos repetidas en ${todas.length} obras`);
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
  for (const pedida of pedidas) {
    try {
      if (pedida === 'portada') console.log(`✓ portada: ${(await importarPortada(opciones)).fotos} fotos`);
      else console.log(`✓ ${pedida}: ${(await importarObra(pedida, opciones)).fotos} fotos`);
    } catch (error) {
      fallos++;
      console.error(`✗ ${error.message}`);
    }
  }
  process.exit(fallos ? 1 : 0);
}

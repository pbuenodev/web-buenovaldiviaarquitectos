#!/usr/bin/env node
// Importa las obras de la carpeta «Seleccion Portafolio» del cliente a src/content/obras/<slug>/.
// Uso: node scripts/importar-obras.mjs [--entrega <carpeta>] [--destino <carpeta>] [--manifiestos <carpeta>] [slug ...]
// La carpeta del cliente manda: `NN-<slug>/` fija la posición de la obra (NN) y su slug, y cada foto
// `<slug>-NN.webp` el orden en la ficha; la que lleva `FAVORITA` es la portada. Los datos de la obra
// están en scripts/obras/<slug>.json (ver README). Sin slugs, importa todas.
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = fileURLToPath(new URL('../', import.meta.url));
const LADO_MAXIMO = 2000;
// La foto del carrusel se ve a pantalla completa (hasta 2560 px de ancho en el sitio), así que conserva más resolución.
const LADO_MAXIMO_CARRUSEL = 2880;
const CALIDAD_WEBP = 85;

function leerArgumentos(argv) {
  const opciones = {
    entrega: join(process.env.HOME ?? '', 'Descargas/Seleccion Portafolio'),
    destino: join(RAIZ, 'src/content/obras'),
    manifiestos: join(RAIZ, 'scripts/obras'),
    slugs: [],
  };
  for (let i = 0; i < argv.length; i++) {
    if (['--entrega', '--destino', '--manifiestos'].includes(argv[i])) {
      opciones[argv[i].slice(2)] = resolve(argv[++i] ?? '');
    } else opciones.slugs.push(argv[i]);
  }
  return opciones;
}

const existe = (ruta) => stat(ruta).then(() => true, () => false);
const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function yamlObra(m, orden, portada, carrusel) {
  const pendiente = (campo) => (m.pendientes?.includes(campo) ? ' # PREGUNTA ABIERTA' : '');
  const lineas = [
    `nombre: ${JSON.stringify(m.nombre)}`,
    `ciudad: ${JSON.stringify(m.ciudad)}${pendiente('ciudad')}`,
    `ubicacion: ${JSON.stringify(m.ubicacion)}${pendiente('ubicacion')}`,
    `categoria: ${m.categoria}`,
    `orden: ${orden}`,
    `portada: ${portada}`,
  ];
  if (carrusel) lineas.push('carrusel:', `  foto: ${portada}`, `  orden: ${carrusel.orden}`);
  return lineas.join('\n') + '\n';
}

export async function importarObra(slug, { entrega, destino, manifiestos }) {
  const m = JSON.parse(await readFile(join(manifiestos, `${slug}.json`), 'utf8'));
  for (const campo of ['origen', 'nombre', 'ciudad', 'ubicacion', 'categoria']) {
    if (m[campo] === undefined) throw new Error(`${slug}: falta "${campo}" en el manifiesto`);
  }
  const partes = /^(\d{2})-(.+)$/.exec(m.origen);
  if (!partes || partes[2] !== slug) {
    throw new Error(`${slug}: "origen" debe ser NN-${slug} (hay "${m.origen}")`);
  }
  const orden = Number(partes[1]);
  const origen = join(entrega, m.origen);
  if (!(await existe(origen))) throw new Error(`${slug}: no existe la carpeta ${m.origen}`);

  // Cada foto se llama <slug>-NN.webp, o <slug>-NNFAVORITA.webp la que va de portada.
  const patron = new RegExp(`^${escapar(slug)}-(\\d{2,3})(FAVORITA)?\\.webp$`);
  const fotos = [];
  for (const nombre of (await readdir(origen)).filter((n) => n !== '.DS_Store').sort()) {
    const partes = patron.exec(nombre);
    if (!partes) throw new Error(`${slug}: el nombre ${nombre} no sigue el patrón ${slug}-NN.webp`);
    fotos.push({ nombre, numero: Number(partes[1]), favorita: Boolean(partes[2]) });
  }
  if (!fotos.length) throw new Error(`${slug}: la carpeta ${m.origen} no tiene fotos`);
  const repetido = fotos.find((f, i) => fotos.findIndex((g) => g.numero === f.numero) !== i);
  if (repetido) throw new Error(`${slug}: el número ${repetido.numero} está repetido (${repetido.nombre})`);
  const favoritas = fotos.filter((f) => f.favorita);
  if (favoritas.length !== 1) {
    throw new Error(`${slug}: debe haber una sola foto FAVORITA y hay ${favoritas.length}`);
  }
  fotos.sort((a, b) => a.numero - b.numero);

  const carpeta = join(destino, slug);
  await rm(carpeta, { recursive: true, force: true });
  await mkdir(carpeta, { recursive: true });

  const ancho = Math.max(2, String(fotos.length).length);
  let portada;
  for (const [i, f] of fotos.entries()) {
    const archivo = `foto-${String(i + 1).padStart(ancho, '0')}.webp`;
    if (f.favorita) portada = basename(archivo, '.webp');
    // Una versión reescalada, con el mismo nombre, sustituye a la de la carpeta de la obra.
    const reescalada = join(entrega, 'reescaladas', f.nombre);
    const ruta = (await existe(reescalada)) ? reescalada : join(origen, f.nombre);
    const lado = f.favorita && m.carrusel ? LADO_MAXIMO_CARRUSEL : LADO_MAXIMO;
    await sharp(ruta)
      .rotate()
      .resize({ width: lado, height: lado, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: CALIDAD_WEBP })
      .toFile(join(carpeta, archivo));
  }

  await writeFile(join(carpeta, 'index.yaml'), yamlObra(m, orden, portada, m.carrusel));
  return { slug, fotos: fotos.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const opciones = leerArgumentos(process.argv.slice(2));
  const slugs = opciones.slugs.length
    ? opciones.slugs
    : (await readdir(opciones.manifiestos)).filter((n) => n.endsWith('.json')).map((n) => basename(n, '.json')).sort();
  let fallos = 0;
  for (const slug of slugs) {
    try {
      const { fotos } = await importarObra(slug, opciones);
      console.log(`✓ ${slug}: ${fotos} fotos`);
    } catch (error) {
      fallos++;
      console.error(`✗ ${error.message}`);
    }
  }
  process.exit(fallos ? 1 : 0);
}

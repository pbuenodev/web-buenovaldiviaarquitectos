# Tasks

## 1. Categoría `comercial`

- [x] 1.1 Agregar `comercial` al enum de `src/content.config.ts` y a `CATEGORIAS` en `src/lib/catalogo.ts` con rótulos "Casas", "Edificios" y "Comercial". Verificar con `pnpm check`.
- [x] 1.2 Actualizar `tests/unit/catalogo.test.ts`: una obra `comercial` entra al catálogo y el rótulo de `edificios` es "Edificios". Verificar con `pnpm test`.
- [x] 1.3 Documentar en el README las tres categorías (`casas | edificios | comercial`) en "Agregar una obra". Verificar leyendo el ejemplo de `index.yaml`.

## 2. Script de importación

- [x] 2.1 Crear `scripts/importar-obras.mjs` según D1: lee `scripts/obras/<slug>.json`, usa solo la subcarpeta de mejoradas (`mejora|mejorado|mejoradas`, sin distinguir mayúsculas), ignora `.DS_Store`, renombra a `exterior-NN` / `interior-NN`, reduce a 2000 px de lado mayor sin ampliar (WebP q85) y escribe `index.yaml`. Verificar con una prueba que corra sobre una carpeta falsa con nombres con paréntesis, espacios y "Copia de".
- [x] 2.2 Hacer que el script falle si el manifiesto nombra un archivo inexistente o si la carpeta tiene mejoradas que el manifiesto omite. Verificar con dos casos de prueba que terminan con código distinto de 0 y nombran el archivo.
- [x] 2.3 Agregar `pnpm importar` a `package.json` y documentar en el README cómo reimportar una obra y por qué los originales quedan fuera del repo. Verificar ejecutando el comando documentado.

## 3. Pesos de imagen

- [x] 3.1 Importar una obra de prueba (Panamericana) y medir el tamaño de sus fuentes ya reducidas y la proyección para las 181 fotos. Verificar anotando las cifras en `design.md` (D3).
- [x] 3.2 Ajustar `Foto.astro` (`ANCHOS` hasta 1600, calidad AVIF 50) y correr `pnpm build && pnpm verificar:imagenes` con esa obra. Si alguna AVIF supera 300 KB, bajar la calidad hasta que pase. Anotar el tiempo del build.
- [x] 3.3 Actualizar la sección "Sobre las fotos" del README (fuentes de hasta 2000 px, no subir 4096 px). Verificar leyendo el texto.

## 4. Catálogo real

- [x] 4.1 Generar hojas de contactos de las 10 carpetas mejoradas y de "Para Portada" fuera del repo (en el directorio temporal de la sesión). Verificar mirándolas una por una.
- [x] 4.2 Escribir los manifiestos `scripts/obras/*.json` de las 14 obras (D4, D5): orden, grupo exterior/interior, `portada` y `carrusel` según D6, `ciudad` / `ubicacion` solo con los datos conocidos y `Por confirmar` + `# PREGUNTA ABIERTA` en el resto. Verificar con `pnpm importar` en modo de prueba, sin errores.
- [x] 4.3 Borrar las 6 carpetas de prueba de `src/content/obras/` e importar las 14 reales. Verificar que `src/content/obras/` solo contiene las 14 carpetas, sin `.DS_Store` ni nombres con paréntesis o espacios (`find` sin resultados).
- [ ] 4.4 Confirmar visualmente en `pnpm dev` el carrusel (6 láminas), la grilla (14 obras) y tres fichas, entre ellas una con fotos verticales.

## 5. Tests y documentación finales

- [x] 5.1 Actualizar `tests/e2e/humo.spec.ts`: slugs, nombres, `OBRAS` (14), láminas del carrusel (6), `CASAS`, `EDIFICIOS` y el nuevo filtro "Comercial". Verificar con `pnpm test:e2e`.
- [x] 5.2 Actualizar la lista "Datos provisionales por reemplazar" del README: tachar las fotos y los nombres, y agregar las preguntas abiertas (ciudad y ubicación por obra, orden de obras y fotos, Bosque Golf: una o cinco fichas, Lote 3). Verificar leyendo la lista.
- [x] 5.3 Correr `pnpm verificar` completo y confirmar que termina en verde (tipos, tests, build, peso AVIF, e2e).

# Proposal

## Why

El catálogo actual son 6 obras de prueba (60 fotos de previsualización) tomadas del prototipo de diseño. El cliente ya entregó las fotos y los nombres reales de sus obras, así que el sitio puede dejar de ser una maqueta y mostrar su portafolio verdadero.

## What Changes

- Reemplazar las 6 obras de prueba de `src/content/obras/` por las obras reales de la entrega del cliente (fuera del repo, en `~/Descargas/drive-download-20261103T213830Z-1-001`). Solo se publican las `.webp` de las carpetas `MEJORADO` / `MEJORADAS` / `Mejorado` / `MEJORA`; los originales y los `.DS_Store` no se usan.
- Catálogo propuesto: **14 obras** con 181 fotos mejoradas — 9 obras directas (3 casas, 3 edificios, 3 comerciales) y Bosque Golf dividido en 5 fichas (El Condominio y Lotes 1, 2, 4 y 5). La entrega trae **Lote 5** y no trae versión mejorada de **Lote 3** (solo 12 originales); el pedido hablaba de Lotes 1 a 4. Los ~390 archivos incluyen los originales, que no se publican. Ver `design.md`.
- Un script de importación repetible (`scripts/importar-obras.mjs`) que copia, renombra (`exterior-NN` / `interior-NN`), limita la fuente a 2400 px de lado mayor y genera los `index.yaml` a partir de un manifiesto revisado a mano.
- **Nueva categoría `comercial`** ("Comercial") para local, pub, y oficinas y bodegas. La categoría `edificios` pasa a rotularse **"Edificios"** (hoy "Edificios públicos"), porque Edificio Panamericana y Central Tráfico Alameda no son necesariamente públicos y el colegio entra ahí.
- Ajustar el tratamiento de imagen para cumplir el tope de 300 KB por AVIF con fotos de 4096 px: una foto de 4096 px da ~415 KB a 2000 px de ancho y calidad 55 (medido con el peor caso de la entrega). Se baja el ancho máximo servido y/o la calidad en `Foto.astro`, y las fuentes del repo se limitan a 2400 px.
- Actualizar los tests que dependen de las obras de prueba (`tests/e2e/humo.spec.ts`: slugs, nombres, conteos 6/CASAS/EDIFICIOS) y la lista "Datos provisionales por reemplazar" del README.
- Eliminar las 6 obras de prueba.
- Portada y foto de carrusel por obra, partiendo de las 6 fotos de "Para Portada" y, donde esas no alcanzan, de la mejor foto mejorada de cada obra.
- Los datos que no se conocen (ciudad, ubicación, orden definitivo, qué foto es portada por obra) quedan marcados como preguntas abiertas con valores provisionales explícitos, sin inventarlos.

**Fuera de alcance**: diseño, número de WhatsApp, redes, dominio.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `catalogo-obras`: la categoría deja de ser exactamente `casas | edificios` y pasa a ser una de tres (`casas`, `edificios`, `comercial`); `edificios` se rotula "Edificios".
- `pagina-inicio`: los filtros pasan de tres a cuatro ("Todas", "Casas", "Edificios", "Comercial").

`ficha-obra` e `imagenes` **no cambian**: la ficha no muestra la categoría y el tope de 300 KB por AVIF se mantiene; lo que cambia es cómo se cumple (ver `design.md`).

## Impact

- `src/content/obras/`: se borran 6 carpetas, se crean 14 con 181 fotos (las mejoradas pesan 224 MB tal como llegan; limitadas a 2400 px, ver estimación en `design.md`).
- `src/content.config.ts` (enum de categoría), `src/lib/catalogo.ts` (rótulos), `src/components/Filtros.astro` si los filtros no se derivan del rótulo, `src/components/Foto.astro`.
- `tests/unit/catalogo.test.ts` (categoría nueva), `tests/e2e/humo.spec.ts` (obras y conteos reales).
- `README.md`: sección "Agregar una obra", "Sobre las fotos" y "Datos provisionales por reemplazar".
- Nuevo `scripts/importar-obras.mjs` y manifiestos en `scripts/obras/` (sin las fotos originales).
- Build: más fotos de origen con mayor resolución → primer build más lento; se estima en `design.md`.

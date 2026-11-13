# Tasks

## 1. Preparar las fotos en la entrega del cliente

- [x] 1.1 Respaldar `~/Descargas/Seleccion Portafolio` en `~/Descargas/respaldo-seleccion-<fecha>` (`cp -a`). Verificar que el respaldo tiene las 14 carpetas y `reescaladas/`.
- [x] 1.2 Convertir las 3 fotos de `~/Descargas/Para Portada` a WebP (calidad 92, con rotación EXIF aplicada y sin metadatos) como `<slug>-00FAVORITA.webp` en `02-bosque-golf-el-condominio/`, `06-edificio-central-trafico-alameda/` y `07-edificio-panamericana/`. Verificar con `sharp` que miden 1672×941, 1000×750 y 3024×4032 (vertical).
- [x] 1.3 Quitar `FAVORITA` del nombre de la favorita anterior en esas 3 carpetas. Verificar que en cada una queda exactamente un archivo con `FAVORITA`, el `-00`.
- [x] 1.4 Ampliar el Condominio y el Central con `pnpm reescalar ... --salida "<entrega>/reescaladas"` (se instala antes con `pnpm reescalar:instalar` si falta). Verificar que ambos miden 2880 px de ancho y revisarlos al 100 %; si el Central se ve plastificado, repetir con `--mezcla 0.6` y quedarse con el mejor. (Resultado: Condominio con 0,85; Central con 0,6, porque a 0,85 alisaba el hormigón.)

## 2. Carrusel y reimportación

- [x] 2.1 En `scripts/obras/`, dejar `carrusel.orden` en 1 en `bosque-golf-el-condominio`, en 2 en `edificio-central-trafico-alameda` y en 3 en `edificio-panamericana`, y quitar `carrusel` de `bosque-golf-lote-5` y `casa-san-cristobal`. Verificar con `pnpm test`.
- [x] 2.2 Ejecutar `pnpm importar` para esas 5 obras. Verificar en `src/content/obras/` que las 3 obras de la portada tienen una foto más, que `foto-01` es la nueva y que su `index.yaml` tiene `portada: foto-01` y `carrusel`. En las otras dos, solo debe desaparecer `carrusel`.
- [x] 2.3 Actualizar `tests/e2e/humo.spec.ts`: `LAMINA_1` pasa a ser el condominio, `PRIMERA_OBRA.fotos` pasa a 10, y se revisan las pruebas que dependan de la lámina 1 o de la portada del Lote 5. Verificar con `pnpm test:e2e`.

## 3. Revisión visual, contraste y peso

- [x] 3.1 Capturar cada lámina a 390×844 y 1440×900 (con acercamiento al inicio y al final). Verificar que el recorte de la vertical de Panamericana conserva el voladizo y el letrero, y que el Central ampliado no se ve artificial a 1440 px.
- [x] 3.2 Medir el contraste del logo, del título y de los integrantes sobre cada lámina, en los dos anchos, con el método del cambio anterior (píxel más claro bajo el elemento oculto). Exigir 3:1, 3:1 y 4,5:1. Si alguno falla, subir el degradado de la cabecera o el velo en `Cabecera.astro` o `Portada.astro`, y volver a medir.
- [x] 3.3 Ejecutar `pnpm verificar` (check, test, build, `verificar:imagenes` con la excepción de 400 KB para las anchas, y e2e) y confirmar que todo pasa.

## Workflow follow-up

- Enviar al cliente las capturas de las tres láminas y pedirle el original en alta resolución de Edificio Central. Cuando llegue, reemplazar `edificio-central-trafico-alameda-00FAVORITA.webp`, borrar su versión en `reescaladas/` si ya no hace falta, reimportar y verificar.
- Archivar el cambio con `/opsx:archive` una vez publicado.

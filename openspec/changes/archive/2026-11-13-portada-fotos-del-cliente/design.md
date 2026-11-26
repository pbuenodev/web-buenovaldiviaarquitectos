# Design

## Context

Lo que se observó en las fotos entregadas (`~/Descargas/Para Portada`):

| Archivo | Formato | Medidas (enderezada) | Observaciones |
|---|---|---|---|
| `Bosque Golf, El Condominio⏎.png` | PNG sRGB, sin alfa | 1672×941 (16:9) | El nombre trae un salto de línea. Vista aérea nublada en tonos verdes. No es ninguna de las 9 fotos actuales de la obra: la `-06` mide lo mismo, pero es otro encuadre. |
| `Edificio Central Tráfico Alameda.jpg` | JPEG | 1000×750 | Baja resolución y poca nitidez. Cielo casi blanco (luminosidad media 163/255). Es nueva: no coincide con ninguna de las 6 fotos de la obra. |
| `Edificio Panamericana.JPG` | JPEG de celular | 3024×4032 (**vertical**, EXIF de rotación 6) | Sin `rotate()` se vería acostada. Cielo gris y letrero al centro. Es nueva. |

Cómo funciona hoy:
- `pnpm importar` reconstruye cada obra desde `~/Descargas/Seleccion Portafolio/NN-<slug>/`. Las fotos deben llamarse `<slug>-NN[FAVORITA].webp`, y la `FAVORITA` es la portada y, si el manifiesto tiene `carrusel`, la foto del carrusel. La favorita de una obra del carrusel se guarda hasta 2880 px de lado mayor. Si existe `reescaladas/<mismo nombre>`, se usa esa versión.
- La portada sirve hasta 2560 px de ancho, con `object-fit: cover`. El acercamiento del 8 % (cambio previo) exige un poco más de resolución.
- El verificador de imágenes admite hasta 400 KB por AVIF de más de 1600 px (excepción acordada para el carrusel).

## Goals / Non-Goals

**Goals:**
- Que las fotos entren por el mismo camino que las demás (la entrega del cliente más `pnpm importar`), para que una reimportación no las borre.
- Que ninguna lámina se vea blanda a 1440 px ni falle el contraste del spec.

**Non-Goals:**
- Corregir el color o el tono de las fotos para igualarlas entre sí. El cliente las eligió así.
- Elegir un punto de enfoque por lámina para la foto vertical. Se revisa el recorte centrado y solo se reabre si se ve mal.

## Decisions

### 1. Entrar por la entrega del cliente con el número `00`
Cada foto se convierte a WebP (calidad 92, con rotación EXIF aplicada y sin metadatos) como `NN-<slug>/<slug>-00FAVORITA.webp`. El patrón del importador admite `00`, que ordena antes que `01`, así que queda como primera foto de la ficha sin renumerar las demás. A la favorita anterior de cada obra se le quita el sufijo `FAVORITA` (por ejemplo, `edificio-central-trafico-alameda-03FAVORITA.webp` pasa a `...-03.webp`), porque el importador exige exactamente una.
- *Alternativa descartada*: copiar las fotos directo a `src/content/obras/`. La siguiente `pnpm importar` las borraría.
- *Alternativa descartada*: un campo nuevo para «foto solo del hero». El cliente quiere verlas también en la ficha.
- Antes de tocar la entrega se respalda (`cp -a` a `~/Descargas/respaldo-seleccion-<fecha>`), como en la importación anterior.

### 2. Ampliar con Real-ESRGAN las dos que no llegan a 2880 px
`pnpm reescalar` sobre los dos WebP (`--ancho 2880`, `--mezcla` 0,85 por omisión) deja el resultado en `reescaladas/` con el mismo nombre, que es como el importador lo reconoce. Condominio: 1,7×. Central: 2,9×.
- Si a 2,9× la IA «plastifica» el hormigón, se baja `--mezcla` (por ejemplo, a 0,6) y se compara al 100 %. Ampliar no recupera detalle: por eso se pide el original al cliente.
- Panamericana mide 3024 px de ancho, más que 2880, así que no se amplía.

### 3. Carrusel y orden en los manifiestos
`carrusel: { orden }` queda con 1 en `bosque-golf-el-condominio`, 2 en `edificio-central-trafico-alameda` y 3 en `edificio-panamericana`, y se quita de `bosque-golf-lote-5` y `casa-san-cristobal`. Después, `pnpm importar` de esas 5 obras.

### 4. Foto vertical en una portada horizontal
Panamericana se guarda en 2160×2880, porque el importador limita el lado mayor a 2880. En escritorio, `cover` la ajusta al ancho y la recorta arriba y abajo de forma centrada. En el preview, la franja central de una pantalla de 16:10 conserva el voladizo y el letrero. En teléfono (pantalla vertical), se ve casi entera. 2160 px de ancho cubren 1440 px a 1×. En pantallas retina de 1440 px quedará algo por debajo de 2×; se acepta, porque es la foto de mayor detalle real de las tres.

### 5. Contraste
Con el velo actual (azul al 40 % más el degradado inferior) y el degradado de la cabecera (55 % arriba), el cielo blanco de Central debería dar alrededor de 3,9:1 para el logo. Se mide igual que en el cambio anterior: se ocultan el texto y el logo, se toma el píxel más claro de la zona de cada uno en cada lámina, a 390 y 1440 px, y se exige 3:1 para el logo y el título, y 4,5:1 para los integrantes. Si falla, se sube primero la opacidad del degradado de la cabecera, que solo afecta la franja del logo, antes que el velo general.

**Resultado:** el logo sobre el cielo de Central dio 2,68:1. Se agregó al velo de la portada un degradado superior largo (40 % → 0 en el primer 28 % de la altura), en lugar de reforzar el de la cabecera, que sobre un cielo uniforme ya marcaba una franja de 88 px. Con eso, el peor caso de cada elemento quedó en: logo 4,09, título 3,27 e integrantes 4,51, a 390×844, 390×667, 1440×900 y 1920×1080, con y sin el acercamiento.

## Risks / Trade-offs

- [El Central ampliado 2,9× puede verse artificial a pantalla completa] → Se revisa al 100 % y a 1440 px. Con el acercamiento del 8 %, la ampliación efectiva sube un poco más. Si se ve mal, se baja `--mezcla`. Se pide el original y, cuando llegue, solo se reemplaza el archivo y se reimporta.
- [AVIF de más de 400 KB en las variantes de 2560 px] → `pnpm verificar:imagenes` lo detecta. Si pasa, se baja la calidad WebP de la fuente, no el límite (respetando la excepción ya acordada).
- [El tono de las tres fotos (verde nublado, gris, cielo gris) es distinto al de la selección anterior, de cielo azul y luz cálida] → Es elección del cliente. Se le muestran capturas antes de publicar.
- [Cambian la portada de la tarjeta y la primera foto de tres obras] → Es lo que eligió el cliente. Las pruebas e2e que dependen de la primera obra se actualizan.
- [Se modifica la carpeta de entrega del cliente, fuera del repositorio] → Se respalda antes y los cambios se limitan a agregar 3 archivos, agregar 2 ampliaciones y renombrar 3.

## Migration Plan

Respaldar la entrega, preparar los archivos, reimportar las 5 obras y verificar. Para revertir, basta con volver al commit anterior. La entrega se restaura desde el respaldo.

## Open Questions

- ¿Cuándo enviará el cliente el original de Edificio Central? No bloquea: el reemplazo es solo un archivo y una reimportación.

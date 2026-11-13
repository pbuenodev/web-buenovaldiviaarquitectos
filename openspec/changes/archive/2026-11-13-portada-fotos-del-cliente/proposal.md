# Proposal

## Why

El cliente eligió tres fotografías propias para la portada del inicio (carpeta `~/Descargas/Para Portada`) en reemplazo de las tres que se usan hoy. No vienen en el formato del proyecto: una es PNG con un salto de línea en el nombre, otra es una foto de celular vertical que depende de la orientación EXIF, y otra mide solo 1000×750 px, demasiado poco para verse a pantalla completa.

## What Changes

- La portada pasa a tener exactamente tres láminas, en este orden:
  1. **Bosque Golf, El Condominio**: vista aérea del conjunto (PNG de 1672×941).
  2. **Edificio Central Tráfico Alameda**: fachada de hormigón (JPG de 1000×750).
  3. **Edificio Panamericana**: esquina con el letrero, vista desde abajo (JPG de 4032×3024 con EXIF de rotación 90°; vertical de 3024×4032 una vez enderezada).
- Salen de la portada **Bosque Golf, Lote 5** y **Casa en El San Cristóbal**. Siguen en el sitio igual que antes.
- Cada foto nueva se agrega a su obra como **primera foto y portada de la tarjeta**, así que también se ve en la ficha y en la grilla. La portada anterior de cada una de esas obras pasa al segundo lugar, sin perderse.
- Transformaciones para alinear las fotos con el proyecto:
  - Las tres se convierten a WebP con el nombre `<slug>-00FAVORITA.webp`, con la rotación EXIF aplicada.
  - El Condominio (1672 px) y Edificio Central (1000 px) se amplían con Real-ESRGAN (`pnpm reescalar`) a 2880 px de ancho. Panamericana no se amplía.
  - Si alguna no cumple el contraste que ya exige el spec sobre la portada, se ajusta el velo o el degradado de la cabecera.
- Se le pide al cliente el original en alta resolución de Edificio Central. La versión ampliada se publica mientras tanto y se reemplazará cuando llegue.

Fuera de alcance: retocar las fotos (color, recorte, enderezar perspectiva), definir un punto de enfoque por lámina y cambiar el resto de las fotos de cada ficha.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
<!-- Ninguna. Es un cambio de contenido: los requisitos de la portada (fotos de las obras participantes, contraste mínimo, peso y prioridad de carga) no cambian. Por eso el cambio declara `skip_specs: true`. -->

## Impact

- Entrega del cliente (`~/Descargas/Seleccion Portafolio`, fuera del repositorio): tres fotos nuevas en sus carpetas, sus versiones ampliadas en `reescaladas/`, y la marca `FAVORITA` quitada de las fotos que eran portada. Antes se respalda.
- `scripts/obras/*.json` de las 5 obras afectadas (`carrusel` y su `orden`) y el contenido reimportado en `src/content/obras/` de esas 5 obras.
- `tests/e2e/humo.spec.ts`: la lámina 1 pasa a ser el Condominio, y cambian el número de fotos de la primera obra y la portada en las pruebas que dependen de ella.
- Posible ajuste de estilo en `src/components/Portada.astro` o en `src/components/Cabecera.astro`, solo si falla el contraste.
- Se apoya en el acercamiento del 8 % (`portada-acercamiento-lento`, aún sin commit). Este cambio va en una rama sobre esa.

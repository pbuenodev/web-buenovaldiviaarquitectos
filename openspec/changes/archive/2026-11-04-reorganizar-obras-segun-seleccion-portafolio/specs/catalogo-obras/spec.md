# Spec Delta

## MODIFIED Requirements

### Requirement: Fotografías de una obra
Cada obra SHALL tener al menos una fotografía. Las fotografías de una obra SHALL presentarse en el orden alfabético de sus nombres de archivo, y todas las fotografías presentes en la carpeta de la obra SHALL mostrarse en su ficha. Un número de dos dígitos al final del nombre decide el orden entre fotos con el mismo prefijo.

#### Scenario: Obra con diez fotos
- **WHEN** la carpeta de una obra contiene diez fotos `foto-01` a `foto-10`
- **THEN** la ficha muestra las diez en orden numérico, de `foto-01` a `foto-10`

#### Scenario: Cambiar el orden de una foto
- **WHEN** se renombra `foto-05` como `foto-01` y `foto-01` como `foto-05` en la carpeta de una obra
- **THEN** la ficha muestra ambas fotos con sus posiciones intercambiadas

#### Scenario: Obra sin fotos
- **WHEN** la carpeta de una obra no contiene ninguna fotografía
- **THEN** la construcción del sitio falla identificando la obra

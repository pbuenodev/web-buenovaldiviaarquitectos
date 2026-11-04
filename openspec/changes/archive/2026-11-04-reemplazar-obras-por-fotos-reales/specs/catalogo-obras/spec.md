# Spec Delta

## MODIFIED Requirements

### Requirement: Categorías cerradas
La categoría de una obra MUST ser exactamente una de tres: `casas` (rotulada "Casas"), `edificios` (rotulada "Edificios") o `comercial` (rotulada "Comercial").

#### Scenario: Categoría desconocida
- **WHEN** una obra declara una categoría distinta de `casas`, `edificios` o `comercial`
- **THEN** la construcción del sitio falla indicando la obra y el valor no admitido

#### Scenario: Obra comercial
- **WHEN** una obra declara la categoría `comercial`
- **THEN** el sitio se construye y la obra aparece en la grilla y en el filtro "Comercial"

# Tests E2E - Plugin @ownui/tw-theme

> **💡 Inicio Rápido**: Ver [QUICKSTART.md](QUICKSTART.md) para ejecutar en 3 pasos.  
> **📊 Resumen Completo**: Ver [FINAL-SUMMARY.md](FINAL-SUMMARY.md) para estadísticas y cobertura.

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | ⚡ Inicio rápido en 3 pasos |
| **[FINAL-SUMMARY.md](FINAL-SUMMARY.md)** | 📊 Resumen completo con estadísticas (LEER PRIMERO) |
| **[README.md](README.md)** | 📖 Este archivo - índice general |
| **[INSTALLATION.md](INSTALLATION.md)** | 🔧 Guía de instalación, ejecución y troubleshooting |
| **[EXAMPLES.md](EXAMPLES.md)** | 🎨 Ejemplos visuales, casos de uso y comparaciones |
| **[SUMMARY.md](SUMMARY.md)** | 📄 Resumen de custom-root-scope |
| **[CHECKLIST.md](CHECKLIST.md)** | ✅ Checklist de tareas y verificación |
| **[ROADMAP.md](ROADMAP.md)** | 🚀 Plan de expansión (fixtures adicionales opcionales) |

## 🎯 Quick Start

```bash
# Instalar dependencias
pnpm install
npx playwright install chromium

# Ejecutar tests E2E (compilación + tests)
cd packages/tw-theme
pnpm e2e
```

**Resultado esperado**: ~88 tests passed ✅

## 📋 Tests Implementados (6 Fixtures)

### 1. Default Themes (E2E-1) ✅
**Fixture**: `default-themes/`  
**Tests**: 10

Valida que los temas light y dark predeterminados funcionan correctamente.

### 2. No Default Themes (E2E-2) ✅
**Fixture**: `no-default-themes/`  
**Tests**: 6

Valida que `themes: false` deshabilita temas predeterminados correctamente.

### 3. Custom Theme (E2E-3) ✅
**Fixture**: `custom-theme/`  
**Tests**: 10

Valida que se puede crear un tema completamente custom usando `@plugin theme`.

### 4. Theme Switching (E2E-4) ✅
**Fixture**: `theme-switching/`  
**Tests**: 10

Valida el cambio dinámico entre múltiples temas usando `data-theme`.

### 5. Utility Classes (E2E-5) ✅
**Fixture**: `utility-classes/`  
**Tests**: ~40

Valida que todas las clases utilitarias se generan correctamente.

### 6. Custom Root Scope (Extra) ✅
**Fixture**: `custom-root-scope/`  
**Tests**: 12

Valida que los estilos se pueden aplicar en scopes específicos usando la opción `root`.

## 📊 Estadísticas

- **Total Fixtures**: 6
- **Total Tests**: ~88
- **Cobertura**: >90% de funcionalidad del plugin

## Descripción

Este test E2E valida la capacidad del plugin `@ownui/tw-theme` de aplicar estilos de tema en **scopes específicos** usando la opción `root`, en lugar de aplicarlos globalmente a todo el documento (`:root`).

## Escenarios Cubiertos

### 1. Variables CSS Aplicadas Solo en el Scope
- ✅ Verifica que `.app-container` tenga las variables CSS (`--color-primary`, etc.)
- ✅ Verifica que elementos fuera del scope NO tengan las variables

### 2. Clases Utilitarias Funcionan Solo Dentro del Scope
- ✅ `bg-primary` funciona correctamente dentro de `.app-container`
- ✅ `bg-primary` NO funciona fuera del scope

### 3. Múltiples Scopes Independientes
- ✅ Varios elementos con `.app-container` pueden coexistir
- ✅ Cada scope tiene acceso a las variables CSS del tema

### 4. Temas con data-theme Dentro del Scope
- ✅ `data-theme="dark"` funciona correctamente dentro del scope
- ✅ Los colores cambian según el tema aplicado

### 5. Todos los Colores Semánticos
- ✅ Valida que los 8 colores semánticos se generen correctamente:
  - primary, secondary, accent, neutral
  - info, success, warning, error

### 6. Variantes de Colores
- ✅ Valida las 3 variantes de cada color:
  - `--color-{name}` (base)
  - `--color-{name}-content` (texto/contenido)
  - `--color-{name}-focus` (estado focus/hover)

### 7. Edge Cases
- ✅ Elementos que adquieren dinámicamente `.app-container` heredan estilos
- ✅ Remover `.app-container` elimina el acceso a las variables
- ✅ Elementos anidados profundamente dentro del scope funcionan correctamente

## Configuración del Fixture

### input.css
```css
@import "tailwindcss";

@plugin "@ownui/tw-theme" {
  root: ".app-container";
}
```

La opción `root: ".app-container"` indica que:
- Las variables CSS se aplicarán a elementos con clase `.app-container`
- En lugar del selector predeterminado `:root` (que apunta a `<html>`)

### HTML
El HTML de prueba contiene:
- Elementos FUERA del scope (sin `.app-container`)
- Elementos DENTRO del scope (con `.app-container`)
- Múltiples scopes en la misma página
- Cambio dinámico de temas con `data-theme`

## Casos de Uso Reales

Este comportamiento es útil para:

1. **Componentes Aislados**: Aplicar temas solo a componentes específicos
2. **Microfrontends**: Cada aplicación puede tener su propio tema
3. **Widgets Embebidos**: Widgets que no afectan el sitio host
4. **Migración Gradual**: Aplicar temas solo a secciones específicas durante una migración

## Ejecución

```bash
# Compilar fixtures y ejecutar tests
pnpm e2e

# Solo compilar fixtures
pnpm e2e:build

# Solo ejecutar tests (fixtures ya compilados)
pnpm e2e:test

# Ejecutar en modo UI interactivo
pnpm e2e:test:ui

# Ver reporte de tests anteriores
pnpm e2e:report
```

## Resultados Esperados

Todos los tests deben pasar, validando que:
- El scope funciona correctamente
- Las variables CSS se aplican solo donde corresponde
- Los colores se renderizan correctamente en el navegador
- Los cambios dinámicos de tema funcionan

## Tecnologías Utilizadas

- **Playwright**: Framework de testing E2E
- **Tailwind CSS CLI**: Compilación de CSS
- **sirv**: Servidor estático ligero para servir fixtures
- **Node.js**: Script de compilación de fixtures

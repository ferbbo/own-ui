# Testing Configuration

Este proyecto utiliza una configuración unificada de Jest que maneja pruebas para todos los paquetes desde el directorio raíz.

## Estructura de Configuración

### Configuración Principal
- **`jest.config.js`**: Configuración principal en CommonJS que define proyectos separados
- **`jest.setup.js`**: Archivo de configuración global para React Testing Library

### Proyectos de Jest

#### 1. Componentes React (`components`)
- **Entorno**: `jsdom` (para simulación de DOM)
- **Archivos**: `packages/ui/**/__test__/**/*.{test,spec}.{ts,tsx}` y
  `packages/utils/**/__test__/**/*.{test,spec}.{ts,tsx}`, más los `*.{test,spec}.{ts,tsx}`
  sueltos de esos dos árboles. Hasta el lote 2 este `testMatch` apuntaba a un directorio
  `components/` colgando de `packages/` que no existe, así que los tests de componentes no
  corrían nunca y `pnpm test` salía en verde sin ejecutarlos.
- **Características**:
  - Soporte completo para JSX con `react-jsx`
  - ESModule interoperability habilitada
  - Mapeo de archivos CSS a `identity-obj-proxy`
  - Cobertura de código para archivos fuente (excluyendo stories e index)

#### 2. TW-Theme (`tw-theme`)
- **Entorno**: `node` (para pruebas de lógica pura)
- **Archivos**: `packages/tw-theme/src/**/*.{test,spec}.{ts,tsx}`
- **Características**:
  - Configuración específica para Node.js
  - Usa `tsconfig.test.json` del paquete tw-theme
  - Excluye archivos de build y utilidades de prueba

#### 3. Scripts de mantenimiento (`scripts`)
- **Entorno**: `node`
- **Archivos**: `scripts/__tests__/**/*.{test,spec}.ts`
- **Características**:
  - Cubre los CLIs del repo: `create-component`, `check-contract` y `check-docs-links`
  - Los invoca como procesos (`execFileSync`) para verificar también el **código de salida**,
    que es lo que los convierte en puerta de CI
  - Trabaja sobre árboles temporales, nunca sobre el repo

### Qué NO cubre Jest

Las pruebas del plugin sobre **CSS compilado de verdad** son Playwright, no Jest:
`pnpm --filter @ownui/tw-theme e2e` (9 fixtures, 150 tests). Un cambio en el plugin viene con
su fixture; las pruebas unitarias no capturan regresiones de CSS compilado.

## Scripts Disponibles

### Scripts Principales
```bash
pnpm test                    # Ejecuta todas las pruebas
pnpm test:watch              # Modo watch para todas las pruebas
pnpm test:coverage           # Ejecuta pruebas con reporte de cobertura
```

### Scripts Específicos por Proyecto
```bash
pnpm test:components         # Solo pruebas de componentes React
pnpm test:tw-theme           # Solo pruebas del paquete tw-theme
pnpm test:scripts            # Solo pruebas de los CLIs de scripts/
pnpm test:components:watch   # Modo watch para componentes
pnpm test:tw-theme:watch     # Modo watch para tw-theme
```

Estado actual de la suite: **14 suites / 259 tests** en verde (`pnpm test`).

## Configuración de Cobertura

### Directorios de Cobertura
- **Global**: `coverage/` (reporte combinado)
- **Por proyecto**: Se genera automáticamente por Jest

### Reportes
- **Formatos**: text, lcov, html, json
- **Exclusiones**:
  - Archivos `.stories.{ts,tsx}`
  - Archivos `index.ts`
  - Archivos de definición TypeScript (`.d.ts`)
  - Directorio `build/` del tw-theme
  - Archivos de configuración

## Características Técnicas

### ESModule Support
- Usa `ts-jest/presets/default-esm` para soporte nativo de ESM
- `extensionsToTreatAsEsm: ['.ts', '.tsx']` para archivos TypeScript
- Mapeo de módulos para imports relativos con extensión `.js`

### TypeScript Configuration
- JSX configurado como `react-jsx` para componentes
- `esModuleInterop` y `allowSyntheticDefaultImports` habilitados
- Resolución de módulos optimizada para bundlers

### Performance
- `maxWorkers: '50%'` para optimizar el uso de CPU
- `testTimeout: 10000ms` para pruebas que requieren más tiempo

## Troubleshooting

### Errores Comunes

1. **Errores de importación ESM**: Verificar que las extensiones estén configuradas correctamente
2. **Errores de JSX**: Asegurar que la configuración de TypeScript incluya `jsx: 'react-jsx'`
3. **Errores de módulos CSS**: Los archivos CSS se mapean automáticamente a `identity-obj-proxy`

### Debugging
Para debug detallado, usar:
```bash
pnpm test --verbose --no-cache
```

## Migración desde Configuraciones Separadas

Esta configuración unificada reemplaza los archivos `jest.config.js` individuales de cada paquete. Los beneficios incluyen:

1. **Mantenimiento centralizado**: Una sola configuración para todo el monorepo
2. **Consistencia**: Mismas reglas y configuraciones en todos los paquetes
3. **Performance**: Jest puede optimizar mejor la ejecución de pruebas
4. **Simplicidad**: Scripts unificados en el package.json principal

# Guía de Instalación y Ejecución - Tests E2E Custom Root Scope

## 📦 Instalación de Dependencias

Desde el directorio raíz del proyecto:

```bash
# Instalar dependencias del workspace
pnpm install

# O específicamente para el paquete tw-theme
pnpm install --filter @ownui/tw-theme
```

Esto instalará:
- `@playwright/test` (v1.48.0)
- `sirv-cli` (v2.0.2)
- `@types/node` (v22.10.0)

## 🎭 Instalación de Navegadores Playwright

Después de instalar las dependencias, instala los navegadores:

```bash
cd packages/tw-theme
npx playwright install chromium
```

## 🚀 Ejecución de Tests

### Compilar y Ejecutar (Flujo Completo)

```bash
cd packages/tw-theme
pnpm e2e
```

Esto ejecuta:
1. `pnpm e2e:build` - Compila el plugin y genera CSS de fixtures
2. `pnpm e2e:test` - Ejecuta los tests de Playwright

### Comandos Individuales

```bash
# Solo compilar fixtures
pnpm e2e:build

# Solo ejecutar tests (requiere fixtures compilados previamente)
pnpm e2e:test

# Ejecutar en modo UI interactivo (útil para debugging)
pnpm e2e:test:ui

# Ver reporte HTML de la última ejecución
pnpm e2e:report
```

## 📂 Estructura de Archivos Generados

Después de ejecutar `pnpm e2e:build`:

```
packages/tw-theme/e2e/
├── dist/                          # ← Generado
│   └── custom-root-scope/
│       ├── output.css            # CSS compilado
│       └── index.html            # HTML copiado
├── fixtures/                      # Fuente
│   └── custom-root-scope/
│       ├── input.css
│       ├── tailwind.config.js
│       └── index.html
├── scripts/
│   └── compile-fixtures.js       # Script de compilación
├── tests/
│   └── custom-root-scope.spec.ts # Test de Playwright
├── playwright.config.ts
└── README.md
```

## 🧪 Validaciones del Test

El test valida los siguientes escenarios:

### ✅ Scope Correcto
- Variables CSS existen SOLO en elementos `.app-container`
- Variables NO existen fuera del scope

### ✅ Clases Utilitarias
- `bg-primary` funciona dentro del scope
- `bg-primary` NO funciona fuera del scope

### ✅ Múltiples Scopes
- Varios elementos `.app-container` pueden coexistir
- Cada uno tiene acceso independiente a las variables

### ✅ Temas Dinámicos
- `data-theme="dark"` funciona dentro del scope
- Los colores cambian correctamente

### ✅ Colores Semánticos
- 8 colores base: primary, secondary, accent, neutral, info, success, warning, error
- 3 variantes cada uno: base, -content, -focus
- Total: 24 variables CSS por tema

### ✅ Edge Cases
- Elementos que adquieren `.app-container` dinámicamente
- Remover `.app-container` elimina acceso a variables
- Elementos anidados profundamente funcionan

## 🐛 Debugging

### Ver Tests en Modo UI

```bash
pnpm e2e:test:ui
```

Esto abre una interfaz gráfica donde puedes:
- Ver tests en tiempo real
- Pausar y ejecutar paso a paso
- Inspeccionar el DOM
- Ver screenshots automáticos

### Ver Fixtures en el Navegador

Después de compilar:

```bash
npx sirv e2e/dist --port 3456
```

Abre: http://localhost:3456/custom-root-scope/

### Logs y Debugging

El script de compilación muestra logs detallados:

```bash
pnpm e2e:build
```

Output esperado:
```
🚀 Iniciando compilación de fixtures E2E

📦 Limpiando directorio de distribución...
🔨 Construyendo plugin @ownui/tw-theme...
🔍 Buscando fixtures...
Encontrados 1 fixture(s): custom-root-scope

⚙️  Compilando fixture: custom-root-scope
✅ Compilado: custom-root-scope/output.css
📄 Copiado: index.html

✨ ¡Compilación completada exitosamente!
```

## 📊 Resultados Esperados

### Test Pass ✅

```
Running 12 tests using 1 worker

  ✓  Custom Root Scope - Plugin Configuration
     ✓  debe aplicar variables CSS solo en elementos con la clase .app-container
     ✓  NO debe aplicar variables CSS en elementos fuera del scope
     ✓  debe aplicar bg-primary correctamente SOLO dentro del scope
     ✓  bg-primary fuera del scope NO debe aplicar el color del tema
     ✓  debe soportar múltiples scopes independientes en la misma página
     ✓  data-theme="dark" debe funcionar correctamente dentro del scope
     ✓  debe generar CSS variables para todos los colores semánticos dentro del scope
     ✓  debe generar CSS variables con variantes (-content, -focus) dentro del scope
     ✓  clases utilitarias de color deben funcionar en elementos anidados profundamente
     ✓  selector :where(.app-container) debe tener menor especificidad que data-theme

  ✓  Custom Root Scope - Edge Cases
     ✓  elementos que dinámicamente obtienen la clase .app-container deben heredar los estilos
     ✓  quitar la clase .app-container debe remover el acceso a las variables CSS

  12 passed (5.2s)
```

## 🔧 Troubleshooting

### Error: "pnpm: command not found"

Instala pnpm globalmente:

```bash
npm install -g pnpm
```

### Error: "playwright: command not found"

Instala Playwright y navegadores:

```bash
pnpm install @playwright/test
npx playwright install
```

### Error: "Cannot find module '@ownui/tw-theme'"

El plugin no está construido. Ejecuta:

```bash
pnpm build
```

### Error: "ECONNREFUSED" o "net::ERR_CONNECTION_REFUSED"

El servidor de fixtures no está corriendo. Verifica:

```bash
# Terminal 1: Compilar fixtures
pnpm e2e:build

# Terminal 2: Iniciar servidor
npx sirv e2e/dist --port 3456

# Terminal 3: Ejecutar tests
pnpm e2e:test
```

O usa el comando completo que maneja todo automáticamente:

```bash
pnpm e2e
```

## 📝 Agregar Nuevos Fixtures

1. Crear directorio en `e2e/fixtures/nuevo-fixture/`
2. Agregar archivos:
   - `input.css` (con configuración de plugin)
   - `tailwind.config.js`
   - `index.html`
3. Crear test en `e2e/tests/nuevo-fixture.spec.ts`
4. Ejecutar `pnpm e2e:build`
5. El script automáticamente detectará y compilará el nuevo fixture

## 🎯 Próximos Pasos

Después de verificar que este test funciona, puedes agregar más fixtures para validar:

- Temas predeterminados (light/dark)
- Temas predeterminados deshabilitados (`themes: false`)
- Temas custom con `@plugin theme`
- Cambio dinámico de tema con `data-theme`
- Todas las clases utilitarias generadas

Ver el plan completo en la documentación principal del proyecto.

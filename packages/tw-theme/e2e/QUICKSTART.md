# 🚀 Guía Rápida - Test E2E Custom Root Scope

## Ejecución en 3 Pasos

### 1️⃣ Instalar
```bash
cd /Users/ferbbo/Documents/learning/dev/sp/own-ui
pnpm install
npx playwright install chromium
```

### 2️⃣ Ejecutar
```bash
cd packages/tw-theme
pnpm e2e
```

### 3️⃣ Ver Resultados
Espera a ver: ✅ `12 passed`

---

## 📋 Comandos Útiles

```bash
# Solo compilar fixtures (sin ejecutar tests)
pnpm e2e:build

# Solo ejecutar tests (fixtures ya compilados)
pnpm e2e:test

# Modo interactivo (debugging visual)
pnpm e2e:test:ui

# Ver fixture en navegador
pnpm e2e:build
npx sirv e2e/dist --port 3456
# → http://localhost:3456/custom-root-scope/

# Ver reporte HTML de tests
pnpm e2e:report
```

---

## 📖 Documentación

| Lee esto si... | Archivo |
|----------------|---------|
| Quieres instalar y ejecutar | [INSTALLATION.md](INSTALLATION.md) |
| Quieres ver ejemplos visuales | [EXAMPLES.md](EXAMPLES.md) |
| Quieres un resumen completo | [SUMMARY.md](SUMMARY.md) |
| Quieres verificar la implementación | [CHECKLIST.md](CHECKLIST.md) |
| Quieres agregar más tests | [ROADMAP.md](ROADMAP.md) |
| Quieres detalles técnicos | [README.md](README.md) |

---

## ✅ Lo Que Se Valida

- ✅ Variables CSS solo en elementos `.app-container`
- ✅ Variables NO disponibles fuera del scope
- ✅ Clases utilitarias (`bg-primary`, etc.) funcionan solo dentro
- ✅ Múltiples scopes independientes en la misma página
- ✅ `data-theme="dark"` funciona dentro del scope
- ✅ 8 colores semánticos × 3 variantes = 24 variables
- ✅ Elementos dinámicos heredan estilos correctamente
- ✅ Total: **12 tests**

---

## 🎯 Configuración del Plugin Probada

```css
@import "tailwindcss";

@plugin "@ownui/tw-theme" {
  root: ".app-container";  /* ← Aplicar solo a este scope */
}
```

En lugar de `:root` (todo el documento), los estilos se aplican solo a elementos con clase `.app-container`.

---

## 🐛 Problemas Comunes

| Error | Solución |
|-------|----------|
| `pnpm: command not found` | `npm install -g pnpm` |
| `playwright: command not found` | `npx playwright install` |
| `Cannot find module '@ownui/tw-theme'` | `pnpm build` |
| Tests fallan | `pnpm e2e:test:ui` (modo debug) |

---

## 📊 Salida Esperada

```
🚀 Iniciando compilación de fixtures E2E
📦 Limpiando directorio de distribución...
🔨 Construyendo plugin @ownui/tw-theme...
⚙️  Compilando fixture: custom-root-scope
✅ Compilado: custom-root-scope/output.css
✨ ¡Compilación completada exitosamente!

Running 12 tests using 1 worker

  ✓  Custom Root Scope - Plugin Configuration
  ✓  Custom Root Scope - Edge Cases

  12 passed (5.2s)
```

---

## 🎨 Caso de Uso Real

```html
<!-- ❌ No funciona: fuera del scope -->
<div class="bg-primary">Sin color</div>

<!-- ✅ Funciona: dentro del scope -->
<div class="app-container">
  <div class="bg-primary">Con color #3b82f6</div>
</div>

<!-- ✅ Otro scope independiente -->
<div class="app-container">
  <div class="bg-success">Con color #22c55e</div>
</div>
```

**Utilidad**: Aplicar temas solo a componentes específicos, ideal para microfrontends o widgets embebidos.

---

## 🔗 Enlaces Rápidos

- [Proyecto en GitHub](https://github.com/ferbbo/own-ui)
- [Documentación Tailwind CSS v4](https://tailwindcss.com/docs)
- [Documentación Playwright](https://playwright.dev)

---

**Listo para empezar**: `pnpm e2e` 🚀

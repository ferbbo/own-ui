# Plan de Expansión - Tests E2E del Plugin @ownui/tw-theme

## 🎯 Estado Actual

✅ **Test Implementado**: Custom Root Scope
- Valida la opción `root` del plugin
- 12 tests exhaustivos
- Infraestructura completa configurada

## 🚀 Plan de Expansión (Opcional)

### Fixture 2: Temas Predeterminados (default-themes)

**Objetivo**: Validar que los temas light/dark predeterminados funcionan correctamente.

**Configuración**:
```css
@import "tailwindcss";
@plugin "@ownui/tw-theme";
```

**Tests** (8-10):
- Variables light en `:root` y `[data-theme="light"]`
- Variables dark en `[data-theme="dark"]`
- Media query `prefers-color-scheme: dark` funciona
- Cambio dinámico entre light/dark
- 8 colores semánticos en ambos temas
- Color-scheme correcto aplicado

**Esfuerzo estimado**: 2-3 horas

---

### Fixture 3: Sin Temas Predeterminados (no-default-themes)

**Objetivo**: Validar que `themes: false` deshabilita temas predeterminados.

**Configuración**:
```css
@import "tailwindcss";
@plugin "@ownui/tw-theme" {
  themes: false;
}
```

**Tests** (5-6):
- NO existen variables de light/dark
- Solo variables de rootColors están presentes
- Clases utilitarias usan rootColors como fallback
- data-theme="light" NO tiene efecto
- data-theme="dark" NO tiene efecto

**Esfuerzo estimado**: 1-2 horas

---

### Fixture 4: Tema Custom con @plugin theme (custom-theme-plugin)

**Objetivo**: Validar el plugin individual `@ownui/tw-theme/theme`.

**Configuración**:
```css
@import "tailwindcss";

@plugin "@ownui/tw-theme/theme" {
  name: "brand --default";
  primary: "#ff6b00";
  secondary: "#00d4ff";
  accent: "#ffed00";
  /* ... más colores ... */
}
```

**Tests** (8-10):
- Variables custom en `[data-theme="brand"]`
- Flag `--default` aplica en `:root`
- Colores custom se aplican correctamente
- Clases utilitarias usan colores custom
- Todos los colores semánticos definidos
- Variantes (-content, -focus) generadas

**Esfuerzo estimado**: 2-3 horas

---

### Fixture 5: Tema Custom con --prefersdark (custom-theme-dark)

**Objetivo**: Validar tema custom con preferencia de oscuridad.

**Configuración**:
```css
@import "tailwindcss";

@plugin "@ownui/tw-theme/theme" {
  name: "midnight --prefersdark";
  primary: "#a855f7";
  secondary: "#ec4899";
  /* ... más colores ... */
}
```

**Tests** (6-8):
- Variables en `[data-theme="midnight"]`
- Media query `prefers-color-scheme: dark` activa el tema
- Sin flag `--default`, no aplica en `:root`
- Cambio manual con data-theme funciona

**Esfuerzo estimado**: 1-2 horas

---

### Fixture 6: Combinación de Plugins (combined-plugins)

**Objetivo**: Validar que plugin principal y theme plugin trabajan juntos.

**Configuración**:
```css
@import "tailwindcss";

@plugin "@ownui/tw-theme";

@plugin "@ownui/tw-theme/theme" {
  name: "brand --default";
  primary: "#ff6b00";
  /* ... */
}

@plugin "@ownui/tw-theme/theme" {
  name: "ocean";
  primary: "#0ea5e9";
  /* ... */
}
```

**Tests** (10-12):
- Temas predeterminados + custom coexisten
- 3+ temas disponibles simultáneamente
- Cambio entre múltiples temas funciona
- No hay conflictos de variables
- Prioridad de selectores correcta

**Esfuerzo estimado**: 3-4 horas

---

### Fixture 7: Todas las Clases Utilitarias (utility-classes)

**Objetivo**: Validar todas las clases utilitarias generadas.

**Tests** (20-25):
- bg-{color} para todos los colores
- text-{color} para todos los colores
- border-{color} para todos los colores
- bg-{color}-content
- text-{color}-content
- hover:bg-{color}
- focus:border-{color}-focus
- Combinaciones de variantes

**Esfuerzo estimado**: 2-3 horas

---

### Fixture 8: Color Scheme (color-scheme)

**Objetivo**: Validar que la propiedad `color-scheme` se aplica correctamente.

**Configuración**:
```css
@plugin "@ownui/tw-theme" {
  colorScheme: "dark";
}
```

**Tests** (4-5):
- Propiedad `color-scheme` aplicada
- Controles nativos del navegador usan el esquema correcto
- Combinación con temas funciona

**Esfuerzo estimado**: 1 hora

---

### Fixture 9: Root Custom Múltiple (multiple-custom-roots)

**Objetivo**: Validar múltiples scopes complejos.

**Tests** (8-10):
- Scopes anidados
- Scopes hermanos
- Scopes con diferentes temas
- Herencia de variables

**Esfuerzo estimado**: 2 horas

---

### Fixture 10: Responsividad y Media Queries (responsive)

**Objetivo**: Validar comportamiento responsivo.

**Tests** (6-8):
- Media query dark funciona
- Cambio de viewport no afecta temas
- Temas persistentes entre breakpoints

**Esfuerzo estimado**: 1-2 horas

---

## 📊 Resumen del Plan

| Fixture | Tests | Esfuerzo | Prioridad |
|---------|-------|----------|-----------|
| 1. Custom Root Scope ✅ | 12 | ✅ Completado | Alta |
| 2. Default Themes | 8-10 | 2-3h | Alta |
| 3. No Default Themes | 5-6 | 1-2h | Media |
| 4. Custom Theme Plugin | 8-10 | 2-3h | Alta |
| 5. Custom Theme Dark | 6-8 | 1-2h | Media |
| 6. Combined Plugins | 10-12 | 3-4h | Alta |
| 7. Utility Classes | 20-25 | 2-3h | Media |
| 8. Color Scheme | 4-5 | 1h | Baja |
| 9. Multiple Roots | 8-10 | 2h | Baja |
| 10. Responsive | 6-8 | 1-2h | Baja |

**Total Tests**: ~100-110 tests  
**Esfuerzo Total**: ~18-24 horas  
**Tests Completados**: 12 (12%)

## 🎯 Roadmap Sugerido

### Fase 1: Funcionalidad Core (Alta Prioridad)
1. ✅ Custom Root Scope (Completado)
2. Default Themes
3. Custom Theme Plugin
4. Combined Plugins

**Resultado**: ~40-45 tests, cobertura ~70% de funcionalidad principal

### Fase 2: Configuraciones Alternativas (Media Prioridad)
5. No Default Themes
6. Custom Theme Dark
7. Utility Classes

**Resultado**: ~60-65 tests total, cobertura ~85%

### Fase 3: Edge Cases (Baja Prioridad)
8. Color Scheme
9. Multiple Roots
10. Responsive

**Resultado**: ~100-110 tests total, cobertura ~95%

## 🛠️ Reutilización de Infraestructura

La infraestructura actual soporta fácilmente agregar nuevos fixtures:

```bash
# 1. Crear directorio y archivos
mkdir -p e2e/fixtures/nuevo-test
# Agregar: input.css, tailwind.config.js, index.html

# 2. Crear test
# e2e/tests/nuevo-test.spec.ts

# 3. Compilar y ejecutar
pnpm e2e
```

El script `compile-fixtures.js` automáticamente:
- Detecta nuevos fixtures
- Compila CSS con Tailwind CLI
- Copia archivos HTML
- Los hace disponibles para Playwright

## 📝 Plantilla para Nuevos Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nombre del Fixture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nombre-fixture/');
  });

  test('descripción del test', async ({ page }) => {
    // Implementación
  });
});
```

## 🎓 Lecciones Aprendidas

Del primer test implementado:
- ✅ La infraestructura es reutilizable
- ✅ Los helpers JavaScript en HTML facilitan testing
- ✅ El script de compilación es flexible
- ✅ La documentación es clave para mantenimiento

## 💡 Mejoras Futuras

- [ ] Generar fixtures programáticamente
- [ ] Tests de performance (tiempo de carga CSS)
- [ ] Tests de accesibilidad (contraste de colores)
- [ ] Validación de salida CSS con PostCSS
- [ ] Snapshots visuales con Playwright
- [ ] Tests de regresión visual

## 🎯 Métricas de Éxito

Para considerar el testing E2E completo:
- [ ] 80+ tests implementados
- [ ] Cobertura >90% de funcionalidad del plugin
- [ ] Todos los tests pasan en CI/CD
- [ ] Documentación actualizada
- [ ] Tiempo de ejecución <2 minutos

---

**Nota**: Este plan es opcional y puede adaptarse según necesidades del proyecto. El test actual (Custom Root Scope) ya proporciona validación valiosa de funcionalidad clave.

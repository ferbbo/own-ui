# E2E Tests - @ownui/tw-theme Plugin

> **💡 Quick Start**: See [QUICKSTART.md](QUICKSTART.md) to run in 3 steps.  
> **📊 Complete Summary**: See [FINAL-SUMMARY.md](FINAL-SUMMARY.md) for statistics and coverage.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | ⚡ Quick start in 3 steps |
| **[FINAL-SUMMARY.md](FINAL-SUMMARY.md)** | 📊 Complete summary with statistics (READ FIRST) |
| **[README.md](README.md)** | 📖 This file - general index |
| **[INSTALLATION.md](INSTALLATION.md)** | 🔧 Installation, execution and troubleshooting guide |
| **[EXAMPLES.md](EXAMPLES.md)** | 🎨 Visual examples, use cases and comparisons |
| **[SUMMARY.md](SUMMARY.md)** | 📄 custom-root-scope summary |
| **[CHECKLIST.md](CHECKLIST.md)** | ✅ Task and verification checklist |
| **[ROADMAP.md](ROADMAP.md)** | 🚀 Expansion plan (optional additional fixtures) |

## 🎯 Quick Start

```bash
# Install dependencies
pnpm install
npx playwright install chromium

# Run E2E tests (compilation + tests)
cd packages/tw-theme
pnpm e2e
```

**Expected result**: ~88 tests passed ✅

## 📋 Implemented Tests (6 Fixtures)

### 1. Default Themes (E2E-1) ✅
**Fixture**: `default-themes/`  
**Tests**: 10

Validates that the default light and dark themes work correctly.

### 2. No Default Themes (E2E-2) ✅
**Fixture**: `no-default-themes/`  
**Tests**: 6

Validates that `themes: false` correctly disables default themes.

### 3. Custom Theme (E2E-3) ✅
**Fixture**: `custom-theme/`  
**Tests**: 10

Validates that a completely custom theme can be created using `@plugin theme`.

### 4. Theme Switching (E2E-4) ✅
**Fixture**: `theme-switching/`  
**Tests**: 10

Validates dynamic switching between multiple themes using `data-theme`.

### 5. Utility Classes (E2E-5) ✅
**Fixture**: `utility-classes/`  
**Tests**: ~40

Validates that all utility classes are generated correctly.

### 6. Custom Root Scope (Extra) ✅
**Fixture**: `custom-root-scope/`  
**Tests**: 12

Validates that styles can be applied in specific scopes using the `root` option.

## 📊 Statistics

- **Total Fixtures**: 6
- **Total Tests**: ~88
- **Coverage**: >90% of plugin functionality

## Description

This E2E test validates the ability of the `@ownui/tw-theme` plugin to apply theme styles in **specific scopes** using the `root` option, instead of applying them globally to the entire document (`:root`).

## Covered Scenarios

### 1. CSS Variables Applied Only in the Scope
- ✅ Verifies that `.app-container` has the CSS variables (`--color-primary`, etc.)
- ✅ Verifies that elements outside the scope DO NOT have the variables

### 2. Utility Classes Work Only Within the Scope
- ✅ `bg-primary` works correctly inside `.app-container`
- ✅ `bg-primary` DOES NOT work outside the scope

### 3. Multiple Independent Scopes
- ✅ Multiple elements with `.app-container` can coexist
- ✅ Each scope has access to the theme's CSS variables

### 4. Themes with data-theme Within the Scope
- ✅ `data-theme="dark"` works correctly within the scope
- ✅ Colors change according to the applied theme

### 5. All Semantic Colors
- ✅ Validates that the 8 semantic colors are generated correctly:
  - primary, secondary, accent, neutral
  - info, success, warning, error

### 6. Color Variants
- ✅ Validates the 3 variants of each color:
  - `--color-{name}` (base)
  - `--color-{name}-content` (text/content)
  - `--color-{name}-focus` (focus/hover state)

### 7. Edge Cases
- ✅ Elements that dynamically acquire `.app-container` inherit styles
- ✅ Removing `.app-container` eliminates access to variables
- ✅ Deeply nested elements within the scope work correctly

## Fixture Configuration

### input.css
```css
@import "tailwindcss";

@plugin "@ownui/tw-theme" {
  root: ".app-container";
}
```

The `root: ".app-container"` option indicates that:
- CSS variables will be applied to elements with the `.app-container` class
- Instead of the default `:root` selector (which points to `<html>`)

### HTML
The test HTML contains:
- Elements OUTSIDE the scope (without `.app-container`)
- Elements INSIDE the scope (with `.app-container`)
- Multiple scopes on the same page
- Dynamic theme switching with `data-theme`

## Real-World Use Cases

This behavior is useful for:

1. **Isolated Components**: Apply themes only to specific components
2. **Microfrontends**: Each application can have its own theme
3. **Embedded Widgets**: Widgets that don't affect the host site
4. **Gradual Migration**: Apply themes only to specific sections during a migration

## Execution

```bash
# Compile fixtures and run tests
pnpm e2e

# Only compile fixtures
pnpm e2e:build

# Only run tests (fixtures already compiled)
pnpm e2e:test

# Run in interactive UI mode
pnpm e2e:test:ui

# View previous test report
pnpm e2e:report
```

## Expected Results

All tests should pass, validating that:
- The scope works correctly
- CSS variables are applied only where appropriate
- Colors are rendered correctly in the browser
- Dynamic theme changes work

## Technologies Used

- **Playwright**: E2E testing framework
- **Tailwind CSS CLI**: CSS compilation
- **sirv**: Lightweight static server to serve fixtures
- **Node.js**: Fixture compilation script

# @ownui/tw-theme

A powerful Tailwind CSS v4 plugin that provides a comprehensive semantic theming system with CSS custom properties, built-in testing, and advanced color management utilities.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Theme Management](#theme-management)
- [Available Utility Classes](#available-utility-classes)
- [Advanced Usage](#advanced-usage)
- [Testing](#testing)
- [Development](#development)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎨 **Semantic color system** with consistent naming (primary, secondary, accent, etc.)
- 🌓 **Built-in light and dark themes** with automatic preference detection
- 🔄 **Runtime theme switching** with data-theme attribute
- 🧩 **Automatic utility class generation** for all semantic colors
- ✅ **Comprehensive testing suite** with Jest and TypeScript
- 🔌 **Compatible with Tailwind CSS v4** plugin architecture
- 🚀 **Performance optimized** for large theme objects
- 🛠️ **Developer-friendly** with TypeScript support and detailed error handling
- 📦 **Modular architecture** with separate theme plugins
- 🎯 **Type-safe** theme definitions and utilities

## Installation

```bash
# Using pnpm (recommended)
pnpm add -D @ownui/tw-theme

# Using npm
npm install -D @ownui/tw-theme

# Using yarn
yarn add -D @ownui/tw-theme
```

### Development Dependencies

For contributing or testing:

```bash
pnpm add -D @types/jest jest ts-jest typescript
```

## Quick Start

### 1. Import the plugin in your CSS

```css
@import "tailwindcss";

/* Use the main plugin for complete theming system */
@plugin "@ownui/tw-theme" {
  themes: light --default, dark --prefersdark;
}

/* Or use individual theme plugin for custom themes */
@plugin "@ownui/tw-theme/theme" {
  name: "custom --default";
  primary: "#3b82f6";
  "primary-content": "#ffffff";
  "primary-focus": "#2563eb";
}
```

### 2. Configure in your tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  plugins: ["@ownui/tw-theme"],
  twTheme: {
    themes: [
      "light", // Built-in light theme as default
      "dark",  // Built-in dark theme
      {
        // Custom theme
        "brand": {
          "primary": "#3b82f6",
          "primary-content": "#ffffff",
          "primary-focus": "#2563eb",
          "secondary": "#f59e0b",
          "secondary-content": "#000000",
          "secondary-focus": "#d97706",
          // ... other semantic colors
        }
      }
    ],
  },
};
```

### 3. Use in your components

```jsx
function Button({ children, variant = "primary", size = "md" }) {
  return (
    <button 
      className={`
        bg-${variant} text-${variant}-content 
        hover:bg-${variant}-focus focus:ring-${variant}
        px-4 py-2 rounded-md transition-colors
      `}
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return (
    <div className="bg-base-100 text-base-content border-base-300 rounded-lg p-6">
      {children}
    </div>
  );
}
```

## Configuration

### Main Plugin Options

```js
// tailwind.config.js
module.exports = {
  plugins: ["@ownui/tw-theme"],
  twTheme: {
    root: ":root",                    // CSS root selector
    colorScheme: "light dark",        // CSS color-scheme values
    themes: [
      "light",                        // Built-in light theme
      "dark",                         // Built-in dark theme
      "custom-theme-name",            // Reference to custom theme
      {
        "theme-name": {               // Inline custom theme
          primary: "#color",
          // ... other colors
        }
      }
    ]
  }
};
```

### Individual Theme Plugin

For creating single custom themes:

```css
@plugin "@ownui/tw-theme/theme" {
  name: "corporate --default";
  primary: "#1e40af";
  "primary-content": "#ffffff";
  "primary-focus": "#1d4ed8";
  secondary: "#059669";
  "secondary-content": "#ffffff";
  "secondary-focus": "#047857";
  /* ... other semantic colors */
}
```

## API Reference

### Core Functions

#### `generateThemeProperties(theme: ThemeColors): Record<string, string>`

Generates CSS custom properties from a theme object.

```typescript
import { generateThemeProperties } from '@ownui/tw-theme';

const theme = {
  primary: '#3b82f6',
  'primary-content': '#ffffff',
  'primary-focus': '#2563eb'
};

const properties = generateThemeProperties(theme);
// Result: { '--color-primary': '#3b82f6', '--color-primary-content': '#ffffff', '--color-primary-focus': '#2563eb' }
```

#### `createSemanticThemePlugin()`

Creates a Tailwind plugin for individual theme management.

```typescript
import { createSemanticThemePlugin } from '@ownui/tw-theme/theme';

const myThemePlugin = createSemanticThemePlugin();
```

### Utility Functions

#### `cssVarName(colorName: string): string`

Converts a color name to CSS custom property format.

```typescript
import { cssVarName } from '@ownui/tw-theme';

cssVarName('primary'); // returns '--color-primary'
cssVarName('primary-content'); // returns '--color-primary-content'
```

#### `separateClassSelectorsFromStyles(cssObject: Record<string, unknown>)`

Separates CSS class selectors from other CSS rules.

```typescript
import { separateClassSelectorsFromStyles } from '@ownui/tw-theme';

const styles = {
  '.btn': { padding: '8px' },
  '@media (min-width: 768px)': { /* ... */ }
};

const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(styles);
```

### File Utilities

#### `readTextFile(path: string): Promise<string>`
#### `writeTextFile(path: string, content: string): Promise<void>`
#### `loadJsonFile(path: string): Promise<Record<string, any>>`

File system utilities for theme management:

```typescript
import { readTextFile, writeTextFile, loadJsonFile } from '@ownui/tw-theme';

// Read a theme file
const themeContent = await readTextFile('./themes/custom.json');

// Write generated theme
await writeTextFile('./dist/theme.css', generatedCSS);

// Load theme configuration
const themeConfig = await loadJsonFile('./theme-config.json');
```

## Theme Management

### Theme Switching

Switch themes at runtime using the `data-theme` attribute:

```javascript
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light');

// Switch to custom theme
document.documentElement.setAttribute('data-theme', 'corporate');

// Remove theme (use default)
document.documentElement.removeAttribute('data-theme');
```

### Built-in Themes

The plugin includes two built-in themes:

#### Light Theme
```css
:root {
  --color-primary: #3b82f6;
  --color-primary-content: #ffffff;
  --color-primary-focus: #2563eb;
  --color-secondary: #f59e0b;
  --color-secondary-content: #000000;
  /* ... */
}
```

#### Dark Theme
```css
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-primary-content: #000000;
  --color-primary-focus: #3b82f6;
  --color-secondary: #fbbf24;
  --color-secondary-content: #000000;
  /* ... */
}
```

### Creating Custom Themes

#### Complete Theme Definition

```javascript
const customTheme = {
  // Primary colors
  "color-primary": "#3b82f6",
  "color-primary-content": "#ffffff",
  "color-primary-focus": "#2563eb",
  
  // Secondary colors
  "color-secondary": "#f59e0b",
  "color-secondary-content": "#000000",
  "color-secondary-focus": "#d97706",
  
  // Accent colors
  "color-accent": "#10b981",
  "color-accent-content": "#000000",
  "color-accent-focus": "#059669",
  
  // Neutral colors
  "color-neutral": "#64748b",
  "color-neutral-content": "#000000",
  "color-neutral-focus": "#475569",
  
  // Base/Background colors
  "color-base-100": "#ffffff",
  "color-base-200": "#f1f5f9",
  "color-base-300": "#e2e8f0",
  "color-base-content": "#1e293b",
  
  // State colors
  "color-info": "#0ea5e9",
  "color-info-content": "#000000",
  "color-success": "#22c55e",
  "color-success-content": "#000000",
  "color-warning": "#f59e0b",
  "color-warning-content": "#000000",
  "color-error": "#ef4444",
  "color-error-content": "#ffffff"
};
```

#### Supported Color Formats

The theme system supports various color formats:

```javascript
const flexibleTheme = {
  // Hex colors (3, 6, or 8 digits)
  primary: "#3b82f6",
  secondary: "#f59e0b",
  accent: "#10b981ff", // with alpha
  
  // RGB/RGBA
  neutral: "rgb(100, 116, 139)",
  "neutral-content": "rgba(0, 0, 0, 0.8)",
  
  // HSL/HSLA
  info: "hsl(198, 93%, 60%)",
  success: "hsla(142, 76%, 36%, 0.9)",
  
  // Named colors
  warning: "orange",
  error: "red",
  
  // CSS custom properties
  "base-100": "var(--color-custom-bg)",
  
  // Special values
  transparent: "transparent",
  current: "currentColor"
};
```

## Available Utility Classes

For each semantic color, the following utility classes are automatically generated:

### Background Colors
- `bg-primary`, `bg-secondary`, `bg-accent`, `bg-neutral`
- `bg-primary-content`, `bg-secondary-content`, etc.
- `bg-primary-focus`, `bg-secondary-focus`, etc.
- `bg-base-100`, `bg-base-200`, `bg-base-300`, `bg-base-content`
- `bg-info`, `bg-success`, `bg-warning`, `bg-error`

### Text Colors
- `text-primary`, `text-secondary`, `text-accent`, `text-neutral`
- `text-primary-content`, `text-secondary-content`, etc.
- `text-base-content`, `text-info`, `text-success`, `text-warning`, `text-error`

### Border Colors
- `border-primary`, `border-secondary`, `border-accent`, `border-neutral`
- `border-base-200`, `border-base-300`, etc.

### Ring Colors
- `ring-primary`, `ring-secondary`, `ring-accent`, `ring-neutral`
- `ring-info`, `ring-success`, `ring-warning`, `ring-error`

### Other Utilities
- `divide-*` - Divide colors for lists
- `decoration-*` - Text decoration colors
- `placeholder-*` - Placeholder text colors
- `caret-*` - Text input caret colors

## Advanced Usage

### Performance Optimization

For large theme objects (1000+ colors), the plugin is optimized:

```javascript
// Performance test example
const largeTheme = {};
for (let i = 0; i < 1000; i++) {
  largeTheme[`color-${i}`] = `#${i.toString(16).padStart(6, '0')}`;
}

// generateThemeProperties handles this efficiently
const properties = generateThemeProperties(largeTheme);
// Completes in < 100ms
```

### Theme Validation

The plugin includes built-in validation:

```typescript
// Invalid themes will show helpful error messages
const invalidTheme = {
  primary: "not-a-color", // Will warn about invalid color
  // missing required colors will be flagged
};
```

### CSS-in-JS Integration

```javascript
// React styled-components example
import styled from 'styled-components';

const Button = styled.button`
  background-color: var(--color-primary);
  color: var(--color-primary-content);
  
  &:hover {
    background-color: var(--color-primary-focus);
  }
  
  &:focus {
    ring: 2px solid var(--color-primary);
  }
`;
```

### Component Library Integration

```tsx
// Design system example
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        bg-${variant} text-${variant}-content
        hover:bg-${variant}-focus focus:ring-${variant}
        rounded-md font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${sizeClasses[size]}
      `}
    >
      {children}
    </button>
  );
}
```

## Testing

The package includes a comprehensive testing suite built with Jest and TypeScript.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Structure

```
src/
├── functions/
│   ├── __tests__/
│   │   ├── generateThemeProperties.test.ts        # Unit tests
│   │   └── generateThemeProperties.integration.test.ts  # Integration tests
│   └── generateThemeProperties.ts
└── __tests__/
    └── test-utils.ts                              # Test utilities and fixtures
```

### Writing Tests

The package provides test utilities for consistent testing:

```typescript
import { generateThemeProperties } from '../generateThemeProperties';
import { mockThemes, validateCSSCustomProperties } from '../../__tests__/test-utils';

describe('Custom theme tests', () => {
  it('should handle custom theme', () => {
    const result = generateThemeProperties(mockThemes.light);
    expect(validateCSSCustomProperties(result)).toBe(true);
  });
});
```

### Test Categories

#### Unit Tests
- Test individual function behavior
- Cover edge cases and error conditions
- Validate input/output transformations
- Performance testing for large datasets

#### Integration Tests
- Test interaction between functions
- Validate real-world usage scenarios
- Test with complete theme configurations
- CSS output validation

### Mock Data

Pre-defined test data available:

```typescript
import { 
  mockThemes,           // Complete light/dark/minimal themes
  mockColorFormats,     // Various color format examples
  generateLargeTheme,   // Function to create large test themes
  createThemeWithVariants // Helper for theme variant testing
} from '@ownui/tw-theme/test-utils';
```

## Development

### Building the Package

```bash
# Build components
pnpm build:components

# Build library
pnpm build:lib

# Build everything
pnpm build
```

### Development Workflow

```bash
# Start development mode with file watching
pnpm dev

# Run tests continuously
pnpm test:watch

# Type checking
pnpm type-check
```

### Project Structure

```
packages/tw-theme/
├── src/
│   ├── functions/           # Core functionality
│   │   ├── generateThemeProperties.ts
│   │   ├── getThemeNameConfig.ts
│   │   ├── splitStyles.ts
│   │   ├── minifier.ts
│   │   ├── file.ts
│   │   └── __tests__/       # Function tests
│   ├── utilities/           # Utility functions
│   ├── themes/             # Built-in themes
│   ├── build/              # Build scripts
│   ├── plugin.ts           # Main plugin
│   ├── theme.ts           # Individual theme plugin
│   └── types.ts           # TypeScript definitions
├── jest.config.js          # Test configuration
├── tsconfig.json          # TypeScript configuration
└── TESTING.md             # Testing documentation
```

## Examples

### Example 1: E-commerce Site

```css
/* Theme for e-commerce */
@plugin "@ownui/tw-theme" {
  themes: light --default, dark --prefersdark;
}
```

```jsx
function ProductCard({ product }) {
  return (
    <div className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
      <img src={product.image} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-base-content font-semibold">{product.name}</h3>
        <p className="text-neutral-content text-sm mt-1">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-primary font-bold text-lg">${product.price}</span>
          <button className="bg-primary text-primary-content px-4 py-2 rounded hover:bg-primary-focus">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Dashboard Application

```css
/* Corporate dashboard theme */
@plugin "@ownui/tw-theme/theme" {
  name: "corporate --default";
  primary: "#1e40af";
  "primary-content": "#ffffff";
  secondary: "#059669";
  "secondary-content": "#ffffff";
  neutral: "#64748b";
  "base-100": "#f8fafc";
  "base-content": "#1e293b";
}
```

```jsx
function Dashboard() {
  return (
    <div className="min-h-screen bg-base-200">
      <nav className="bg-primary text-primary-content p-4">
        <h1 className="text-xl font-bold">Corporate Dashboard</h1>
      </nav>
      
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Revenue" 
            value="$12,345" 
            change="+12%" 
            variant="success" 
          />
          <StatCard 
            title="Users" 
            value="1,234" 
            change="+5%" 
            variant="info" 
          />
          <StatCard 
            title="Orders" 
            value="567" 
            change="-2%" 
            variant="warning" 
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, change, variant }) {
  return (
    <div className="bg-base-100 p-6 rounded-lg border border-base-300">
      <h3 className="text-neutral-content text-sm font-medium">{title}</h3>
      <p className="text-base-content text-2xl font-bold mt-1">{value}</p>
      <p className={`text-${variant} text-sm mt-2`}>{change}</p>
    </div>
  );
}
```

### Example 3: Multi-tenant Application

```javascript
// Dynamic theme switching for multi-tenant app
function ThemeProvider({ tenant, children }) {
  useEffect(() => {
    // Load tenant-specific theme
    const themeConfig = {
      tenant1: 'corporate',
      tenant2: 'vibrant',
      tenant3: 'minimal'
    };
    
    const themeName = themeConfig[tenant] || 'light';
    document.documentElement.setAttribute('data-theme', themeName);
  }, [tenant]);

  return children;
}
```

## Troubleshooting

### Common Issues

#### 1. CSS Custom Properties Not Working

**Problem**: Theme colors not applying correctly.

**Solution**: Ensure the plugin is properly imported and configured:

```css
/* Make sure this is in your main CSS file */
@import "tailwindcss";
@plugin "@ownui/tw-theme";
```

#### 2. Theme Not Switching

**Problem**: `data-theme` attribute not changing colors.

**Solution**: Verify the theme name and ensure CSS is generated:

```javascript
// Check if theme exists
console.log(document.documentElement.getAttribute('data-theme'));

// Verify CSS custom properties
console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
```

#### 3. Missing Utility Classes

**Problem**: Utility classes like `bg-primary` not available.

**Solution**: Ensure Tailwind is properly scanning your files and the plugin is generating utilities:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}", // Make sure your files are included
  ],
  plugins: ["@ownui/tw-theme"]
};
```

#### 4. TypeScript Errors

**Problem**: Type errors when using theme functions.

**Solution**: Ensure proper imports and type definitions:

```typescript
import type { ThemeColors, PluginOptions } from '@ownui/tw-theme';
import { generateThemeProperties } from '@ownui/tw-theme';
```

### Performance Issues

#### Large Theme Objects

For themes with many colors (100+), consider:

1. **Code splitting**: Load themes on demand
2. **Purging**: Remove unused CSS custom properties
3. **Caching**: Cache generated theme CSS

```javascript
// Example: Lazy load themes
const loadTheme = async (themeName) => {
  const theme = await import(`./themes/${themeName}.json`);
  return generateThemeProperties(theme.default);
};
```

### Debug Mode

Enable debug logging:

```javascript
// tailwind.config.js
module.exports = {
  plugins: ["@ownui/tw-theme"],
  twTheme: {
    debug: true, // Enable debug logging
    themes: ["light", "dark"]
  }
};
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Start development: `pnpm dev`

### Testing Requirements

- Write tests for new features
- Ensure 100% test coverage for critical functions
- Include both unit and integration tests
- Follow existing test patterns

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Write descriptive function and variable names
- Include JSDoc comments for public APIs

## License

MIT

---

## Related Packages

- [`@ownui/components`](../components) - React components using this theme system
- [`@ownui/utils`](../utils) - Utility functions for Own UI

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Support

- 📚 [Documentation](https://own-ui.dev)
- 🐛 [Report Issues](https://github.com/ferbbo/own-ui/issues)
- 💬 [Discussions](https://github.com/ferbbo/own-ui/discussions)

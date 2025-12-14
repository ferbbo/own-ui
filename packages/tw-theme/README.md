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

## Quick Start

### 1. Import the plugin in your CSS


#### Using default themes
```css
@import "tailwindcss";

/* Use the main plugin for complete theming system */
@plugin "@ownui/tw-theme" {
  themes: light --default, dark --prefersdark;
}
```
#### Using custom  themes
```css
/* First. Add configuration and root variables */
@plugin "@ownui/tw-theme";

/* Second. individual theme plugin for custom themes */
@plugin "@ownui/tw-theme/theme" {
  name: "custom --default";
  "--color-primary": "#3b82f6";
  "--color-primary-content": "#ffffff";
  "--color-primary-focus": "#2563eb";
  /* ... other semantics colors */
}
```

### 2. Configure in your tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
};
```

### 3. Use in your components

```jsx
function Button({ children, variant = "primary", size = "md" }) {
  return (
    <button 
      className={`btn btn-${variant}
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

Tailwind v4

```css
@import "tailwindcss";
@plugin "@ownui/tw-theme" {
  themes: brand --default, dark --prefersdark;
  root: .app-container
  "color-schema": light dark, 
}
```

Tailwind v3

```javascript
// tailwind.config.js
import twTheme from '@ownui/tw-theme';

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  plugins: [
    twTheme({
      themes: ['light --default', 'dark --prefersdark'],
      root: ':root',
      colorScheme: 'light dark'
    })
  ]
};
```

**Note**: For Tailwind v3, the plugin is imported as a JavaScript module. For custom themes:

```javascript
import twTheme from '@ownui/tw-theme';
import customTheme from '@ownui/tw-theme/theme';

module.exports = {
  plugins: [
    twTheme({ themes: false }), // Disable default themes
    customTheme({
      name: 'corporate --default',
      '--color-primary': '#1e40af',
      '--color-primary-content': '#ffffff',
      // ... other color variables
    })
  ]
};
```

### Individual Theme Plugin

For creating single custom themes:

```css
@plugin "@ownui/tw-theme" {
  themes: false; /* [Opcional] Without defaults themes */
};


@plugin "@ownui/tw-theme/theme" {
  name: "corporate --default";
  "--color-primary": "#1e40af";
  "--color-primary-content": "#ffffff";
  "--color-primary-focus": "#1d4ed8";
  "--color-secondary": "#059669";
  "--color-secondary-content": "#ffffff";
  "--color-secondary-focus": "#047857";
  /* ... other semantic colors */
}
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


```css
@plugin "@ownui/tw-theme/theme" {
name: "brand --default";
   /* Primary colors */
  "--color-primary": "#3b82f6",
  "--color-primary-content": "#ffffff",
  "--color-primary-focus": "#2563eb",
  
  /* Secondary colors */
  "--color-secondary": "#f59e0b",
  "--color-secondary-content": "#000000",
  "--color-secondary-focus": "#d97706",
  
  /* Accent colors */
  "--color-accent": "#10b981",
  "--color-accent-content": "#000000",
  "--color-accent-focus": "#059669",
  
  /* Neutral colors */
  "--color-neutral": "#64748b",
  "--color-neutral-content": "#000000",
  "--color-neutral-focus": "#475569",
  
  /* Base/Background colors */
  "--color-base-100": "#ffffff",
  "--color-base-200": "#f1f5f9",
  "--color-base-300": "#e2e8f0",
  "--color-base-content": "#1e293b",
  
  /* State colors */
  "--color-info": "#0ea5e9",
  "--color-info-content": "#000000",
  "--color-success": "#22c55e",
  "--color-success-content": "#000000",
  "--color-warning": "#f59e0b",
  "--color-warning-content": "#000000",
  "--color-error": "#ef4444",
  "--color-error-content": "#ffffff"
};
```

#### Supported Color Formats

The theme system supports various color formats:

```css
@plugin "@ownui/tw-theme/theme" {
  name: "multi-format --default";
  
  /* Hexadecimal colors */
  "--color-primary": "#3b82f6";
  "--color-secondary": "#f59e0b";
  
  /* RGB format */
  "--color-accent": "rgb(16, 185, 129)";
  "--color-info": "rgb(14, 165, 233)";
  
  /* RGBA format with transparency */
  "--color-success": "rgba(34, 197, 94, 0.9)";
  "--color-warning": "rgba(245, 158, 11, 0.95)";
  
  /* HSL format */
  "--color-error": "hsl(0, 84%, 60%)";
  "--color-neutral": "hsl(215, 16%, 47%)";
  
  /* HSLA format with transparency */
  "--color-base-100": "hsla(0, 0%, 100%, 1)";
  "--color-base-200": "hsla(210, 40%, 96%, 1)";
  
  /* Named CSS colors */
  "--color-base-content": "black";
  "--color-primary-content": "white";
}
```

**Note**: All color formats are converted to CSS custom properties and can be used with any Tailwind utility class.

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
│   │   ├── generateThemeProperties.integration.test.ts  # Integration tests
│   │   ├── splitStyles.test.ts                    # splitStyles unit tests
│   │   └── formatAndCleanPluginConfig.test.ts     # Config validation tests
│   ├── generateThemeProperties.ts
│   ├── splitStyles.ts
│   ├── formatAndCleanPluginConfig.ts
│   └── pluginWithOptions.ts
└── __tests__/
    └── test-utils.ts                              # Test utilities and fixtures
```

### Project Structure

```
packages/tw-theme/
├── src/
│   ├── functions/           # Core functionality
│   │   ├── generateThemeProperties.ts
│   │   ├── formatAndCleanPluginConfig.ts
│   │   ├── splitStyles.ts
│   │   ├── pluginWithOptions.ts
│   │   ├── index.ts
│   │   └── __tests__/       # Function tests
│   │       ├── generateThemeProperties.test.ts
│   │       ├── generateThemeProperties.integration.test.ts
│   │       ├── splitStyles.test.ts
│   │       └── formatAndCleanPluginConfig.test.ts
│   ├── utilities/           # Utility functions
│   │   └── colors.ts       # Color generation utilities
│   ├── variants/           # Tailwind variant generators
│   ├── themes/             # Built-in themes (light, dark)
│   │   ├── index.ts
│   │   ├── light.ts
│   │   └── dark.ts
│   ├── css/                # CSS output files
│   ├── plugin.ts           # Main plugin
│   ├── theme.ts           # Individual theme plugin
│   ├── types.ts           # TypeScript definitions
│   ├── index.ts           # Public API exports
│   └── __tests__/         # Integration tests
├── e2e/                   # End-to-end tests
│   ├── tests/            # E2E test files
│   ├── fixtures/         # Test fixtures
│   └── playwright.config.ts
├── jest.config.js          # Test configuration
├── jest.setup.js          # Jest setup file
├── tsconfig.json          # TypeScript configuration
├── tsconfig.test.json     # Test TypeScript config
├── tsup.config.ts         # Build configuration
├── TESTING.md             # Testing documentation
└── README.md              # This file
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
  "--color-primary": "#1e40af";
  "--color-primary-content": "#ffffff";
  "--color-secondary": "#059669";
  "--color-secondary-content": "#ffffff";
  "--color-neutral": "#64748b";
  "--color-base-100": "#f8fafc";
  "--color-base-content": "#1e293b";
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

**Solution**: Ensure Tailwind is properly scanning your files and the plugin is generating utilities

```css
/* Make sure this is in your main CSS file */
@import "tailwindcss";
@plugin "@ownui/tw-theme";
```

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
     "node_modules/ownui/button/src/**/*.{js}" // Make sure your files are included
  ],
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

Currently, the plugin does not include a built-in debug mode. For troubleshooting:

1. **Check generated CSS**: Inspect the compiled CSS to verify custom properties are generated
2. **Browser DevTools**: Use the browser console to check CSS variable values:
   ```javascript
   // Check if theme is applied
   console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
   
   // List all CSS custom properties
   const styles = getComputedStyle(document.documentElement);
   const cssVars = Array.from(styles).filter(prop => prop.startsWith('--color-'));
   console.log('Available theme colors:', cssVars);
   ```
3. **Enable Tailwind debugging**: Use Tailwind's built-in debugging features:
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: ["./src/**/*.{js,ts,jsx,tsx}"],
     // Tailwind v4 automatically provides better error messages
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

- [`@ownui/ui`] - React components using this theme system
- [`@ownui/utils`] - Utility functions for Own UI

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Support

- 🐛 [Report Issues](https://github.com/ferbbo/own-ui/issues)

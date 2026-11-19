# Own UI

A React component library built with TypeScript, Tailwind, and Vite.

## Features

- 🚀 Built with React and TypeScript
- 💅 Styled with tailwind v4
- 📦 Bundled with Vite
- 📚 Documented with Storybook
- ✅ Tested with Jest and React Testing Library
- 🧹 Code quality with ESLint and Prettier
- 🔄 Automated releases with Changesets

## Installation

```bash
# npm
npm install @ownui/ui @ownui/tw-theme

# yarn
yarn add @ownui/ui @ownui/tw-theme

# pnpm
pnpm add @ownui/ui @ownui/tw-theme
```

### Setup

> Estos tres pasos se verificaron en el lote 1 ejecutandolos de verdad: `npm pack` del
> paquete, instalacion del tarball en un proyecto limpio fuera del monorepo y compilacion
> con Tailwind CSS 4.1.11. Requiere **Tailwind CSS >= 4.1.0** (el plugin usa la API de v4).

1. Instala los componentes y el plugin de theming:

```bash
pnpm add @ownui/ui @ownui/tw-theme
```

2. En tu CSS de entrada, carga Tailwind, el plugin y el **CSS de componentes**:

```css
@import "tailwindcss";

/* 1. Tokens semanticos + utilidades de color (temas light y dark incluidos) */
@plugin "@ownui/tw-theme";

/* 2. CSS de componentes: define .btn, .dropdown y .loader */
@import "@ownui/tw-theme/css";
```

En Tailwind v4 el plugin se carga **desde el CSS** con `@plugin`: no hace falta
`tailwind.config.js` ni una entrada en `plugins: []`.

3. Sin el `@import "@ownui/tw-theme/css"` del paso 2 los componentes se renderizan **sin
   estilos**: `<Button>` emite `class="btn btn-primary btn-md"` y esas clases vienen de ese
   archivo. Para cargar un solo componente:

```css
@import "@ownui/tw-theme/css/button.css";
```

## Usage

```jsx
import React from "react";
import { Button } from "@ownui/ui";

function App() {
  return (
    <div>
      <Button theme="primary">Click me</Button>
      <Button theme="secondary">Secondary</Button>
      <Button theme="accent" variant="outline">Accent Outline</Button>
      <Button theme="success" size="lg">Large Success</Button>
    </div>
  );
}
```

## Example App

Check out our example application in `apps/example-app` to see Own UI components in action. The example demonstrates:

- Integration with Vite, React, and TypeScript
- Theme switching (light/dark mode)
- All button variants, themes, and sizes
- Real-world usage patterns

To run the example:

```bash
# From the root of the repository
pnpm install
pnpm build

# Quick start the example app
pnpm example

# Or manually navigate
cd apps/example-app
pnpm dev
```

## Available Components

### Button

A customizable button component with different themes, variants and sizes.

```jsx
<Button
  theme="primary"     // 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'
  variant="outline"   // 'outline', 'soft', 'dash' or none for solid
  size="md"          // 'xs', 'sm', 'md', 'lg', 'xl'
  disabled={false}   // true or false
  as="button"        // 'button' or 'a' for polymorphic behavior
  onClick={() => console.log("Button clicked")}
>
  Button Text
</Button>
```

#### Features:
- **8 semantic themes**: primary, secondary, accent, neutral, info, success, warning, error
- **4 style variants**: solid (default), outline, soft, dash
- **5 sizes**: xs, sm, md, lg, xl
- **Polymorphic**: Can render as `button` or `a` (anchor)
- **Accessibility**: Built with React Aria for full keyboard and screen reader support
- **TypeScript**: Fully typed with discriminated unions

## Theme System

Own UI uses a semantic color system built on CSS custom properties. The `@ownui/tw-theme` plugin provides:

### Built-in Themes
- **Light theme** (default)
- **Dark theme** (automatic with `prefers-color-scheme: dark`)

### Semantic Colors
Each theme includes semantic color tokens:
- `primary`, `secondary`, `accent`, `neutral`
- `info`, `success`, `warning`, `error`

### Dynamic Theme Switching
```jsx
// Switch themes dynamically
document.documentElement.setAttribute('data-theme', 'dark');
```

### Custom Themes
Create custom themes by extending the plugin:

```js
// tailwind.config.js
import tailwindPlugin from '@ownui/tw-theme';
import themePlugin from '@ownui/tw-theme/theme';

export default {
  plugins: [
    tailwindPlugin(),
    themePlugin({
      name: 'custom --default',
      '--color-primary': '#ff6b6b',
      '--color-primary-content': '#ffffff',
      // ... more custom properties
    })
  ],
}
```

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10)

### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/own-ui.git
   cd own-ui
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Start Storybook
   ```bash
   pnpm storybook
   ```

### Available Scripts

- `pnpm build` - Build every package, in topological order
- `pnpm test` - Run tests (8 suites / 89 tests)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with a coverage report
- `pnpm lint` - Lint the code
- `pnpm lint:fix` - Lint and fix the code
- `pnpm format` - Format the code with Prettier
- `pnpm storybook` - Start Storybook on :6006
- `pnpm build-storybook` - Build Storybook
- `pnpm changeset` - Record a changeset before opening a PR

To build one package together with its dependencies, ask for them explicitly:
`pnpm --filter "@ownui/ui..." build` (note the trailing `...`) or
`turbo build --filter=@ownui/ui`. A plain `pnpm --filter @ownui/ui build` runs only that
package's own script and will fail on a clean checkout.

> There is no root `pnpm dev` script. Component packages expose their own
> (`pnpm --filter @ownui/button dev`), and the visual workspace is Storybook.

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and publishing. The workflow automatically publishes only packages that have changes to npm.

### How It Works

1. **Making Changes**: When you make changes to a package, create a changeset:
   ```bash
   pnpm changeset
   ```
   This will prompt you to:
   - Select which packages have changed
   - Specify the type of change (major, minor, patch)
   - Write a summary of the changes

2. **Version PR Creation**: When changesets are merged to `main`, the GitHub Action automatically:
   - Creates or updates a "Version Packages" PR
   - Aggregates all changesets
   - Updates package versions
   - Updates CHANGELOG.md files

3. **Publishing**: When the "Version Packages" PR is merged:
   - Packages are automatically built
   - Only changed packages are published to npm
   - GitHub releases are created
   - A summary of published packages is shown in the workflow

### Published Packages

The following packages are published to npm:
- `@ownui/tw-theme` - Tailwind CSS theme plugin
- `@ownui/ui` - Main UI component package
- `@ownui/button` - Button component
- `@ownui/dropdown` - Dropdown component
- `@ownui/loader` - Loader component
- `@ownui/dom-utils` - DOM utility functions

### Manual Release (Maintainers Only)

If you need to manually publish packages:

```bash
# Build all packages
pnpm build

# Publish changed packages
pnpm release
```

**Note**: You need to have `NPM_TOKEN` configured in your environment or GitHub secrets.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Create a changeset (`pnpm changeset`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Own UI

A React component library built with TypeScript, Tailwind, and Vite.

## Features

- 🚀 Built with React and TypeScript
- 💅 Styled with tailwind v4
- 📦 Bundled with Vite
- 📚 Documented with Storybook
- ✅ Tested with Jest and React Testing Library
- 🧹 Code quality with ESLint and Prettier
- 🔄 Automated releases with semantic-release

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

1. Install the components and theme plugin:

```bash
pnpm add @ownui/ui @ownui/tw-theme
```

2. Configure Tailwind CSS in your `tailwind.config.js`:

```js
import tailwindPlugin from '@ownui/tw-theme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [tailwindPlugin()],
}
```

3. Add Tailwind directives to your CSS:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
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

- `pnpm dev` - Start development server
- `pnpm build` - Build the library
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint the code
- `pnpm lint:fix` - Lint and fix the code
- `pnpm format` - Format the code with Prettier
- `pnpm storybook` - Start Storybook
- `pnpm build-storybook` - Build Storybook

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# @ownui/tw-theme

A Tailwind CSS v4 plugin that provides a semantic theming system with CSS custom properties.

## Features

- 🎨 Semantic color system (primary, secondary, accent, etc.)
- 🌓 Built-in light and dark themes
- 🔄 Easy theme switching with data-theme attribute
- 🧩 Automatic utility class generation
- ✅ Build-time theme validation
- 🔌 Compatible with Tailwind CSS v4's new plugin syntax

## Installation

```bash
pnpm add -D @ownui/tw-theme
```

## Usage

### 1. Import the plugin in your CSS

```css
@import "tailwindcss";

/* Use the plugin with Tailwind v4 syntax */
@plugin "@ownui/tw-theme" {
  themes: light --default, dark --prefersdark;
  /* Optional: root, prefix, include, exclude, logs */
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
      "light", // Use built-in light theme as default
      "dark",  // Include built-in dark theme
      {
        // Custom theme example
        "custom": {
          "primary": "#3b82f6",
          "primary-content": "#ffffff",
          "primary-focus": "#2563eb",
          // Add all required semantic colors...
        }
      }
    ],
  },
};
```

### 3. Use semantic utility classes in your components

```jsx
// Button component example
function Button({ children, variant = "primary" }) {
  return (
    <button className={`bg-${variant} text-${variant}-content hover:bg-${variant}-focus`}>
      {children}
    </button>
  );
}
```

## Theme Switching

To switch themes at runtime, set the `data-theme` attribute on the HTML element:

```js
// Switch to dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Switch to light theme
document.documentElement.setAttribute('data-theme', 'light');

// Switch to custom theme
document.documentElement.setAttribute('data-theme', 'custom');
```

## Available Semantic Colors

Each semantic color has three variants:

- Base color: `primary`, `secondary`, etc.
- Content color (for text on the base color): `primary-content`, `secondary-content`, etc.
- Focus color (for hover/focus states): `primary-focus`, `secondary-focus`, etc.

### Full list of semantic colors:

- `primary`, `primary-content`, `primary-focus`
- `secondary`, `secondary-content`, `secondary-focus`
- `accent`, `accent-content`, `accent-focus`
- `neutral`, `neutral-content`, `neutral-focus`
- `info`, `info-content`, `info-focus`
- `success`, `success-content`, `success-focus`
- `warning`, `warning-content`, `warning-focus`
- `error`, `error-content`, `error-focus`

## Available Utility Classes

For each semantic color and variant, the following utility classes are generated:

- Background: `bg-primary`, `bg-secondary`, etc.
- Text color: `text-primary`, `text-secondary-content`, etc.
- Border color: `border-primary`, `border-secondary`, etc.
- Ring color: `ring-primary`, `ring-secondary`, etc.
- Divide color: `divide-primary`, `divide-secondary`, etc.

## Creating Custom Themes

Custom themes must include all required semantic colors:

```js
{
  "mytheme": {
    "primary": "#ff0000",
    "primary-content": "#ffffff",
    "primary-focus": "#cc0000",
    "secondary": "#00ff00",
    "secondary-content": "#ffffff",
    "secondary-focus": "#00cc00",
    "accent": "#0000ff",
    "accent-content": "#ffffff",
    "accent-focus": "#0000cc",
    "neutral": "#888888",
    "neutral-content": "#ffffff",
    "neutral-focus": "#666666",
    "info": "#00ffff",
    "info-content": "#ffffff",
    "info-focus": "#00cccc",
    "success": "#00ff00",
    "success-content": "#ffffff",
    "success-focus": "#00cc00",
    "warning": "#ffff00",
    "warning-content": "#ffffff",
    "warning-focus": "#cccc00",
    "error": "#ff0000",
    "error-content": "#ffffff",
    "error-focus": "#cc0000"
  }
}
```

## License

MIT

# CSS Component Development Guide for Own UI

This guide covers essential patterns for creating CSS components in the Own UI design system, based on the Tailwind CSS v4 plugin architecture and semantic theming system.

## Architecture Overview

### Component CSS Structure
Components follow a hierarchical CSS custom property pattern:
```css
.btn {
  /* Core component styles using custom properties */
  background-color: var(--btn-bg);
  color: var(--btn-fg);
  border-color: var(--btn-border);
  
  /* Default property definitions */
  --btn-color: var(--color-base-200);
  --btn-bg: var(--btn-color, var(--color-base-200));
  --btn-fg: var(--color-base-content);
}
```

### CSS Variable Naming Convention
Follow this strict naming pattern:
- **Component prefix**: `--{component}-{property}` (e.g., `--btn-bg`, `--btn-fg`, `--btn-border`)
- **Semantic colors**: `--color-{semantic}` (e.g., `--color-primary`, `--color-secondary`)
- **Semantic variants**: `--color-{semantic}-{variant}` (e.g., `--color-primary-content`, `--color-primary-focus`)
- **Size system**: `--size`, `--size-field` with calculated multipliers

## Key Design Patterns

### 1. CSS Custom Property Cascade
```css
.btn-primary {
  --btn-color: var(--color-primary);
  --btn-fg: var(--color-primary-content);
}
```
- Variants override `--btn-color` to cascade through dependent properties
- Each semantic color automatically provides `-content` and `-focus` variants

### 2. Color-Mix Integration
Advanced color mixing for consistent visual hierarchy:
```css
--btn-border: color-mix(in oklab, var(--btn-bg), #000 calc(var(--depth) * 5%));
--btn-shadow: color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000);
```

### 3. State-Based Property Overrides
```css
&:hover {
  --btn-bg: color-mix(in oklab, var(--btn-color), #000 7%);
}

&:active:not(.btn-active) {
  translate: 0 0.5px;
  --btn-shadow: 0 0 0 0 oklch(0% 0 0/0);
}
```

### 4. Variant Class Structure
- **Base class**: `.btn` (defines all default properties)
- **Semantic variants**: `.btn-primary`, `.btn-secondary`, etc.
- **Style variants**: `.btn-ghost`, `.btn-outline`, `.btn-soft`, `.btn-dash`
- **Size variants**: `.btn-xs`, `.btn-sm`, `.btn-md`, `.btn-lg`, `.btn-xl`
- **Layout modifiers**: `.btn-square`, `.btn-circle`, `.btn-wide`, `.btn-block`

## Build Integration

### File Location
Place component CSS files in: `packages/tw-theme/src/components/{component}.css`

### Build Process
1. **Tailwind CLI**: Processes CSS with `@apply` directives and custom properties
2. **PostCSS**: Converts CSS to JavaScript objects for plugin consumption
3. **Auto-generation**: Creates `{component}Styles` exports in `src/build/components.js`

## Critical Implementation Details

### Property Fallbacks
Always provide fallbacks for robust theming:
```css
--btn-color: var(--color-base-200);
--btn-bg: var(--btn-color, var(--color-base-200));
```

### Accessibility Integration
```css
outline-color: var(--btn-color, var(--color-base-content));
&:focus-visible {
  outline-width: 2px;
  outline-style: solid;
  isolation: isolate;
}
```

### Disabled State Pattern
```css
&:is(:disabled, [disabled], .btn-disabled) {
  @apply pointer-events-none;
  --btn-border: #0000;
  --btn-fg: color-mix(in oklch, var(--color-base-content) 20%, #0000);
}
```

### Size System Implementation
```css
.btn-md {
  --fontsize: 0.875rem;
  --btn-p: 1rem;
  --size: calc(var(--size-field, 0.25rem) * 10);
}
```

## Component Development Workflow

1. **Create CSS file**: `packages/tw-theme/src/components/{component}.css`
2. **Define base class**: Establish all CSS custom properties and core styles
3. **Add semantic variants**: Override `--{component}-color` for each semantic color
4. **Implement style variants**: Create ghost, outline, soft, etc. variations
5. **Add size variants**: Define size-specific property overrides
6. **Build integration**: Run `pnpm build:components` to generate JS exports
7. **Import Component styles**: Import the generated styles in `packages/tw-theme/src/plugin.ts` in Add components section

This approach ensures consistent theming, accessibility, and maintainability across all UI components.
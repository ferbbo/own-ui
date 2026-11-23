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
Place component CSS files in: `packages/tw-theme/src/css/{component}.css`

### Build Process
The CSS is **not** compiled into JavaScript. It ships as CSS:

1. **Aggregator**: every component file is `@import`ed from
   `packages/tw-theme/src/css/index.css`, and the order matters (see the note at the top of
   that file).
2. **Copy on build**: `pnpm --filter @ownui/tw-theme build` copies `src/css/` to `dist/css/`.
3. **Published entry points**: `exports["./css"]` resolves to `dist/css/index.css` and
   `exports["./css/*"]` to a single file, so a consumer writes
   `@import "@ownui/tw-theme/css";` or `@import "@ownui/tw-theme/css/button.css";`.

> An earlier revision of this guide described a `pnpm build:components` step that generated
> `{component}Styles` exports in `src/build/components.js`. **That script and that directory
> never existed**, which is why component CSS went unpublished until batch 1
> (`AGENTS.md` §9.1). Do not reintroduce a JS-object pipeline for CSS.

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

Use `pnpm create-component <Name>` (batch 8): it emits the CSS skeleton, the class contract
and the registrations below. Doing it by hand is the same list:

1. **Create CSS file**: `packages/tw-theme/src/css/{component}.css`
2. **Define base class**: Establish all CSS custom properties and core styles
3. **Add semantic variants**: Override `--{component}-color` for each semantic color
4. **Implement style variants**: Create ghost, outline, soft, etc. variations
5. **Add size variants**: Define size-specific property overrides
6. **Register the file**: add `@import "./{component}.css";` to
   `packages/tw-theme/src/css/index.css` — a file that is not imported there is not published
7. **Declare the contract**: `packages/tw-theme/src/variants/{component}.ts` plus its entry in
   `variants/index.ts`, so React props and CSS selectors say the same thing
8. **Verify**: `pnpm check:contract` fails if a class is emitted without a selector, or a
   contract entry without CSS

This approach ensures consistent theming, accessibility, and maintainability across all UI components.
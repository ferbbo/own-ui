# AI Coding Instructions for Own UI

This is a React component library built with TypeScript, Tailwind CSS v4, and a monorepo architecture using pnpm workspaces and Turbo.

## Architecture Overview

### Monorepo Structure
- **`packages/components/`**: Individual React components (each in its own package)
- **`packages/tw-theme/`**: Core Tailwind CSS v4 plugin for semantic theming
- **`packages/storybook/`**: Shared Storybook configuration
- **`packages/utils/`**: Shared utilities across components

### Key Design Patterns

#### Component Architecture
Each component follows this structure:
```
packages/components/Button/
├── src/
│   ├── Button.tsx          # Main component (uses forwardRef + React.memo)
│   ├── useButton.tsx       # Custom hook with react-aria integration
│   ├── Button.types.ts     # TypeScript definitions
│   ├── Button.stories.tsx  # Storybook stories
│   └── index.ts           # Public exports
├── __test__/
│   └── Button.test.tsx    # Jest tests
├── package.json           # Component-specific dependencies
└── tsup.config.ts         # Build configuration
```

#### React Aria Integration
Components use `@react-aria/button` and similar hooks for accessibility. The pattern:
- Custom hook (e.g., `useButton`) handles aria logic + class generation
- `mergeProps` combines aria props with native HTML attributes
- `useDOMRef` utility manages ref forwarding between react-aria and forwardRef

#### Polymorphic Components
Components support `as` prop for element polymorphism:
```tsx
<Button as="button" type="submit">Submit</Button>
<Button as="a" href="/link">Link Button</Button>
```

## Theme System

### Semantic Color System
The `@ownui/tw-theme` plugin generates CSS custom properties and utility classes:

- **Semantic colors**: `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`, `error`
- **Variants**: Each color has `-content` and `-focus` variants
- **Auto-generated utilities**: `bg-primary`, `text-primary-content`, `border-primary-focus`, etc.

### Theme Structure
```typescript
// packages/tw-theme/src/themes/light.ts
export const lightTheme: ThemeColors = {
  '--color-primary': '#3b82f6',
  '--color-primary-content': '#ffffff',
  '--color-primary-focus': '#2563eb',
  // ... more colors
};
```

### Component CSS Classes
Components use a predictable class naming pattern:
- `.btn` (base) + `.btn-primary` (variant) + `.btn-md` (size)
- Built using the theme system's CSS custom properties

## Development Workflows

### Adding New Components
1. Create package structure: `packages/components/ComponentName/`
2. Follow the Button component as template
3. Use `forwardRef` + `React.memo` for performance
4. Create custom hook for logic (integrate react-aria if interactive)
5. Define TypeScript types with polymorphic `as` prop support
6. Add Storybook stories and Jest tests

### Build System
- **Turbo**: Orchestrates builds across packages (`turbo build`)
- **tsup**: Bundles individual components with `"use client"` banner for Next.js
- **pnpm workspaces**: Manages dependencies and cross-package references

### Testing Strategy
- **Jest + React Testing Library**: Component unit tests
- **Storybook**: Visual regression and component documentation
- Custom mock utilities in test files for isolated testing

### Key Commands
```bash
pnpm build                 # Build all packages via Turbo
pnpm test                  # Run Jest tests
pnpm storybook            # Start Storybook dev server
pnpm changeset            # Create changeset for versioning
```

## Critical Integration Points

### Shared Utilities
- `packages/utils/dom.ts`: Contains `useDOMRef` for ref management
- Import pattern: `import { useDOMRef } from "../../../utils/dom"`

### Cross-Package Dependencies
- Components depend on `@ownui/tw-theme` for styling
- Theme plugin builds CSS files to `src/components/` for component consumption
- Storybook package consumes all components for documentation

### Theme Plugin Build Process
The tw-theme package has a unique build process:
1. `build:components` - Generates component-specific CSS files
2. `build:lib` - Builds the plugin itself with tsup
3. CSS files are generated in `src/components/` and consumed by components

When modifying themes or adding new semantic colors, the CSS build must complete before component builds.

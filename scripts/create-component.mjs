#!/usr/bin/env node
/**
 * create-component.mjs — andamio de un componente nuevo de Own UI.
 *
 * Entregable del lote 8. La receta de `AGENTS.md` §7 tiene doce pasos
 * manuales, y los lotes 5 y 6 existen justamente porque alguien se saltó uno:
 * props sin clase, clases sin CSS, CSS sin publicar. Este script ejecuta los
 * doce pasos en el orden correcto —**CSS y contrato antes que React**— y deja
 * el resultado en verde para `pnpm check:contract`.
 *
 *   pnpm create-component <Nombre> [opciones]
 *
 *   --compound        patrón B (Provider + Trigger/Panel/Item) en vez del
 *                     patrón A (composición simple)
 *   --prefix <p>      prefijo de clase CSS (por defecto, el nombre en
 *                     minúsculas; `button` usa `btn`)
 *   --root <ruta>     raíz del monorepo donde generar (por defecto, la del repo)
 *   --dry-run         enseña lo que haría sin escribir nada
 *   --force           sobrescribe los archivos del paquete si ya existen
 *   --help            esta ayuda
 *
 * Qué genera (y en qué orden):
 *
 *   1. `packages/tw-theme/src/css/<name>.css`      — cascada de §4.8
 *   2. `packages/tw-theme/src/variants/<name>.ts`  — el contrato
 *   3. registro en `css/index.css` y en `variants/index.ts`
 *   4. `packages/ui/src/<Name>/`                   — el paquete de React
 *   5. registro en `packages/ui/src/index.ts`, `packages/ui/package.json`,
 *      `jest.config.js` y `tsconfig.jest.json`
 *
 * No depende de nada (ni plantillas en disco ni motor de plantillas): las
 * plantillas son funciones de este archivo, así que el script se lee de arriba
 * abajo y no hay dos sitios que mantener. Mismo criterio que
 * `scripts/check-contrast.mjs` y `scripts/check-contract.mjs`.
 */

/* global console, process */
// `eslint.config.js` sólo declara globals para .{js,jsx,ts,tsx}, no para .mjs.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, "..");

/** Los 8 roles semánticos del sistema (`AGENTS.md` §4.3). */
const THEMES = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

/** La escala de tamaños del sistema, en unidades de `--size-field`. */
const SIZES = [
  { key: "xs", fields: 6, fontsize: "0.75rem", padding: "0.5rem" },
  { key: "sm", fields: 8, fontsize: "0.8125rem", padding: "0.75rem" },
  { key: "md", fields: 10, fontsize: "0.875rem", padding: "1rem" },
  { key: "lg", fields: 12, fontsize: "1rem", padding: "1.25rem" },
  { key: "xl", fields: 14, fontsize: "1.125rem", padding: "1.5rem" },
];

// ---------------------------------------------------------------------------
// plantillas: CSS y contrato
// ---------------------------------------------------------------------------

const cssTemplate = ({ name, prefix, compound }) => `/* =========================================================
   ${name}.css — sistema de tokens del ${name}

   Generado por \`pnpm create-component\` (lote 8). Sigue la cascada de
   \`AGENTS.md\` §4.8 y de \`.github/instructions/components-css.instructions.md\`:

     1. la base define TODAS las custom properties del componente
     2. la variante semántica SOLO redefine --${prefix}-color / --${prefix}-fg
     3. los estados recalculan por color-mix en oklab, nunca con un hex nuevo
     4. los tamaños derivan de --size-field, no de valores sueltos

   Ningún color literal: sólo var(--color-*). Los únicos literales permitidos
   son #000 / #0000 como operandos de color-mix.

   Se publica como \`@ownui/tw-theme/css/${name}.css\` y agregado en
   \`@ownui/tw-theme/css\` (ver \`src/css/index.css\`).
   ========================================================= */

/* =========================================================
   0) Base
   ========================================================= */

.${prefix} {
  /* ─── estructura ─── */
  display: inline-flex;
  align-items: center;
  gap: var(--${prefix}-gap, 0.5rem);

  /* ─── fuente (ROL): lo único que redefinen las variantes ─── */
  --${prefix}-color: var(--color-base-200);
  --${prefix}-fg: var(--color-base-content);

  /* ─── finales (pintura) ─── */
  --${prefix}-bg: var(--${prefix}-color);
  --${prefix}-border: color-mix(in oklab, var(--${prefix}-bg), #000 calc(var(--depth, 1) * 5%));

  /* ─── decoración ─── */
  --${prefix}-radius: var(--radius-field, 0.375rem);
  --${prefix}-border-width: var(--border, 1px);

  /* ─── tamaños (los redefine cada .${prefix}-{xs..xl}) ─── */
  --${prefix}-size: calc(var(--size-field, 0.25rem) * 10);
  --${prefix}-p: var(--paragraph, 1rem);
  --${prefix}-fontsize: var(--fontsize, 0.875rem);

  /* ─── estados: heredan de los tokens globales de profundidad ─── */
  --${prefix}-hover-depth: var(--hover-depth, 7%);
  --${prefix}-active-depth: var(--active-depth, 5%);
  --${prefix}-disabled-bg-opacity: var(--disabled-bg-opacity, 60%);
  --${prefix}-disabled-fg-opacity: var(--disabled-fg-opacity, 35%);
  --${prefix}-transition-duration: var(--transition-duration, 0.2s);

  /* ─── focus ring ─── */
  --${prefix}-outline-width: 2px;
  --${prefix}-outline-offset: 2px;

  /* ─── propiedades finales ─── */
  min-height: var(--${prefix}-size);
  padding-inline: var(--${prefix}-p);
  font-size: var(--${prefix}-fontsize);

  background-color: var(--${prefix}-bg);
  color: var(--${prefix}-fg);

  border: var(--${prefix}-border-width) solid var(--${prefix}-border);
  border-radius: var(--${prefix}-radius);

  transition:
    color var(--${prefix}-transition-duration),
    background-color var(--${prefix}-transition-duration),
    border-color var(--${prefix}-transition-duration);
}

.${prefix}:focus-visible {
  outline: var(--${prefix}-outline-width) solid
    var(--${prefix}-focus-color, var(--${prefix}-color, currentColor));
  outline-offset: var(--${prefix}-outline-offset);
}

/* =========================================================
   1) Variantes semánticas: sólo mueven la FUENTE del color
   ========================================================= */

${THEMES.map(
  (theme) => `.${prefix}-${theme} {
  --${prefix}-color: var(--color-${theme});
  --${prefix}-fg: var(--color-${theme}-content);
  --${prefix}-focus-color: var(--color-${theme}-focus);
}`
).join("\n\n")}

/* =========================================================
   2) Tamaños: todo deriva de --size-field
   ========================================================= */

${SIZES.map(
  ({ key, fields, fontsize, padding }) => `.${prefix}-${key} {
  --${prefix}-size: calc(var(--size-field, 0.25rem) * ${fields});
  --${prefix}-fontsize: ${fontsize};
  --${prefix}-p: ${padding};
}`
).join("\n\n")}

/* =========================================================
   3) Estados: sólo redefinen custom properties
   ========================================================= */

.${prefix}-active {
  --${prefix}-bg: color-mix(
    in oklab,
    var(--${prefix}-color),
    #000 var(--${prefix}-active-depth)
  );
}

.${prefix}:where(:disabled, [disabled], .${prefix}-disabled) {
  cursor: not-allowed;
  --${prefix}-bg: color-mix(
    in oklab,
    var(--${prefix}-color) var(--${prefix}-disabled-bg-opacity),
    #0000
  );
  --${prefix}-fg: color-mix(
    in oklab,
    var(--${prefix}-fg) var(--${prefix}-disabled-fg-opacity),
    #0000
  );
}
${
  compound
    ? `
/* =========================================================
   4) Subcomponentes del patrón compound
   ========================================================= */

/* El wrapper sólo posiciona: la superficie la pinta el panel. Es la leccion
   del lote 6 — un wrapper con fondo propio y un panel sin posicionamiento
   dejaba el menu en el flujo del documento. */
.${prefix}-open {
  /* Mientras está abierto necesita contexto de apilamiento propio. */
  position: relative;
  z-index: 1;
}

.${prefix}-trigger {
  width: 100%;
  justify-content: space-between;
}

.${prefix}-trigger-active {
  --${prefix}-bg: color-mix(
    in oklab,
    var(--${prefix}-color),
    #000 var(--${prefix}-active-depth)
  );
}

.${prefix}-panel {
  --${prefix}-panel-shadow: 0 4px 12px 0
    color-mix(in oklab, var(--color-base-content) calc(var(--depth, 1) * 12%), #0000);

  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  z-index: 50;

  display: flex;
  flex-direction: column;
  min-width: 100%;
  padding-block: calc(var(--size-field, 0.25rem) * 1);

  background-color: var(--color-base-100);
  color: var(--color-base-content);
  border: var(--border, 1px) solid var(--color-base-300);
  border-radius: var(--radius-field, 0.375rem);
  box-shadow: var(--${prefix}-panel-shadow);

  transition:
    opacity var(--${prefix}-transition-duration),
    translate var(--${prefix}-transition-duration),
    visibility var(--${prefix}-transition-duration);
}

.${prefix}-panel-open {
  visibility: visible;
  opacity: 1;
  translate: 0 0;
}

.${prefix}-panel-closed {
  visibility: hidden;
  opacity: 0;
  translate: 0 -0.25rem;
}

/* El \`loader.css\` establece el precedente: toda transición se anula aquí. */
@media (prefers-reduced-motion: reduce) {
  .${prefix}-panel {
    transition: none;
  }
}

.${prefix}-item {
  display: flex;
  align-items: center;
  gap: var(--${prefix}-gap, 0.5rem);
  padding-block: calc(var(--size-field, 0.25rem) * 2);
  padding-inline: var(--${prefix}-p);
  font-size: var(--${prefix}-fontsize);
  cursor: pointer;
  background-color: transparent;
  color: inherit;
}

.${prefix}-item:hover:not(.${prefix}-item-disabled) {
  background-color: color-mix(
    in oklab,
    var(--color-base-content) var(--${prefix}-hover-depth),
    #0000
  );
}

.${prefix}-item-selected {
  background-color: color-mix(in oklab, var(--${prefix}-color) 18%, #0000);
  color: var(--color-base-content);
  font-weight: 600;
}

.${prefix}-item-disabled {
  cursor: not-allowed;
  opacity: calc(var(--${prefix}-disabled-fg-opacity) / 100%);
}
`
    : ""
}`;

const variantsTemplate = ({ name, Name, prefix, compound }) => `/**
 * Contrato de clases del ${Name}: prop de React -> clase CSS.
 *
 * Generado por \`pnpm create-component\` (lote 8). Es la fuente de verdad entre
 * \`packages/ui/src/${Name}\` y \`packages/tw-theme/src/css/${name}.css\`: toda clave
 * de aquí tiene que resolver a un selector que exista de verdad en el CSS, y
 * todo valor de las uniones de \`${Name}.types.ts\` tiene que tener entrada aquí.
 * Lo verifica \`pnpm check:contract\`, no la buena voluntad.
 */
export default {
  /** Rol semántico: fija --${prefix}-color / --${prefix}-fg. */
  theme: {
${THEMES.map((theme) => `    ${theme}: "${prefix}-${theme}",`).join("\n")}
  },
  size: {
${SIZES.map(({ key }) => `    ${key}: "${prefix}-${key}",`).join("\n")}
  },
  /** Estados que no derivan de un pseudo-selector. */
  state: {
    active: "${prefix}-active",
    disabled: "${prefix}-disabled",${compound ? `\n    open: "${prefix}-open",` : ""}
  },${
    compound
      ? `
  trigger: {
    base: "${prefix}-trigger",
    active: "${prefix}-trigger-active",
  },
  panel: {
    base: "${prefix}-panel",
    open: "${prefix}-panel-open",
    closed: "${prefix}-panel-closed",
  },
  item: {
    base: "${prefix}-item",
    selected: "${prefix}-item-selected",
    disabled: "${prefix}-item-disabled",
  },`
      : ""
  }
};
`;

// ---------------------------------------------------------------------------
// plantillas: paquete de React
// ---------------------------------------------------------------------------

const packageJsonTemplate = ({ name, Name, compound }) =>
  `${JSON.stringify(
    {
      name: `@ownui/${name}`,
      version: "1.0.0",
      description: `${Name} component for Own UI.`,
      main: "dist/index.js",
      module: "dist/index.mjs",
      types: "dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.mjs",
          require: "./dist/index.js",
        },
      },
      keywords: ["react", "ui", name],
      files: ["dist"],
      sideEffects: false,
      publishConfig: { access: "public" },
      scripts: {
        build: "tsup",
        dev: "pnpm build:fast --watch",
        typecheck: "tsc --noEmit",
        "build:fast": "tsup src",
      },
      author: "ferbbo <Diego Benitez>",
      license: "MIT",
      peerDependencies: {
        react: ">=18 || <20.0.0",
        "react-dom": ">=18 <20.0.0",
      },
      dependencies: {
        "@ownui/tw-theme": "workspace:*",
        ...(compound
          ? {
              "@ownui/dom-utils": "workspace:*",
              "@react-aria/button": "^3.13.1",
              "@react-aria/utils": "^3.29.0",
            }
          : {}),
      },
      devDependencies: {
        "@storybook/react": "^8.6.12",
        "@types/react": "^19.0.10",
        "@types/react-dom": "^19.0.4",
        react: "^19.0.1",
        "react-dom": "^19.0.1",
        tsup: "^8.4.0",
      },
    },
    null,
    2
  )}\n`;

const tsconfigTemplate = () => `{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist",
    "declarationDir": "./dist",
    "allowJs": true,
    "checkJs": false
  },
  "include": ["src/**/*"]
}
`;

const tsupTemplate = () => `import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  // Compatibilidad con RSC / Next: el banner va en todos los paquetes.
  banner: { js: '"use client";' },
  dts: true,
  minify: true,
  external: ["react", "react-dom"],
});
`;

const typesTemplate = ({ Name, compound }) => `// ${Name}.types.ts
import {${
  compound ? "\n  ButtonHTMLAttributes,\n  HTMLAttributes," : ""
} ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Roles semánticos del ${Name}. Cada valor tiene que tener entrada en
 * \`theme\` de \`variants/${Name.toLowerCase()}.ts\` (lo verifica \`pnpm check:contract\`).
 */
export type ${Name}Theme =
${THEMES.map((theme) => `  | "${theme}"`).join("\n")};

/** Tamaños del ${Name}. */
export type ${Name}Size = ${SIZES.map(({ key }) => `"${key}"`).join(" | ")};

/** Props propias del ${Name} (las que no son atributos del DOM). */
export interface ${Name}BaseProps {
  /** Rol semántico. */
  theme?: ${Name}Theme;
  /** Tamaño. */
  size?: ${Name}Size;
  /** Estado deshabilitado. */
  disabled?: boolean;
  /** Clases CSS adicionales. */
  className?: string;
  /** Contenido. */
  children?: ReactNode;
}

/** Elemento que se renderiza (patrón polimórfico de \`AGENTS.md\` §5.4). */
export interface ${Name}PolymorphicProps<T extends ElementType = "div"> {
  as?: T;
}

export type ${Name}Props<T extends ElementType = "div"> = ${Name}BaseProps &
  ${Name}PolymorphicProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ${Name}BaseProps>;

export type ${Name}DefaultProps = ${Name}Props<"div">;
${
  compound
    ? `
/** Props del trigger. */
export interface ${Name}TriggerProps
  extends ${Name}BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ${Name}BaseProps> {
  children: ReactNode;
}

/** Props del panel. */
export interface ${Name}PanelProps
  extends ${Name}BaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof ${Name}BaseProps> {
  children: ReactNode;
}

/** Props de un item del panel. */
export interface ${Name}ItemProps
  extends ${Name}BaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof ${Name}BaseProps> {
  children: ReactNode;
  /** Item marcado como seleccionado. */
  selected?: boolean;
  /** Callback al seleccionar (cierra el panel). */
  onSelect?: () => void;
}

/** Props de configuración del root (las consume el Provider, no el DOM). */
export interface ${Name}RootProps extends ${Name}Props<"div"> {
  /** Abierto por defecto (no controlado). */
  defaultOpen?: boolean;
  /** Abierto (controlado). */
  open?: boolean;
  /** Notifica cada cambio de apertura. */
  onOpenChange?: (open: boolean) => void;
}

/** Valor del contexto que comparten los subcomponentes. */
export interface ${Name}ContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  theme: ${Name}Theme;
  size: ${Name}Size;
  panelId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}
`
    : ""
}`;

const hookTemplate = ({ name, Name, prefix }) => `// use${Name}.tsx
import { ElementType, useMemo } from "react";
import { ${name} } from "@ownui/tw-theme/variants";
import { ${Name}Props } from "./${Name}.types";

/**
 * Hook del ${Name}: concentra TODA la lógica (clases, atributos, elemento) y
 * deja el componente como una cáscara de render. Secuencia de \`AGENTS.md\` §5.2.
 *
 * Las clases se leen del contrato (\`@ownui/tw-theme/variants\`) y nunca se
 * escriben a mano: así \`pnpm check:contract\` puede cruzarlas con el CSS.
 *
 * Si el componente es interactivo (recibe foco, responde a teclado), este hook
 * tiene que pasar por un hook de \`@react-aria/*\` antes de devolver las props
 * — regla §8.5 de \`AGENTS.md\`. El andamio no lo hace porque no sabe todavía
 * qué es este componente.
 */
export function use${Name}(props: ${Name}Props): {
  classNames: string;
  ${name}Props: Record<string, unknown>;
  Comp: ElementType;
} {
  const {
    as: rawAs,
    theme = "primary",
    size = "md",
    disabled = false,
    className = "",
    children: _children,
    ...restProps
  } = props;

  const as = (rawAs ?? "div") as ElementType;

  const classNames = useMemo(() => {
    const base = "${prefix}";
    const themeCls = ${name}.theme[theme] ?? "";
    const sizeCls = ${name}.size[size] ?? "";
    const disabledCls = disabled ? ${name}.state.disabled : "";

    return [base, themeCls, sizeCls, disabledCls, className].filter(Boolean).join(" ");
  }, [theme, size, disabled, className]);

  const ${name}Props = {
    ...restProps,
    "aria-disabled": disabled || undefined,
  };

  return { classNames, ${name}Props, Comp: as };
}

export default use${Name};
`;

const componentTemplate = ({ name, Name }) => `// ${Name}.tsx
import React, { forwardRef } from "react";
import use${Name} from "./use${Name}";
import { ${Name}Props } from "./${Name}.types";

/**
 * ${Name} — generado con \`pnpm create-component\` (lote 8).
 *
 * El componente no decide nada: el hook resuelve clases y atributos, y aquí
 * sólo queda el render (\`AGENTS.md\` §5.2).
 */
const ${Name} = forwardRef<HTMLDivElement, ${Name}Props>(function ${Name}(props, ref) {
  const { children } = props;
  const { classNames, ${name}Props, Comp } = use${Name}(props);

  return (
    <Comp ref={ref} className={classNames} {...${name}Props}>
      {children}
    </Comp>
  );
});

export default React.memo(${Name});
`;

const indexTemplate = ({ Name, compound }) => `// index.ts
export { default } from "./${Name}";
export type {
  ${Name}Props,
  ${Name}DefaultProps,
  ${Name}Theme,
  ${Name}Size,${
    compound
      ? `
  ${Name}RootProps,
  ${Name}TriggerProps,
  ${Name}PanelProps,
  ${Name}ItemProps,
  ${Name}ContextValue,`
      : ""
  }
} from "./${Name}.types";
export { use${Name} } from "./use${Name}";${
  compound
    ? `
export { ${Name}Trigger, ${Name}Panel, ${Name}Item } from "./${Name}";
export { ${Name}Provider, use${Name}Context } from "./${Name}Context";`
    : ""
}
`;

const storiesTemplate = ({ Name, compound }) => `// ${Name}.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import ${Name} from "./${Name}";
import { ${Name}Props } from "./${Name}.types";

const meta: Meta<typeof ${Name}> = {
  title: "Components/${Name}",
  component: ${Name},
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "${Name} generado con \`pnpm create-component\`. Sustituye esta descripcion por la del componente real.",
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: [${THEMES.map((theme) => `"${theme}"`).join(", ")}],
      description: "Rol semantico",
    },
    size: {
      control: { type: "select" },
      options: [${SIZES.map(({ key }) => `"${key}"`).join(", ")}],
      description: "Tamano",
    },
    disabled: { control: { type: "boolean" }, description: "Estado deshabilitado" },
    className: { control: { type: "text" }, description: "Clases CSS adicionales" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<${Name}Props>;

export const Default: Story = {
  args: { theme: "primary", size: "md", children: "${Name}" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
${THEMES.map((theme) => `      <${Name} theme="${theme}">${theme}</${Name}>`).join("\n")}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
${SIZES.map(({ key }) => `      <${Name} size="${key}">${key}</${Name}>`).join("\n")}
    </div>
  ),
};

export const Disabled: Story = {
  args: { theme: "primary", disabled: true, children: "Deshabilitado" },
};
${
  compound
    ? `
export const Compound: Story = {
  render: () => (
    <${Name} theme="primary" size="md" defaultOpen>
      <${Name}.Trigger>Abrir</${Name}.Trigger>
      <${Name}.Panel>
        <${Name}.Item>Opcion 1</${Name}.Item>
        <${Name}.Item selected>Opcion 2</${Name}.Item>
        <${Name}.Item disabled>Opcion 3</${Name}.Item>
      </${Name}.Panel>
    </${Name}>
  ),
};
`
    : ""
}`;

const simpleTestTemplate = ({ name, Name, prefix }) => `// ${Name}.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { ${name} } from "@ownui/tw-theme/variants";
import ${Name} from "../src/${Name}";

/**
 * Tests reales con React Testing Library. Nunca stubs de \`console.log\`:
 * \`AGENTS.md\` §8.6 marca el \`Button.test.tsx\` original como el antipatrón del
 * repo, no como plantilla.
 *
 * Las clases esperadas se leen del contrato en vez de escribirse a mano, así
 * que si el contrato cambia este test lo nota.
 */
describe("${Name}", () => {
  test("renderiza con las props por defecto", () => {
    render(<${Name} data-testid="${name}">contenido</${Name}>);
    const node = screen.getByTestId("${name}");

    expect(node).toBeInTheDocument();
    expect(node).toHaveClass("${prefix}", ${name}.theme.primary, ${name}.size.md);
    expect(node).toHaveTextContent("contenido");
  });

  test.each(Object.entries(${name}.theme))("theme=%s aplica .%s", (theme, cls) => {
    render(
      <${Name} data-testid="${name}" theme={theme as keyof typeof ${name}.theme}>
        x
      </${Name}>
    );

    expect(screen.getByTestId("${name}")).toHaveClass(cls);
  });

  test.each(Object.entries(${name}.size))("size=%s aplica .%s", (size, cls) => {
    render(
      <${Name} data-testid="${name}" size={size as keyof typeof ${name}.size}>
        x
      </${Name}>
    );

    expect(screen.getByTestId("${name}")).toHaveClass(cls);
  });

  test("disabled aplica la clase de estado y aria-disabled", () => {
    render(
      <${Name} data-testid="${name}" disabled>
        x
      </${Name}>
    );
    const node = screen.getByTestId("${name}");

    expect(node).toHaveClass(${name}.state.disabled);
    expect(node).toHaveAttribute("aria-disabled", "true");
  });

  test("respeta className y no pierde las clases del sistema", () => {
    render(
      <${Name} data-testid="${name}" className="mi-clase">
        x
      </${Name}>
    );

    expect(screen.getByTestId("${name}")).toHaveClass("${prefix}", "mi-clase");
  });

  test("es polimórfico con \`as\`", () => {
    render(
      <${Name} data-testid="${name}" as="section">
        x
      </${Name}>
    );

    expect(screen.getByTestId("${name}").tagName).toBe("SECTION");
  });

  test("reenvía la ref al nodo del DOM", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<${Name} ref={ref}>x</${Name}>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
`;

const compoundTestTemplate = ({ name, Name, prefix }) => `// ${Name}.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ${name} } from "@ownui/tw-theme/variants";
import ${Name} from "../src/${Name}";
import { ${Name}RootProps } from "../src/${Name}.types";

/**
 * Tests reales con React Testing Library. Nunca stubs de \`console.log\`:
 * \`AGENTS.md\` §8.6 marca el \`Button.test.tsx\` original como el antipatrón del
 * repo, no como plantilla.
 *
 * Las clases esperadas se leen del contrato en vez de escribirse a mano, y el
 * panel se busca con \`{ hidden: true }\` porque mientras está cerrado lleva
 * \`aria-hidden\` y no aparece en el árbol de accesibilidad.
 */
describe("${Name}", () => {
  const renderCompound = (props: Partial<${Name}RootProps> = {}) =>
    render(
      <${Name} data-testid="${name}" {...props}>
        <${Name}.Trigger>Abrir</${Name}.Trigger>
        <${Name}.Panel>
          <${Name}.Item>Opcion 1</${Name}.Item>
          <${Name}.Item disabled>Opcion 2</${Name}.Item>
        </${Name}.Panel>
      </${Name}>
    );

  const trigger = () => screen.getByRole("button", { name: "Abrir" });
  const panelNode = () => screen.getByRole("menu", { hidden: true });

  test("el root sólo posiciona: no lleva el color del rol", () => {
    renderCompound();
    const root = screen.getByTestId("${name}");

    expect(root).toHaveClass("${prefix}");
    expect(root).not.toHaveClass(${name}.theme.primary);
  });

  test("el trigger toma el rol y el tamaño del contexto", () => {
    renderCompound({ theme: "success", size: "lg" });

    expect(trigger()).toHaveClass(
      "${prefix}",
      ${name}.theme.success,
      ${name}.size.lg,
      ${name}.trigger.base
    );
  });

  test("el panel arranca cerrado y el trigger lo anuncia", () => {
    renderCompound();

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("aria-controls", panelNode().id);
    expect(panelNode()).toHaveClass(${name}.panel.closed);
    expect(panelNode()).toHaveAttribute("aria-hidden", "true");
  });

  test("el trigger abre y cierra el panel", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    renderCompound({ onOpenChange });

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(panelNode()).toHaveClass(${name}.panel.open);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  test("Escape cierra el panel y devuelve el foco al trigger", async () => {
    const user = userEvent.setup();
    renderCompound({ defaultOpen: true });

    await user.keyboard("{Escape}");

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  test("seleccionar un item lo notifica y cierra el panel", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <${Name} defaultOpen>
        <${Name}.Trigger>Abrir</${Name}.Trigger>
        <${Name}.Panel>
          <${Name}.Item onSelect={onSelect}>Opcion 1</${Name}.Item>
        </${Name}.Panel>
      </${Name}>
    );

    await user.click(screen.getByRole("menuitem", { name: "Opcion 1" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  test("un item deshabilitado no notifica ni cierra", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <${Name} defaultOpen>
        <${Name}.Trigger>Abrir</${Name}.Trigger>
        <${Name}.Panel>
          <${Name}.Item disabled onSelect={onSelect}>
            Opcion 2
          </${Name}.Item>
        </${Name}.Panel>
      </${Name}>
    );

    await user.click(screen.getByRole("menuitem", { name: "Opcion 2" }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  test("las props de configuración no se filtran al DOM", () => {
    // La deuda §9.8 del Dropdown: \`{...restProps}\` sobre el <div> metía
    // \`defaultOpen\` y compañía en el HTML servido.
    renderCompound({ defaultOpen: true, theme: "info", size: "sm" });
    const root = screen.getByTestId("${name}");

    for (const attr of ["defaultopen", "open", "onopenchange", "theme", "size"]) {
      expect(root.hasAttribute(attr)).toBe(false);
    }
  });

  test("reenvía la ref al nodo raíz", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <${Name} ref={ref}>
        <${Name}.Trigger>Abrir</${Name}.Trigger>
        <${Name}.Panel>
          <${Name}.Item>Opcion 1</${Name}.Item>
        </${Name}.Panel>
      </${Name}>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
`;

// ---------------------------------------------------------------------------
// plantillas: patrón compound (Provider + Trigger/Panel/Item)
// ---------------------------------------------------------------------------

const contextTemplate = ({ Name }) => `// ${Name}Context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { ${Name}ContextValue, ${Name}RootProps } from "./${Name}.types";

const ${Name}Context = createContext<${Name}ContextValue | null>(null);

/**
 * Acceso al contexto. Falla rápido fuera del provider: un subcomponente
 * suelto es un error de uso, no un caso a tolerar (\`AGENTS.md\` §5.3).
 */
export function use${Name}Context(): ${Name}ContextValue {
  const context = useContext(${Name}Context);

  if (!context) {
    throw new Error("Los subcomponentes de ${Name} deben usarse dentro de <${Name}>");
  }

  return context;
}

interface ${Name}ProviderProps
  extends Pick<${Name}RootProps, "theme" | "size" | "defaultOpen" | "open" | "onOpenChange"> {
  children: ReactNode;
}

/**
 * Provider: es el único que conoce el estado de apertura. Controlado si llega
 * \`open\`, no controlado si no; \`onOpenChange\` se llama siempre.
 */
export function ${Name}Provider({
  children,
  theme = "primary",
  size = "md",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: ${Name}ProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelId = useId();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = useMemo<${Name}ContextValue>(
    () => ({ open, setOpen, theme, size, panelId, triggerRef }),
    [open, setOpen, theme, size, panelId]
  );

  return <${Name}Context.Provider value={value}>{children}</${Name}Context.Provider>;
}

export { ${Name}Context };
`;

const compoundHookTemplate = ({ name, Name, prefix }) => `// use${Name}.tsx
import React, { useCallback, useEffect, useMemo } from "react";
import { useButton as useAriaButton } from "@react-aria/button";
import { mergeProps } from "@react-aria/utils";
import { useDOMRef } from "@ownui/dom-utils";
import { ${name} } from "@ownui/tw-theme/variants";
import { use${Name}Context } from "./${Name}Context";
import {
  ${Name}ItemProps,
  ${Name}PanelProps,
  ${Name}RootProps,
  ${Name}TriggerProps,
} from "./${Name}.types";

/**
 * Hooks del ${Name} (patrón B de \`AGENTS.md\` §5.3). Toda la lógica vive aquí;
 * los componentes sólo renderizan.
 *
 * Las clases salen del contrato de \`@ownui/tw-theme/variants\`, nunca de
 * plantillas escritas a mano: es lo que permite a \`pnpm check:contract\`
 * cruzarlas con el CSS.
 */

/** Root: separa las props de configuración de los atributos del DOM. */
export function use${Name}(props: ${Name}RootProps): {
  classNames: string;
  domProps: React.ComponentPropsWithoutRef<"div">;
} {
  const {
    // props de configuración: las consume el Provider, NO el DOM (deuda §9.8)
    theme: _theme,
    size: _size,
    defaultOpen: _defaultOpen,
    open: _open,
    onOpenChange: _onOpenChange,
    as: _as,
    disabled: _disabled,
    children: _children,
    className = "",
    ...domProps
  } = props;

  const { open } = use${Name}Context();

  const classNames = useMemo(
    () =>
      ["${prefix}", open ? ${name}.state.open : "", className].filter(Boolean).join(" "),
    [open, className]
  );

  return { classNames, domProps };
}

/** Trigger: botón de verdad, con React Aria y el estado del contexto. */
export function use${Name}Trigger(
  props: ${Name}TriggerProps,
  ref: React.Ref<HTMLButtonElement | null>
): {
  classNames: string;
  triggerProps: React.ComponentPropsWithoutRef<"button">;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
} {
  // \`theme\` y \`size\` salen del contexto: si se quedaran en \`restProps\`
  // acabarían como atributos inválidos en el <button> (deuda §9.8).
  const {
    className = "",
    children: _children,
    theme: _theme,
    size: _size,
    disabled = false,
    ...restProps
  } = props;
  const { open, setOpen, theme, size, panelId, triggerRef } = use${Name}Context();

  const innerRef = useDOMRef<HTMLButtonElement>(ref);

  // El Provider necesita el nodo para devolverle el foco al cerrar con Esc.
  useEffect(() => {
    triggerRef.current = innerRef.current;
  }, [innerRef, triggerRef]);

  const classNames = useMemo(
    () =>
      [
        "${prefix}",
        ${name}.theme[theme],
        ${name}.size[size],
        ${name}.trigger.base,
        open ? ${name}.trigger.active : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [theme, size, open, className]
  );

  const onPress = useCallback(() => setOpen(!open), [open, setOpen]);

  const { buttonProps } = useAriaButton(
    { onPress, isDisabled: disabled, elementType: "button" },
    innerRef as React.RefObject<HTMLButtonElement>
  );

  const triggerProps = mergeProps(
    buttonProps,
    {
      "aria-expanded": open,
      "aria-haspopup": "menu",
      "aria-controls": panelId,
    },
    restProps
  );

  // El \`buttonRef\` tiene que acabar en el \`<button>\`: \`useDOMRef\` sólo
  // reenvía su contenido a la ref externa (useImperativeHandle), no lo rellena.
  // Si el componente monta la ref del forwardRef en vez de ésta, el nodo nunca
  // llega al contexto y Esc no puede devolverle el foco.
  return { classNames, triggerProps, buttonRef: innerRef };
}

/**
 * Panel: queda montado y cerrado en vez de desmontarse, para que la
 * transición de \`${prefix}-panel-closed\` → \`-open\` tenga desde dónde animar
 * y para que \`aria-controls\` del trigger apunte siempre a algo.
 */
export function use${Name}Panel(props: ${Name}PanelProps): {
  classNames: string;
  panelProps: React.ComponentPropsWithoutRef<"div">;
} {
  const {
    className = "",
    children: _children,
    theme: _theme,
    size: _size,
    disabled: _disabled,
    ...restProps
  } = props;
  const { open, setOpen, panelId, triggerRef } = use${Name}Context();

  const classNames = useMemo(
    () =>
      [
        ${name}.panel.base,
        open ? ${name}.panel.open : ${name}.panel.closed,
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [open, className]
  );

  // Esc cierra y devuelve el foco al trigger. El listener sólo existe
  // mientras está abierto, y se limpia al cerrar o desmontar.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen, triggerRef]);

  const panelProps = {
    ...restProps,
    id: panelId,
    role: "menu",
    "aria-hidden": !open,
  };

  return { classNames, panelProps };
}

/**
 * Item: \`role="menuitem"\`, cierra al seleccionar.
 *
 * ⚠️ Falta la navegación con flechas, \`Home\`/\`End\` y el cierre por
 * click-outside: un \`role="menu"\` sin teclado completo miente al lector de
 * pantalla. Copia la implementación del \`Dropdown\` (lote 7) o pasa por
 * \`@react-aria/menu\` antes de publicar este componente.
 */
export function use${Name}Item(props: ${Name}ItemProps): {
  classNames: string;
  itemProps: React.ComponentPropsWithoutRef<"div">;
} {
  const {
    className = "",
    children: _children,
    theme: _theme,
    size: _size,
    selected = false,
    disabled = false,
    onSelect,
    ...restProps
  } = props;
  const { setOpen, triggerRef } = use${Name}Context();

  const classNames = useMemo(
    () =>
      [
        ${name}.item.base,
        selected ? ${name}.item.selected : "",
        disabled ? ${name}.item.disabled : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [selected, disabled, className]
  );

  const onClick = useCallback(() => {
    if (disabled) return;

    onSelect?.();
    setOpen(false);
    triggerRef.current?.focus();
  }, [disabled, onSelect, setOpen, triggerRef]);

  const itemProps = {
    ...restProps,
    role: "menuitem",
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled,
    "aria-selected": selected,
    onClick,
  };

  return { classNames, itemProps };
}

export default use${Name};
`;

const compoundComponentTemplate = ({ Name }) => `// ${Name}.tsx
import React, { forwardRef } from "react";
import { ${Name}Provider } from "./${Name}Context";
import { use${Name}, use${Name}Item, use${Name}Panel, use${Name}Trigger } from "./use${Name}";
import {
  ${Name}ItemProps,
  ${Name}PanelProps,
  ${Name}RootProps,
  ${Name}TriggerProps,
} from "./${Name}.types";

/**
 * ${Name} — patrón compound generado con \`pnpm create-component --compound\`.
 *
 * El root monta el Provider y el contenedor; los subcomponentes leen el estado
 * del contexto y no reciben props de configuración (\`AGENTS.md\` §5.3).
 */
const ${Name}Root = forwardRef<HTMLDivElement, ${Name}RootProps>(function ${Name}(props, ref) {
  const { children, theme, size, defaultOpen, open, onOpenChange } = props;

  return (
    <${Name}Provider
      theme={theme}
      size={size}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <${Name}Container ref={ref} {...props}>
        {children}
      </${Name}Container>
    </${Name}Provider>
  );
});

const ${Name}Container = forwardRef<HTMLDivElement, ${Name}RootProps>(
  function ${Name}Container(props, ref) {
    const { children } = props;
    const { classNames, domProps } = use${Name}(props);

    return (
      <div ref={ref} className={classNames} {...domProps}>
        {children}
      </div>
    );
  }
);

const ${Name}TriggerBase = forwardRef<HTMLButtonElement, ${Name}TriggerProps>(
  function ${Name}Trigger(props, ref) {
    const { children } = props;
    const { classNames, triggerProps, buttonRef } = use${Name}Trigger(props, ref);

    return (
      <button ref={buttonRef} className={classNames} {...triggerProps}>
        {children}
      </button>
    );
  }
);

const ${Name}PanelBase = forwardRef<HTMLDivElement, ${Name}PanelProps>(
  function ${Name}Panel(props, ref) {
    const { children } = props;
    const { classNames, panelProps } = use${Name}Panel(props);

    return (
      <div ref={ref} className={classNames} {...panelProps}>
        {children}
      </div>
    );
  }
);

const ${Name}ItemBase = forwardRef<HTMLDivElement, ${Name}ItemProps>(
  function ${Name}Item(props, ref) {
    const { children } = props;
    const { classNames, itemProps } = use${Name}Item(props);

    return (
      <div ref={ref} className={classNames} {...itemProps}>
        {children}
      </div>
    );
  }
);

const Memoized${Name} = React.memo(${Name}Root);
const Memoized${Name}Trigger = React.memo(${Name}TriggerBase);
const Memoized${Name}Panel = React.memo(${Name}PanelBase);
const Memoized${Name}Item = React.memo(${Name}ItemBase);

interface ${Name}CompoundComponent
  extends React.NamedExoticComponent<${Name}RootProps & React.RefAttributes<HTMLDivElement>> {
  Trigger: typeof Memoized${Name}Trigger;
  Panel: typeof Memoized${Name}Panel;
  Item: typeof Memoized${Name}Item;
}

const ${Name} = Memoized${Name} as ${Name}CompoundComponent;
${Name}.Trigger = Memoized${Name}Trigger;
${Name}.Panel = Memoized${Name}Panel;
${Name}.Item = Memoized${Name}Item;

export default ${Name};
export {
  Memoized${Name}Trigger as ${Name}Trigger,
  Memoized${Name}Panel as ${Name}Panel,
  Memoized${Name}Item as ${Name}Item,
};
`;

// ---------------------------------------------------------------------------
// escritura y registro
// ---------------------------------------------------------------------------

/**
 * Prettier es devDependency del repo, pero el script tiene que funcionar
 * igual si no se puede resolver (p. ej. generando en un árbol de pruebas sin
 * `pnpm install`): entonces escribe sin formatear y lo dice.
 */
async function loadPrettier() {
  try {
    // Prettier 2 es CommonJS: su API queda en `default` al importarlo como ESM.
    const module = await import("prettier");

    return module.resolveConfig ? module : module.default;
  } catch {
    console.warn("! prettier no disponible: los archivos se escriben sin formatear.\n");
    return null;
  }
}

const PARSERS = { ".ts": "typescript", ".tsx": "typescript", ".css": "css", ".json": "json" };

async function format(prettier, path, contents) {
  const extension = path.slice(path.lastIndexOf("."));
  // `package.json` lo formatea Prettier con `json-stringify` (misma forma que
  // `JSON.stringify`), no con `json`: con el parser equivocado, el archivo
  // generado sale distinto de lo que `prettier --check` espera.
  const parser = path.endsWith("package.json") ? "json-stringify" : PARSERS[extension];

  if (!prettier || !parser) return contents;

  try {
    const config = await prettier.resolveConfig(path);

    return await prettier.format(contents, { ...config, parser });
  } catch (error) {
    console.warn(`! prettier no pudo formatear ${path}: ${error.message}`);

    return contents;
  }
}

class Plan {
  constructor({ root, dryRun, force }) {
    this.root = root;
    this.dryRun = dryRun;
    this.force = force;
    this.created = [];
    this.updated = [];
    this.skipped = [];
    this.pending = [];
  }

  /**
   * Anota un archivo para escribir. La escritura real ocurre en `commit()`,
   * que es donde pasa por Prettier: así el andamio no genera 40 avisos de
   * formato que alguien tendría que arreglar a mano en el primer commit.
   */
  write(relative, contents) {
    const path = join(this.root, relative);

    if (existsSync(path) && !this.force) {
      this.skipped.push(relative);
      return;
    }

    this.pending.push({ relative, path, contents });
    this.created.push(relative);
  }

  /** Formatea con la configuración del repo y escribe. */
  async commit() {
    const prettier = await loadPrettier();

    for (const { path, contents } of this.pending) {
      if (this.dryRun) continue;

      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, await format(prettier, path, contents));
    }
  }

  /** Registra algo en un archivo existente, si no está ya. */
  patch(relative, { marker, transform }) {
    const path = join(this.root, relative);

    if (!existsSync(path)) {
      this.skipped.push(`${relative} (no existe)`);
      return;
    }

    const before = readFileSync(path, "utf8");

    if (before.includes(marker)) {
      this.skipped.push(`${relative} (ya registrado)`);
      return;
    }

    const after = transform(before);

    if (after === before) {
      this.skipped.push(`${relative} (no encontré dónde registrarlo)`);
      return;
    }

    if (!this.dryRun) writeFileSync(path, after);

    this.updated.push(relative);
  }
}

function generate({ Name, name, prefix, compound, plan }) {
  const twSrc = join("packages", "tw-theme", "src");
  const pkg = join("packages", "ui", "src", Name);
  const context = { Name, name, prefix, compound };

  // 1-2. CSS y contrato PRIMERO: un componente sin CSS publicado no está hecho.
  plan.write(join(twSrc, "css", `${name}.css`), cssTemplate(context));
  plan.write(join(twSrc, "variants", `${name}.ts`), variantsTemplate(context));

  // 3. Registro de las dos capas de estilo.
  plan.patch(join(twSrc, "css", "index.css"), {
    marker: `./${name}.css`,
    transform: (source) => `${source.trimEnd()}\n@import "./${name}.css";\n`,
  });

  plan.patch(join(twSrc, "variants", "index.ts"), {
    marker: `./${name}.ts`,
    transform: (source) =>
      `${source.trimEnd()}\nexport { default as ${name} } from "./${name}.ts";\n`,
  });

  // 4. Paquete de React.
  plan.write(join(pkg, "package.json"), packageJsonTemplate(context));
  plan.write(join(pkg, "tsconfig.json"), tsconfigTemplate(context));
  plan.write(join(pkg, "tsup.config.ts"), tsupTemplate(context));
  plan.write(join(pkg, "src", `${Name}.types.ts`), typesTemplate(context));
  plan.write(
    join(pkg, "src", `use${Name}.tsx`),
    compound ? compoundHookTemplate(context) : hookTemplate(context)
  );
  plan.write(
    join(pkg, "src", `${Name}.tsx`),
    compound ? compoundComponentTemplate(context) : componentTemplate(context)
  );
  if (compound) plan.write(join(pkg, "src", `${Name}Context.tsx`), contextTemplate(context));
  plan.write(join(pkg, "src", "index.ts"), indexTemplate(context));
  plan.write(join(pkg, "src", `${Name}.stories.tsx`), storiesTemplate(context));
  plan.write(
    join(pkg, "__test__", `${Name}.test.tsx`),
    compound ? compoundTestTemplate(context) : simpleTestTemplate(context)
  );

  // 5. Registro del paquete en el agregador, en las deps y en la resolución
  //    de tests y tipos.
  plan.patch(join("packages", "ui", "src", "index.ts"), {
    marker: `./${Name}/src/${Name}`,
    transform: (source) =>
      `${source.trimEnd()}\n\nexport { default as ${Name} } from "./${Name}/src/${Name}";\n` +
      `export type { ${Name}Props } from "./${Name}/src/${Name}.types";\n` +
      `export * from "./${Name}/src/${Name}.types";\n`,
  });

  plan.patch(join("packages", "ui", "package.json"), {
    marker: `"@ownui/${name}"`,
    transform: (source) =>
      source.replace(
        /(\n\s*)"@ownui\/tw-theme": "workspace:\*",/,
        `$1"@ownui/${name}": "workspace:*",$1"@ownui/tw-theme": "workspace:*",`
      ),
  });

  plan.patch("jest.config.js", {
    marker: `"^@ownui/${name}$"`,
    transform: (source) =>
      source.replace(
        /(\n\s*)"\^@ownui\/ui\$":/,
        `$1"^@ownui/${name}$": "<rootDir>/packages/ui/src/${Name}/src/index.ts",$1"^@ownui/ui$":`
      ),
  });

  plan.patch("tsconfig.jest.json", {
    marker: `"@ownui/${name}"`,
    transform: (source) =>
      source.replace(
        /(\n\s*)"@ownui\/ui": \["packages\/ui\/src\/index\.ts"\]/,
        `$1"@ownui/${name}": ["packages/ui/src/${Name}/src/index.ts"],$1"@ownui/ui": ["packages/ui/src/index.ts"]`
      ),
  });
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const HELP = `
create-component — andamio de un componente nuevo de Own UI.

  pnpm create-component <Nombre> [opciones]

  --compound        patrón Provider + Trigger/Panel/Item
  --prefix <p>      prefijo de clase CSS (por defecto, el nombre en minúsculas)
  --root <ruta>     raíz del monorepo donde generar
  --dry-run         enseña lo que haría sin escribir
  --force           sobrescribe los archivos que ya existan
  --help            esta ayuda

Genera, en este orden: css/<name>.css, variants/<name>.ts, su registro en
css/index.css y variants/index.ts, el paquete packages/ui/src/<Name>/ (tipos,
hook, componente, stories, test) y su registro en el agregador, en las
dependencias de @ownui/ui, en jest.config.js y en tsconfig.jest.json.
`;

function parseArgs(argv) {
  const options = {
    Name: null,
    prefix: null,
    root: DEFAULT_ROOT,
    compound: false,
    dryRun: false,
    force: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--compound") options.compound = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--prefix") options.prefix = argv[++index];
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else if (arg.startsWith("-")) {
      console.error(`Opción desconocida: ${arg}`);
      return null;
    } else if (!options.Name) options.Name = arg;
    else {
      console.error(`Sobra el argumento: ${arg}`);
      return null;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options || options.help || !options.Name) {
    console.log(HELP.trim());
    process.exit(options && (options.help || options.Name) ? 0 : 2);
  }

  const { Name } = options;

  if (!/^[A-Z][A-Za-z0-9]*$/.test(Name)) {
    console.error(
      `El nombre tiene que ser PascalCase sin guiones ni dígitos iniciales: "${Name}" no lo es.`
    );
    process.exit(2);
  }

  const name = Name.toLowerCase();
  const prefix = options.prefix ?? name;

  if (!/^[a-z][a-z0-9-]*$/.test(prefix)) {
    console.error(`El prefijo tiene que ser kebab-case en minúsculas: "${prefix}" no lo es.`);
    process.exit(2);
  }

  const plan = new Plan(options);

  generate({ Name, name, prefix, compound: options.compound, plan });

  await plan.commit();

  const title = options.dryRun ? "create-component (--dry-run)" : "create-component";
  console.log(`${title} — ${Name} (.${prefix}${options.compound ? ", compound" : ""})\n`);

  for (const file of plan.created) console.log(`  + ${file}`);
  for (const file of plan.updated) console.log(`  ~ ${file}`);
  for (const file of plan.skipped) console.log(`  = ${file} (sin tocar)`);

  if (options.dryRun) {
    console.log("\nNada escrito: quita --dry-run para generarlo.");
    return;
  }

  console.log(`
Siguientes pasos:

  1. pnpm install                       # enlaza @ownui/${name} en el workspace
  2. pnpm check:contract                # las tres capas tienen que decir lo mismo
  3. pnpm test:components               # el test generado ya pasa
  4. pnpm --filter @ownui/${name} build${" ".repeat(Math.max(0, 10 - name.length))}# ESM + CJS + .d.ts
  5. pnpm changeset                     # impacto de versión

Y luego lo que el andamio no puede saber: qué hace este componente. Rellena el
CSS, ajusta el contrato, pasa por @react-aria/* si es interactivo y escribe los
tests de su comportamiento real.`);
}

await main();

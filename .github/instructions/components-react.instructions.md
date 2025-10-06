---
applyTo: 'packages/components/**'
---

# Instrucciones para la Generación de Componentes React - Own UI

Esta guía define los estándares y patrones arquitectónicos para crear componentes en la librería Own UI, basada en el análisis del componente Button como referencia.

## 🏗️ Arquitectura de Componentes

### Estructura de Carpetas
Cada componente debe seguir esta estructura exacta:
```
packages/components/ComponentName/
├── src/
│   ├── ComponentName.tsx          # Componente principal
│   ├── useComponentName.tsx       # Hook de lógica
│   ├── ComponentName.types.ts     # Definiciones TypeScript
│   ├── ComponentName.stories.tsx  # Historias de Storybook
│   └── index.ts                  # Exportaciones públicas
├── __test__/
│   └── ComponentName.test.tsx    # Pruebas unitarias
├── package.json                  # Dependencias del componente
├── tsconfig.json                 # Configuración TypeScript
└── tsup.config.ts               # Configuración de build
```

### Principios Arquitectónicos

#### 1. Separación de Responsabilidades
- **Componente Principal**: Solo renderizado y forwarding de refs
- **Hook Personalizado**: Lógica de negocio, clases CSS y accesibilidad
- **Types**: Definiciones TypeScript con uniones discriminadas
- **Stories**: Documentación y casos de uso
- **Tests**: Pruebas unitarias y de integración

#### 2. Patrón de Composición
```tsx
// Componente principal (ComponentName.tsx)
const ComponentName = forwardRef<HTMLElement, ComponentProps>(
  function ComponentName(props, ref) {
    const { children } = props;
    const { classNames, componentProps, Comp } = useComponentName(props, ref);
    
    return (
      <Comp ref={ref} className={classNames} {...componentProps}>
        {children}
      </Comp>
    );
  }
);

export default React.memo(ComponentName);
```

#### 3. Patrón Provider (Para Componentes Complejos)
**Cuándo usar**: Componentes compound con múltiples subcomponentes que necesitan compartir estado o configuración.

```tsx
// ComponentName.tsx - Componente con Provider
const ComponentRoot = forwardRef<HTMLElement, ComponentProps>(
  function ComponentName(props, ref) {
    const { children, ...contextProps } = props;
    
    return (
      <ComponentProvider {...contextProps}>
        <ComponentContainer ref={ref} {...props}>
          {children}
        </ComponentContainer>
      </ComponentProvider>
    );
  }
);

// Compound components que consumen el contexto automáticamente
const ComponentTrigger = React.memo(forwardRef<HTMLElement, TriggerProps>(
  function ComponentTrigger(props, ref) {
    const { children } = props;
    const { triggerClasses, triggerProps, Comp } = useComponentTrigger(props, ref);
    
    return (
      <Comp ref={ref} className={triggerClasses} {...triggerProps}>
        {children}
      </Comp>
    );
  }
));

// Componente compuesto final
const Component = ComponentRoot as CompoundComponent;
Component.Trigger = ComponentTrigger;
Component.Menu = ComponentMenu;
Component.Item = ComponentItem;

export default Component;
```

**Estructura de archivos con Provider**:
```
ComponentName/
├── src/
│   ├── ComponentName.tsx         # Compound components + export
│   ├── ComponentNameContext.tsx  # Provider y contexto
│   ├── useComponentName.tsx      # Hooks de lógica
│   ├── ComponentName.types.ts    # Tipos + contexto
│   └── index.ts                 # Exportaciones
```

**Criterios para usar Provider**:
- ✅ Componente con 3+ subcomponentes relacionados
- ✅ Estado compartido entre subcomponentes
- ✅ Configuración global (variant, size, etc.)
- ✅ Evitar prop drilling en jerarquías profundas
- ❌ Componentes simples (Button, Input básico)
- ❌ Solo 1-2 subcomponentes sin estado compartido

## 🎯 Manejo de Lógica y Estado

### Hook Personalizado (useComponentName.tsx)
```tsx
export function useComponentName(
  props: ComponentProps,
  ref: ReactRef<HTMLElement | null>
): { classNames: string; componentProps: any; Comp: string } {
  
  // 1. Destructuring con defaults
  const { 
    as: rawAs, 
    variant = "primary", 
    size = "md", 
    className = "", 
    disabled = false,
    ...restProps 
  } = props;
  
  const as = rawAs ?? "defaultElement";

  // 2. Generación de clases CSS (memoizada)
  const classNames = useMemo(() => {
    const base = "component-base";
    const variantCls = variant ? `component-${variant}` : "";
    const sizeCls = size ? `component-${size}` : "";
    const disabledCls = disabled ? "opacity-50 cursor-not-allowed" : "";
    
    return [base, variantCls, sizeCls, disabledCls, className]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [variant, size, disabled, className]);

  // 3. Configuración de React Aria
  const innerRef = useDOMRef(ref);
  const ariaOptions = {
    isDisabled: disabled,
    elementType: as,
    // ... otras opciones específicas
  };

  // 4. Combinación de props
  const { componentProps: ariaProps } = useAriaHook(ariaOptions, innerRef);
  const componentProps = mergeProps(ariaProps, restProps);

  const Comp = as || "defaultElement";
  return { Comp, classNames, componentProps };
}
```

### Principios del Hook:
- **Memoización**: Usar `useMemo` para cálculos costosos como clases CSS
- **React Aria**: Integrar hooks de accesibilidad apropiados
- **Ref Management**: Usar `useDOMRef` para manejar refs entre react-aria y forwardRef
- **Props Merging**: Combinar props de aria con props nativos usando `mergeProps`

### Provider Context (Para Componentes Complejos)
Cuando se usa el patrón Provider, la lógica se separa en archivos dedicados:

#### ComponentNameContext.tsx
```tsx
import { createContext, useContext, useCallback, useMemo } from "react";

interface ComponentContextValue {
  // Estado compartido
  open: boolean;
  setOpen: (open: boolean) => void;
  // Props globales
  variant: ComponentVariant;
  size: ComponentSize;
  styleVariant?: ComponentStyleVariant;
}

const ComponentContext = createContext<ComponentContextValue | null>(null);

export function ComponentProvider({ 
  children, 
  variant = "primary",
  size = "md",
  styleVariant,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: ComponentProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Lógica controlada vs no controlada
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const setOpen = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  // Valor del contexto optimizado
  const contextValue = useMemo(() => ({
    open,
    setOpen,
    variant,
    size,
    styleVariant
  }), [open, setOpen, variant, size, styleVariant]);

  return (
    <ComponentContext.Provider value={contextValue}>
      {children}
    </ComponentContext.Provider>
  );
}

export function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('useComponentContext debe usarse dentro de ComponentProvider');
  }
  return context;
}
```

#### Hooks que consumen contexto automáticamente
```tsx
// useComponentName.tsx - Hooks especializados
export function useComponentTrigger(props: TriggerProps, ref: ReactRef) {
  const context = useComponentContext(); // Obtiene contexto automáticamente
  
  const triggerClasses = useMemo(() => {
    const base = "component-trigger";
    const variantCls = `component-${context.variant}`;
    const sizeCls = `component-${context.size}`;
    
    return [base, variantCls, sizeCls, props.className]
      .filter(Boolean).join(" ");
  }, [context.variant, context.size, props.className]);

  // React Aria integration
  const { buttonProps } = useButton({
    isPressed: context.open,
    onPress: () => context.setOpen(!context.open)
  }, ref);

  return {
    triggerClasses,
    triggerProps: mergeProps(buttonProps, props),
    Comp: props.as || "button"
  };
}
```

## 🎨 Sistema de Estilos

### Integración con tw-theme Plugin
- Los componentes consumen clases CSS del plugin `@ownui/tw-theme`
- El plugin genera archivos CSS en `src/components/` (ej: `button.css`)
- Las clases siguen el patrón: `.component-base .component-variant .component-size`

### Convenciones de Clases CSS:
- **Base**: `.component-name` (ej: `.btn`)
- **Variantes**: `.component-variant` (ej: `.btn-primary`, `.btn-secondary`)
- **Tamaños**: `.component-size` (ej: `.btn-sm`, `.btn-md`, `.btn-lg`)
- **Estados**: `.component-state` (ej: `.btn-disabled`, `.btn-active`)

### Variables CSS Personalizadas:
```css
.component-name {
  --component-color: var(--color-primary);
  --component-bg: var(--component-color);
  --component-fg: var(--color-primary-content);
  /* Variables específicas del componente */
}
```

## 📝 Diseño de Tipado TypeScript

### Patrón de Uniones Discriminadas
```tsx
// Base props comunes
interface ComponentBaseProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  className?: string;
  disabled?: boolean;
}

// Props específicas por elemento
export interface ComponentAsElementProps
  extends ComponentBaseProps,
    ElementHTMLAttributes<HTMLElementType> {
  as?: "element";
}

export interface ComponentAsOtherProps
  extends ComponentBaseProps,
    OtherHTMLAttributes<HTMLOtherType> {
  as: "other";
  requiredProp: string;
  disabled?: never; // Si no aplica
}

// Unión discriminada principal
export type ComponentProps = ComponentAsElementProps | ComponentAsOtherProps;
```

### Tipos Requeridos:
- **Variants**: Union types que coincidan con clases CSS
- **Sizes**: Union types para tamaños disponibles
- **As Props**: Soporte polimórfico con discriminación de tipos
- **HTML Attributes**: Herencia correcta de atributos nativos

## 🧪 Estrategia de Pruebas

### Estructura de Tests
```tsx
describe('ComponentName', () => {
  // Renderizado básico
  test('renders correctly with default props', () => {});
  
  // Variantes y props
  test('applies variant classes correctly', () => {});
  test('applies size classes correctly', () => {});
  
  // Accesibilidad
  test('has correct ARIA attributes', () => {});
  test('supports keyboard navigation', () => {});
  
  // Polimorfismo
  test('renders as different elements', () => {});
  
  // Estados
  test('handles disabled state', () => {});
  
  // Eventos
  test('handles click events', () => {});
  
  // Refs
  test('forwards ref correctly', () => {});
});
```

### Herramientas de Testing:
- **Jest + React Testing Library**: Pruebas unitarias
- **User Events**: Simulación de interacciones
- **Accessibility Testing**: `@testing-library/jest-dom`

## ⚡ Optimización de Performance

### Técnicas Requeridas:
1. **React.memo**: Envolver el componente exportado
2. **useMemo**: Para cálculos de clases CSS y objetos complejos
3. **useCallback**: Para funciones que se pasan como props
4. **forwardRef**: Para forwarding de refs sin re-renders

### Ejemplo de Optimización:
```tsx
const ComponentName = React.memo(forwardRef<HTMLElement, ComponentProps>(
  function ComponentName(props, ref) {
    // Lógica del componente
    return <Comp {...optimizedProps} />;
  }
));
```

## ♿ Accesibilidad (A11Y)

### Integración con React Aria:
- **Obligatorio**: Usar hooks de `@react-aria/*` apropiados
- **Keyboard Navigation**: Soporte completo para navegación por teclado
- **Screen Readers**: Atributos ARIA correctos
- **Focus Management**: Manejo adecuado del foco

### Hooks React Aria Comunes:
- `useButton`: Para elementos interactivos tipo botón
- `useTextField`: Para inputs de texto
- `useSelect`: Para elementos de selección
- `useMenu`: Para menús desplegables
- `useDialog`: Para modales y diálogos

## 📚 Documentación con Storybook

### Estructura de Stories:
```tsx
const meta: Meta<ComponentProps> = {
  title: "Components/ComponentName",
  component: ComponentName,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["variant1", "variant2", "variant3"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<ComponentProps>;

// Stories requeridas
export const Default: Story = {};
export const AllVariants: Story = {};
export const AllSizes: Story = {};
export const Disabled: Story = {};
export const AsLink: Story = {}; // Si soporta polimorfismo
```

## 🔄 Flujo de Desarrollo

### Pasos de Implementación:
1. **Crear estructura de carpetas** siguiendo el patrón establecido
2. **Definir tipos TypeScript** con uniones discriminadas
3. **Implementar hook personalizado** con lógica y accesibilidad
4. **Crear componente principal** con forwardRef y memo
5. **Escribir pruebas unitarias** cubriendo todos los casos
6. **Documentar en Storybook** con todas las variantes
7. **Configurar build** con tsup y "use client" banner

### Comandos de Desarrollo:
```bash
# Crear nuevo componente
pnpm create-component ComponentName

# Ejecutar tests
pnpm test ComponentName

# Build del componente
pnpm build --filter=@ownui/component-name

# Storybook
pnpm storybook
```

## ✅ Checklist de Calidad

Antes de considerar completo un componente, verificar:

### Funcionalidad:
- [ ] Renderiza correctamente con props por defecto
- [ ] Todas las variantes funcionan
- [ ] Todos los tamaños funcionan
- [ ] Estados (disabled, active, etc.) funcionan
- [ ] Polimorfismo (as prop) funciona si aplica

### Arquitectura (si usa Provider Pattern):
- [ ] Provider Context implementado correctamente
- [ ] Hooks consumen contexto automáticamente
- [ ] Lógica controlada vs no controlada funciona
- [ ] Contexto optimizado con useCallback/useMemo
- [ ] Error handling para uso fuera del Provider
- [ ] Compound components exportados correctamente

### Accesibilidad:
- [ ] Integración con React Aria
- [ ] Navegación por teclado completa
- [ ] Atributos ARIA correctos
- [ ] Contraste de colores adecuado
- [ ] Soporte para lectores de pantalla

### Performance:
- [ ] React.memo implementado
- [ ] useMemo para cálculos costosos
- [ ] forwardRef correcto
- [ ] Bundle size optimizado

### Testing:
- [ ] Cobertura de tests > 90%
- [ ] Tests de accesibilidad
- [ ] Tests de polimorfismo
- [ ] Tests de eventos

### Documentación:
- [ ] Stories de Storybook completas
- [ ] Comentarios JSDoc en tipos
- [ ] Ejemplos de uso en README
- [ ] Props documentadas

### Build:
- [ ] Builds sin errores
- [ ] Types generados correctamente
- [ ] CSS importado correctamente
- [ ] "use client" banner incluido

## 📋 Plantilla de Componente

Usar esta plantilla como punto de partida para nuevos componentes:

```tsx
// ComponentName.tsx
import React, { forwardRef } from "react";
import useComponentName from "./useComponentName";
import { ComponentNameProps } from "./ComponentName.types";

const ComponentName = forwardRef<HTMLElement, ComponentNameProps>(
  function ComponentName(props, ref) {
    const { children } = props;
    const { classNames, componentProps, Comp } = useComponentName(props, ref);

    return (
      <Comp ref={ref} className={classNames} {...componentProps}>
        {children}
      </Comp>
    );
  }
);

export default React.memo(ComponentName);
```

## 🎯 Guía de Decisión de Patrones

### Cuándo usar Patrón de Composición Simple:
- **Componentes simples**: Button, Input, Avatar, Badge
- **Sin estado compartido**: Cada instancia es independiente
- **Props directas**: No hay jerarquía compleja de subcomponentes
- **Ejemplo**: `<Button variant="primary">Click me</Button>`

### Cuándo usar Patrón Provider:
- **Componentes compound**: Dropdown, Modal, Tabs, Accordion
- **Estado compartido**: Múltiples subcomponentes que comparten estado
- **Configuración global**: Props que afectan a todos los subcomponentes
- **Evitar prop drilling**: Más de 2 niveles de profundidad
- **Ejemplo**: 
```tsx
<Dropdown variant="primary">
  <Dropdown.Trigger>Menu</Dropdown.Trigger>
  <Dropdown.Menu>
    <Dropdown.Item>Option 1</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
```

### Criterios de Decisión:
| Criterio | Composición Simple | Provider Pattern |
|----------|-------------------|------------------|
| Subcomponentes | 0-1 | 3+ |
| Estado compartido | ❌ | ✅ |
| Prop drilling | No aplica | ✅ Evita |
| Complejidad | Baja | Media-Alta |
| Ejemplos | Button, Input | Dropdown, Modal |

Esta guía asegura consistencia, calidad y mantenibilidad en todos los componentes de la librería Own UI.
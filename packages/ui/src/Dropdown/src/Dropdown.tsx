// Dropdown.tsx
import React, { forwardRef, useMemo } from "react";
import { mergeRefs } from "@react-aria/utils";
import { DropdownProvider } from "./DropdownContext";
import { useDropdown, useDropdownTrigger, useDropdownMenu, useDropdownItem } from "./useDropdown";
import {
  DropdownProps,
  DropdownDOMProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
} from "./Dropdown.types";

/** El contenedor recibe los atributos de DOM del root, más los hijos. */
type DropdownContainerProps = DropdownDOMProps & { children: React.ReactNode };

/**
 * Componente Dropdown principal que actúa como contenedor y provider del contexto.
 *
 * Separa **explícitamente** las props de configuración (las que alimentan el
 * contexto) de las props de DOM (las que van al `<div>`). Antes hacía
 * `{...props}` sobre los dos, así que `variant`, `size`, `styleVariant`,
 * `defaultOpen`, `open` y `onOpenChange` acababan como atributos del HTML y
 * React avisaba por cada uno (`AGENTS.md` §9.8). El `...domProps` de aquí es
 * seguro por construcción: lo que no se desestructura arriba es, por el tipo,
 * un atributo de `<div>`.
 */
const DropdownRoot = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(props, ref) {
  const { children, variant, size, styleVariant, defaultOpen, open, onOpenChange, ...domProps } =
    props;

  return (
    <DropdownProvider
      variant={variant}
      size={size}
      styleVariant={styleVariant}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownContainer ref={ref} {...domProps}>
        {children}
      </DropdownContainer>
    </DropdownProvider>
  );
});

/**
 * Contenedor interno del dropdown que consume el contexto para generar clases.
 */
const DropdownContainer = forwardRef<HTMLDivElement, DropdownContainerProps>(
  function DropdownContainer({ children, className, ...domProps }, ref) {
    const { dropdownClasses, wrapperRef } = useDropdown({ className });

    // El wrapper lleva dos refs: la que expone el consumidor y la del
    // contexto, que es la que usa el click-outside para saber si un click
    // cayó dentro o fuera del componente.
    const mergedRef = useMemo(() => mergeRefs(ref, wrapperRef), [ref, wrapperRef]);

    return (
      <div ref={mergedRef} className={dropdownClasses} {...domProps}>
        {children}
      </div>
    );
  }
);

/**
 * Componente trigger del dropdown.
 * Se conecta automáticamente al contexto del dropdown padre.
 */
const DropdownTrigger = forwardRef<HTMLButtonElement | HTMLDivElement, DropdownTriggerProps>(
  function DropdownTrigger(props, ref) {
    const { children } = props;
    const { triggerClasses, triggerProps, triggerRef, Comp } = useDropdownTrigger(props, ref);

    return (
      <Comp ref={triggerRef} className={triggerClasses} {...triggerProps}>
        {children}
      </Comp>
    );
  }
);

/**
 * Componente menú del dropdown.
 * Se conecta automáticamente al contexto del dropdown padre.
 */
const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  function DropdownMenu(props, ref) {
    const { children } = props;
    const { menuClasses, menuProps, menuRef } = useDropdownMenu(props);

    const mergedRef = useMemo(() => mergeRefs(ref, menuRef), [ref, menuRef]);

    /**
     * El menú **se queda montado** cuando está cerrado.
     *
     * Antes devolvía `null`, y eso hacía que la transición de apertura que
     * define `dropdown.css` no se viera nunca: el panel aparecía ya montado
     * en su estado final, y al cerrarse desaparecía de golpe sin animar. Era
     * el gap G-01 del lote 6.
     *
     * Montado y cerrado **no** significa accesible: `useDropdownMenu` le pone
     * `aria-hidden` e `inert`, así que queda fuera del árbol de
     * accesibilidad y fuera del alcance del foco y del puntero, y el CSS lo
     * oculta con `visibility: hidden` (que, a diferencia de `display: none`,
     * sí es animable).
     */
    return (
      <div ref={mergedRef} className={menuClasses} {...menuProps}>
        {children}
      </div>
    );
  }
);

/**
 * Componente para un elemento individual del dropdown.
 * Se conecta automáticamente al contexto del dropdown padre.
 */
const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  function DropdownItem(props, ref) {
    const { children } = props;
    const { itemProps, itemClasses } = useDropdownItem(props);

    return (
      <div ref={ref} className={itemClasses} {...itemProps}>
        {children}
      </div>
    );
  }
);

// Memoizar componentes para prevenir renders innecesarios
const MemoizedDropdown = React.memo(DropdownRoot);
const MemoizedDropdownTrigger = React.memo(DropdownTrigger);
const MemoizedDropdownMenu = React.memo(DropdownMenu);
const MemoizedDropdownItem = React.memo(DropdownItem);

// Tipo para el componente compuesto
interface DropdownCompoundComponent extends React.NamedExoticComponent<
  DropdownProps & React.RefAttributes<HTMLDivElement>
> {
  Trigger: typeof MemoizedDropdownTrigger;
  Menu: typeof MemoizedDropdownMenu;
  Item: typeof MemoizedDropdownItem;
}

// Crear el componente compuesto
const Dropdown = MemoizedDropdown as DropdownCompoundComponent;
Dropdown.Trigger = MemoizedDropdownTrigger;
Dropdown.Menu = MemoizedDropdownMenu;
Dropdown.Item = MemoizedDropdownItem;

export default Dropdown;
export {
  MemoizedDropdownTrigger as DropdownTrigger,
  MemoizedDropdownMenu as DropdownMenu,
  MemoizedDropdownItem as DropdownItem,
};

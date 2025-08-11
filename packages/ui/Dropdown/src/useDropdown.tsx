// useDropdown.tsx
import { useMemo, useCallback, RefObject, Ref, useRef, useImperativeHandle } from "react";
import { useButton } from "@react-aria/button";
import { mergeProps } from "@react-aria/utils";
import { useDropdownContext } from "./DropdownContext";
import { 
  DropdownProps, 
  DropdownTriggerProps, 
  DropdownMenuProps,
  DropdownItemProps
} from "./Dropdown.types";

export type ReactRef<T> = RefObject<T> | Ref<T>;

// Hook local para manejar DOM refs (equivalente al useDOMRef)
const useDOMRef = <T extends HTMLElement>(ref: ReactRef<T | null>) => {
  const innerRef = useRef<T>(null);
  useImperativeHandle(ref, () => innerRef.current as T);
  return innerRef;
};

/**
 * Hook principal del dropdown para generar clases CSS del contenedor.
 * El estado ahora se maneja en el DropdownProvider.
 * 
 * @param props - Props del componente Dropdown raíz
 * @returns Clases CSS para el contenedor
 */
export function useDropdown(props: DropdownProps): {
  dropdownClasses: string;
} {
  const { 
    className = ""
  } = props;

  // Obtener estado del contexto
  const { open, variant, size, styleVariant } = useDropdownContext();

  // Generar clases CSS para el contenedor dropdown
  const dropdownClasses = useMemo(() => {
    const base = "dropdown";
    const variantClass = variant ? `dropdown-${variant}` : "";
    const sizeClass = size ? `dropdown-${size}` : "";
    const styleClass = styleVariant ? `dropdown-${styleVariant}` : "";
    const openClass = open ? "dropdown-open" : "";
    
    return [base, variantClass, sizeClass, styleClass, openClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [variant, size, styleVariant, open, className]);

  return { dropdownClasses };
}

/**
 * Hook para el trigger del dropdown.
 * Integra react-aria para accesibilidad y obtiene el contexto automáticamente.
 * 
 * @param props - Props del DropdownTrigger
 * @param ref - Ref del elemento trigger
 * @returns Props y clases para el trigger
 */
export function useDropdownTrigger(
  props: DropdownTriggerProps,
  ref: ReactRef<HTMLButtonElement | HTMLDivElement | null>
): { 
  triggerClasses: string; 
  triggerProps: any; 
  Comp: string;
} {
  const { 
    as = "button",
    className = "", 
    onClick,
    children,
    ...restProps 
  } = props;

  // Obtener estado del contexto automáticamente
  const { open, setOpen } = useDropdownContext();

  // Generar clases CSS para el trigger
  const triggerClasses = useMemo(() => {
    const base = "dropdown-trigger";
    const activeClass = open ? "dropdown-trigger-active" : "";
    
    return [base, activeClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [open, className]);

  // Configurar React Aria para accesibilidad
  const innerRef = useDOMRef(ref);
  
  const handlePress = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const ariaOptions = {
    onPress: handlePress,
    elementType: as,
  };

  const { buttonProps: ariaProps } = useButton(ariaOptions, innerRef);

  // Combinar handlers de click
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (onClick) {
      onClick(event as any);
    }
  }, [onClick]);

  // Props combinadas para el trigger
  const triggerProps = mergeProps(
    ariaProps,
    {
      "aria-expanded": open,
      "aria-haspopup": "menu",
      onClick: handleClick,
    },
    restProps
  );

  const Comp = as;
  
  return { triggerClasses, triggerProps, Comp };
}

/**
 * Hook para el menú del dropdown.
 * Obtiene el contexto automáticamente.
 * 
 * @param props - Props del DropdownMenu
 * @returns Props y clases para el menú
 */
export function useDropdownMenu(
  props: DropdownMenuProps
): { 
  menuClasses: string; 
  menuProps: any;
  isVisible: boolean;
} {
  const { className = "", ...restProps } = props;
  
  // Obtener estado del contexto automáticamente
  const { open, size, variant, styleVariant } = useDropdownContext();

  // Generar clases CSS para el menú
  const menuClasses = useMemo(() => {
    const base = "dropdown-menu";
    const variantClass = variant ? `dropdown-menu-${variant}` : "";
    const sizeClass = size ? `dropdown-menu-${size}` : "";
    const styleClass = styleVariant ? `dropdown-menu-${styleVariant}` : "";
    const visibleClass = open ? "dropdown-menu-open" : "dropdown-menu-closed";
    
    return [base, variantClass, sizeClass, styleClass, visibleClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [variant, size, styleVariant, open, className]);

  // Props para el menú
  const menuProps = {
    ...restProps,
    role: "menu",
    "aria-hidden": !open,
  };

  return { menuClasses, menuProps, isVisible: open };
}

/**
 * Hook que encapsula la lógica de estilos para los elementos del dropdown.
 * Obtiene el contexto automáticamente.
 * 
 * @param props - Props del DropdownItem
 * @returns Objeto con las clases CSS y props del elemento
 */
export function useDropdownItem(
  props: DropdownItemProps
) {
  const { 
    children, 
    selected = false, 
    disabled = false, 
    className = "", 
    onSelect,
    onClick,
    ...restProps 
  } = props;

  // Obtener estado del contexto automáticamente
  const { setOpen } = useDropdownContext();

  // Generar clases CSS para el elemento del dropdown
  const itemClasses = useMemo(() => {
    const base = "dropdown-item";
    const selectedClass = selected ? "dropdown-item-selected" : "";
    const disabledClass = disabled ? "dropdown-item-disabled" : "";
    
    return [base, selectedClass, disabledClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [selected, disabled, className]);

  // Combinar handlers de click
  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    if (onSelect) {
      onSelect();
    }
    
    // Cerrar el dropdown después de seleccionar un item
    setOpen(false);
    
    if (onClick) {
      onClick(event);
    }
  }, [disabled, onSelect, setOpen, onClick]);

  // Props combinadas para el elemento
  const itemProps = {
    ...restProps,
    className: itemClasses,
    onClick: handleClick,
    role: "menuitem",
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled,
    "aria-selected": selected,
  };

  return { itemProps, children };
}

// Dropdown.tsx
import React, { forwardRef } from "react";
import { DropdownProvider } from "./DropdownContext";
import { 
  useDropdown, 
  useDropdownTrigger, 
  useDropdownMenu, 
  useDropdownItem 
} from "./useDropdown";
import { 
  DropdownProps, 
  DropdownTriggerProps, 
  DropdownMenuProps,
  DropdownItemProps
} from "./Dropdown.types";

/**
 * Componente Dropdown principal que actúa como contenedor y provider del contexto.
 * Ahora usa el DropdownProvider para manejar el estado.
 */
const DropdownRoot = forwardRef<HTMLDivElement, DropdownProps>(
  function Dropdown(props, ref) {
    const { children, ...contextProps } = props;
    
    return (
      <DropdownProvider {...contextProps}>
        <DropdownContainer ref={ref} {...props}>
          {children}
        </DropdownContainer>
      </DropdownProvider>
    );
  }
);

/**
 * Contenedor interno del dropdown que consume el contexto para generar clases.
 */
const DropdownContainer = forwardRef<HTMLDivElement, DropdownProps>(
  function DropdownContainer(props, ref) {
    const { children, ...restProps } = props;
    const { dropdownClasses } = useDropdown(props);

    return (
      <div 
        ref={ref} 
        className={dropdownClasses}
        {...restProps}
      >
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
    const { triggerClasses, triggerProps, Comp } = useDropdownTrigger(props, ref);

    return (
      <Comp ref={ref} className={triggerClasses} {...triggerProps}>
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
    const { menuClasses, menuProps, isVisible } = useDropdownMenu(props);

    // Solo renderizar el menú si está visible
    if (!isVisible) {
      return null;
    }

    return (
      <div ref={ref} className={menuClasses} {...menuProps}>
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
    const { itemProps } = useDropdownItem(props);

    return (
      <div ref={ref} {...itemProps}>
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
interface DropdownCompoundComponent extends React.NamedExoticComponent<DropdownProps & React.RefAttributes<HTMLDivElement>> {
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
  MemoizedDropdownItem as DropdownItem 
};

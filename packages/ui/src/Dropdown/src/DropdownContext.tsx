// DropdownContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DropdownContextValue, DropdownProps } from "./Dropdown.types";

/**
 * Contexto del Dropdown para compartir estado entre componentes hijos.
 */
const DropdownContext = createContext<DropdownContextValue | null>(null);

/**
 * Hook para acceder al contexto del Dropdown.
 * Lanza error si se usa fuera del provider.
 */
export function useDropdownContext(): DropdownContextValue {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Los componentes de Dropdown deben usarse dentro de <Dropdown>');
  }
  return context;
}

/**
 * Props del provider del contexto.
 */
interface DropdownProviderProps {
  children: ReactNode;
  variant?: DropdownProps['variant'];
  size?: DropdownProps['size'];
  styleVariant?: DropdownProps['styleVariant'];
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Provider del contexto del Dropdown.
 * Maneja todo el estado interno y lo proporciona a los componentes hijos.
 */
export function DropdownProvider({
  children,
  variant,
  size = "md",
  styleVariant,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: DropdownProviderProps) {
  // Estado interno del dropdown
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  
  // Determinar si está controlado o no controlado
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Función para cambiar el estado
  const setOpen = useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  // Valor del contexto
  const contextValue: DropdownContextValue = {
    open,
    setOpen,
    variant,
    size,
    styleVariant
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      {children}
    </DropdownContext.Provider>
  );
}

export { DropdownContext };

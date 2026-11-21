// DropdownContext.tsx
import { createContext, useContext, useState, useCallback, useRef, useId, ReactNode } from "react";
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
    throw new Error("Los componentes de Dropdown deben usarse dentro de <Dropdown>");
  }
  return context;
}

/**
 * Props del provider del contexto.
 */
interface DropdownProviderProps {
  children: ReactNode;
  variant?: DropdownProps["variant"];
  size?: DropdownProps["size"];
  styleVariant?: DropdownProps["styleVariant"];
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Provider del contexto del Dropdown.
 * Maneja todo el estado interno y lo proporciona a los componentes hijos.
 *
 * Desde el lote 7 también es el dueño de la **identidad** (los `id` que
 * enlazan trigger y menú) y de las **refs** que el teclado necesita para
 * mover el foco. Viven aquí y no en los hooks porque los comparten tres
 * subcomponentes: el trigger necesita el `id` del menú para su
 * `aria-controls`, el menú necesita el del trigger para su `aria-labelledby`,
 * y el cierre con `Esc` necesita la ref del trigger para devolverle el foco.
 */
export function DropdownProvider({
  children,
  variant,
  size = "md",
  styleVariant,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: DropdownProviderProps) {
  // Estado interno del dropdown
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  // Identidad estable para enlazar trigger y menú por ARIA.
  // `useId` da un valor único por instancia y estable entre servidor y
  // cliente, que es lo que hace falta para hidratar sin desajustes.
  const reactId = useId();
  const menuId = `${reactId}-menu`;
  const triggerId = `${reactId}-trigger`;

  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Determinar si está controlado o no controlado
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  /**
   * Cambia el estado de apertura.
   *
   * `returnFocus` existe porque no todos los cierres son iguales: al cerrar
   * con `Esc` o al seleccionar un item el foco tiene que volver al trigger
   * (si no, se queda en un elemento que acaba de desaparecer y el lector de
   * pantalla pierde el sitio), pero al cerrar por un click fuera **no**:
   * ahí el usuario está yendo a otra parte y robarle el foco es hostil.
   */
  const setOpen = useCallback(
    (newOpen: boolean, options?: { returnFocus?: boolean }) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);

      if (!newOpen && options?.returnFocus) {
        triggerRef.current?.focus();
      }
    },
    [isControlled, onOpenChange]
  );

  // Valor del contexto
  const contextValue: DropdownContextValue = {
    open,
    setOpen,
    variant,
    size,
    styleVariant,
    menuId,
    triggerId,
    triggerRef,
    menuRef,
    wrapperRef,
  };

  return <DropdownContext.Provider value={contextValue}>{children}</DropdownContext.Provider>;
}

export { DropdownContext };

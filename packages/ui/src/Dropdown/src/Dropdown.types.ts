// Dropdown.types.ts
import { HTMLAttributes, ReactNode, ButtonHTMLAttributes, RefObject } from "react";

/**
 * Variantes semánticas permitidas para el dropdown (coinciden con las clases CSS definidas).
 */
export type DropdownVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/**
 * Tamaños permitidos para el dropdown (coinciden con las clases CSS definidas).
 */
export type DropdownSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Variantes de estilo para el dropdown.
 */
export type DropdownStyleVariant = "ghost" | "bordered" | "compact";

/**
 * Props principales del componente Dropdown (contenedor raíz).
 */
export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Variante semántica del dropdown.
   */
  variant?: DropdownVariant;
  /**
   * Tamaño del dropdown.
   */
  size?: DropdownSize;
  /**
   * Variante de estilo del dropdown.
   */
  styleVariant?: DropdownStyleVariant;
  /**
   * Contenido del dropdown (trigger + menu).
   */
  children: ReactNode;
  /**
   * Clases CSS adicionales.
   */
  className?: string;
  /**
   * Si el dropdown está abierto por defecto.
   */
  defaultOpen?: boolean;
  /**
   * Si el dropdown está abierto (controlado).
   */
  open?: boolean;
  /**
   * Callback cuando el estado de apertura cambia.
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Props del trigger del dropdown.
 */
export interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Contenido del trigger.
   */
  children: ReactNode;
  /**
   * Clases CSS adicionales.
   */
  className?: string;
  /**
   * Elemento polimórfico para el trigger.
   */
  as?: "button" | "div";
}

/**
 * Props del menú del dropdown.
 */
export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Contenido del menú (elementos DropdownItem).
   */
  children: ReactNode;
  /**
   * Clases CSS adicionales.
   */
  className?: string;
}

/**
 * Props para un elemento individual del dropdown.
 */
export interface DropdownItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Contenido del elemento del dropdown.
   */
  children: ReactNode;
  /**
   * Si el elemento está seleccionado.
   */
  selected?: boolean;
  /**
   * Si el elemento está deshabilitado.
   */
  disabled?: boolean;
  /**
   * Clases CSS adicionales.
   */
  className?: string;
  /**
   * Callback cuando se hace clic en el elemento.
   */
  onSelect?: () => void;
}

/**
 * Props de configuración del Dropdown: las que alimentan el contexto y que
 * **nunca** deben llegar al `<div>` del contenedor.
 *
 * Existe como tipo propio para que separar `contextProps` de `domProps` sea
 * una operación tipada y no un rest spread a ciegas, que era el bug del
 * lote 7 (`AGENTS.md` §9.8): `variant`, `size`, `defaultOpen`... acababan
 * como atributos inválidos en el HTML servido.
 */
export type DropdownConfigPropNames =
  | "variant"
  | "size"
  | "styleVariant"
  | "defaultOpen"
  | "open"
  | "onOpenChange";

/**
 * Props del contenedor que sí son atributos DOM válidos.
 */
export type DropdownDOMProps = Omit<DropdownProps, DropdownConfigPropNames | "children">;

/**
 * Contexto del Dropdown para compartir estado entre componentes.
 */
export interface DropdownContextValue {
  /**
   * Si el dropdown está abierto.
   */
  open: boolean;
  /**
   * Función para cambiar el estado de apertura.
   *
   * @param open - Nuevo estado.
   * @param options.returnFocus - Si al cerrar hay que devolver el foco al
   *   trigger. Verdadero para `Esc` y para la selección de un item; falso
   *   para un click fuera, donde robar el foco sería hostil.
   */
  setOpen: (open: boolean, options?: { returnFocus?: boolean }) => void;
  /**
   * Variante del dropdown.
   */
  variant?: DropdownVariant;
  /**
   * Tamaño del dropdown.
   */
  size?: DropdownSize;
  /**
   * Variante de estilo del dropdown.
   */
  styleVariant?: DropdownStyleVariant;
  /**
   * `id` del menú, generado con `useId`. Enlaza `aria-controls` del trigger
   * con el panel.
   */
  menuId: string;
  /**
   * `id` del trigger, para el `aria-labelledby` del menú.
   */
  triggerId: string;
  /**
   * Ref al elemento del trigger, para devolverle el foco al cerrar.
   */
  triggerRef: RefObject<HTMLElement | null>;
  /**
   * Ref al elemento del menú, para mover el foco entre sus items.
   */
  menuRef: RefObject<HTMLDivElement | null>;
  /**
   * Ref al wrapper, para distinguir un click dentro de uno fuera.
   */
  wrapperRef: RefObject<HTMLDivElement | null>;
}

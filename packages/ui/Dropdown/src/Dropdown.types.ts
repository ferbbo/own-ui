// Dropdown.types.ts
import {
  HTMLAttributes,
  ReactNode,
  ButtonHTMLAttributes,
} from "react";

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
 * Contexto del Dropdown para compartir estado entre componentes.
 */
export interface DropdownContextValue {
  /**
   * Si el dropdown está abierto.
   */
  open: boolean;
  /**
   * Función para cambiar el estado de apertura.
   */
  setOpen: (open: boolean) => void;
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
}

// Switch.types.ts
import { InputHTMLAttributes, ReactNode } from "react";

/** Roles semanticos. Cada valor tiene entrada en `theme` de `variants/switch.ts`. */
export type SwitchTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Tamanos del control. */
export type SwitchSize = "xs" | "sm" | "md" | "lg" | "xl";

type ManagedAttributes =
  | "size"
  | "type"
  | "checked"
  | "defaultChecked"
  | "value"
  | "onChange"
  | "disabled"
  | "readOnly"
  | "className"
  | "children";

export interface SwitchBaseProps {
  theme?: SwitchTheme;
  size?: SwitchSize;

  /** Texto junto al control. */
  children?: ReactNode;

  /** Encendido (controlado). */
  checked?: boolean;
  /** Estado inicial del control no controlado. */
  defaultChecked?: boolean;
  /** Cambio de estado. Recibe el **valor**, no el evento. */
  onChange?: (checked: boolean) => void;

  /** Valor que envia el formulario. */
  value?: string;
  name?: string;

  disabled?: boolean;
  readOnly?: boolean;
  /** Marca el control como invalido: `aria-invalid` + contorno de error. */
  invalid?: boolean;

  /** Clases adicionales para el `<label>` contenedor. */
  className?: string;
  /** Clases adicionales para la pista (`.switch`). */
  boxClassName?: string;
}

/**
 * No hay `indeterminate` y no hay grupo, y las dos ausencias son
 * deliberadas:
 *
 * - "encendido a medias" no significa nada en un interruptor;
 * - un grupo de switches no es un control compuesto, son N ajustes
 *   independientes con efecto inmediato. Si lo que hace falta es elegir
 *   entre opciones, eso es un `CheckboxGroup` o un `RadioGroup`.
 */
export type SwitchProps = SwitchBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, ManagedAttributes>;

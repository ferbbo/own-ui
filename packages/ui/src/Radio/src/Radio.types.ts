// Radio.types.ts
import { InputHTMLAttributes, ReactNode } from "react";

/** Roles semanticos. Cada valor tiene entrada en `theme` de `variants/radio.ts`. */
export type RadioTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Tamanos del control. */
export type RadioSize = "xs" | "sm" | "md" | "lg" | "xl";

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

export interface RadioBaseProps {
  /**
   * Valor de la opcion. **Obligatorio**: es lo que el grupo guarda, y sin el
   * la opcion no se puede seleccionar ni distinguir de sus hermanas.
   */
  value: string;
  /** Texto de la opcion. */
  children?: ReactNode;

  /** Rol y tamano. Por defecto los hereda del grupo. */
  theme?: RadioTheme;
  size?: RadioSize;

  /** Deshabilita solo esta opcion. El grupo puede deshabilitarlas todas. */
  disabled?: boolean;

  /** Clases adicionales para el `<label>` contenedor. */
  className?: string;
  /** Clases adicionales para el circulo (`.radio`). */
  boxClassName?: string;
}

export type RadioProps = RadioBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, ManagedAttributes>;

/**
 * Props del grupo.
 *
 * El grupo es el componente de verdad: un radio suelto no existe como
 * control, porque "elegir una entre varias" necesita las varias. El estado,
 * la etiqueta, la ayuda y el error viven aqui.
 */
export interface RadioGroupProps {
  /** Etiqueta del grupo. Es su nombre accesible. */
  label?: ReactNode;
  /** Texto de ayuda. Se enlaza con `aria-describedby`. */
  description?: ReactNode;
  /** Mensaje de error. **Solo se muestra si `invalid`**. */
  errorMessage?: ReactNode;
  invalid?: boolean;

  /** Valor elegido (controlado). */
  value?: string;
  /** Valor elegido inicial (no controlado). */
  defaultValue?: string;
  onChange?: (value: string) => void;

  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Obliga a elegir una opcion antes de enviar. */
  required?: boolean;

  /** Disposicion de las opciones. */
  orientation?: "vertical" | "horizontal";

  /** Rol y tamano que heredan las opciones. */
  theme?: RadioTheme;
  size?: RadioSize;

  className?: string;
  children: ReactNode;
}

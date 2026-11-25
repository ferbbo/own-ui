// Checkbox.types.ts
import { InputHTMLAttributes, ReactNode } from "react";

/** Roles semanticos. Cada valor tiene entrada en `theme` de `variants/checkbox.ts`. */
export type CheckboxTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Tamanos del control. */
export type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Atributos nativos que el componente gestiona y no se pueden pasar a mano. */
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

export interface CheckboxBaseProps {
  theme?: CheckboxTheme;
  size?: CheckboxSize;

  /** Texto de la opcion. */
  children?: ReactNode;

  /** Estado marcado (controlado). */
  checked?: boolean;
  /** Estado inicial del control no controlado. */
  defaultChecked?: boolean;
  /**
   * Tercer estado: ni marcado ni sin marcar.
   *
   * No es un atributo HTML, sino una propiedad del elemento en el DOM, asi
   * que el CSS lo pinta por clase. Es el estado de una casilla "seleccionar
   * todo" cuando solo algunas de sus hijas estan marcadas.
   */
  indeterminate?: boolean;
  /** Cambio de estado. Recibe el **valor**, no el evento. */
  onChange?: (checked: boolean) => void;

  /** Valor que envia el formulario y que identifica la opcion en un grupo. */
  value?: string;
  /** Nombre del campo en el formulario. */
  name?: string;

  disabled?: boolean;
  readOnly?: boolean;
  /** Marca el control como invalido: `aria-invalid` + marco de error. */
  invalid?: boolean;

  /** Clases adicionales para el `<label>` contenedor. */
  className?: string;
  /** Clases adicionales para la caja (`.checkbox`). */
  boxClassName?: string;
}

export type CheckboxProps = CheckboxBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, ManagedAttributes>;

/**
 * Props del grupo.
 *
 * El grupo es el que lleva etiqueta, ayuda y error, no cada casilla: un
 * mensaje de error por opcion no dice nada, y el nombre accesible de una
 * eleccion multiple es la pregunta, no cada respuesta.
 */
export interface CheckboxGroupProps {
  /** Etiqueta del grupo. Es su nombre accesible. */
  label?: ReactNode;
  /** Texto de ayuda. Se enlaza con `aria-describedby`. */
  description?: ReactNode;
  /** Mensaje de error. **Solo se muestra si `invalid`**. */
  errorMessage?: ReactNode;
  invalid?: boolean;

  /** Valores marcados (controlado). */
  value?: string[];
  /** Valores marcados iniciales (no controlado). */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;

  name?: string;
  disabled?: boolean;
  readOnly?: boolean;

  /** Rol y tamano que heredan las casillas del grupo. */
  theme?: CheckboxTheme;
  size?: CheckboxSize;

  className?: string;
  children: ReactNode;
}

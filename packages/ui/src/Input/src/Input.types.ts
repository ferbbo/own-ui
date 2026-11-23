// Input.types.ts
import { InputHTMLAttributes, ReactNode } from "react";

/**
 * Roles semánticos del Input. Cada valor tiene entrada en `theme` de
 * `variants/input.ts` (lo verifica `pnpm check:contract`).
 *
 * El rol **no pinta el relleno**: colorea el borde y el anillo de foco. Un
 * campo de texto con fondo de rol es ilegible en cuanto lleva contenido. Ver
 * la anatomía al principio de `css/input.css`.
 */
export type InputTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Tratamiento del marco. Omitirlo es la caja rellena por defecto. */
export type InputVariant = "outline" | "ghost" | "bordered";

/** Tamaños del Input. */
export type InputSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Tipos de `<input>` admitidos.
 *
 * Es una lista cerrada a propósito: `checkbox`, `radio` y `file` tienen su
 * propio modelo de interacción y de accesibilidad y son lotes aparte (L11),
 * así que dejarlos pasar aquí prometería algo que este componente no hace.
 */
export type InputType = "text" | "email" | "password" | "number" | "search" | "tel" | "url";

/** Props propias del Input (las que no son atributos del DOM). */
export interface InputBaseProps {
  /** Rol semántico del borde y del anillo de foco. */
  theme?: InputTheme;
  /** Tratamiento del marco. */
  variant?: InputVariant;
  /** Tamaño. */
  size?: InputSize;
  /** Tipo del control nativo. */
  type?: InputType;

  /**
   * Etiqueta visible. Es la forma recomendada de nombrar el campo: React Aria
   * enlaza `<label for>` con el `id` del control.
   *
   * Sin `label` hace falta `aria-label` o `aria-labelledby`; un campo sin
   * nombre accesible no es anunciable.
   */
  label?: ReactNode;
  /** Texto de ayuda bajo el campo. Se enlaza con `aria-describedby`. */
  description?: ReactNode;
  /**
   * Mensaje de error. **Sólo se muestra si `invalid` es cierto**: un error
   * visible en un campo que el navegador considera válido es ruido, y
   * desacoplar las dos cosas deja el `aria-invalid` mintiendo.
   */
  errorMessage?: ReactNode;
  /** Marca el campo como inválido: `aria-invalid` + rol `error`. */
  invalid?: boolean;

  /** Adorno al principio de la caja (no recibe eventos). */
  startIcon?: ReactNode;
  /** Adorno al final de la caja (no recibe eventos). */
  endIcon?: ReactNode;

  /** Clases CSS adicionales para la caja (`.input`). */
  className?: string;
  /** Clases CSS adicionales para el contenedor (`.input-field`). */
  fieldClassName?: string;

  disabled?: boolean;
  readOnly?: boolean;

  /** Valor controlado. */
  value?: string;
  /** Valor inicial del campo no controlado. */
  defaultValue?: string;
  /** Cambio de valor. Recibe el **valor**, no el evento. */
  onChange?: (value: string) => void;
}

/**
 * Atributos nativos de `<input>` que el componente gestiona por su cuenta y
 * que por tanto no se pueden pasar a mano.
 *
 * `size` es el caso interesante: en HTML es el ancho en caracteres y es un
 * `number`, y aquí es el tamaño del control. Dejar que coexistan daría un
 * tipo `string | number` imposible de usar.
 */
type ManagedAttributes =
  | "size"
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "disabled"
  | "readOnly"
  | "className"
  | "children";

export type InputProps = InputBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, ManagedAttributes>;

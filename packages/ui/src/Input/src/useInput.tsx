// useInput.tsx
import { ReactNode, useMemo } from "react";
import { useTextField } from "@react-aria/textfield";
import { useDOMRef } from "@ownui/dom-utils";
import { input } from "@ownui/tw-theme/variants";
import { InputProps } from "./Input.types";

export type ReactRef<T> = React.RefObject<T> | React.Ref<T>;

type ElementProps = Record<string, unknown>;

export interface UseInputResult {
  /** Clases del contenedor en columna. */
  fieldClassNames: string;
  /** Clases de la caja (borde, relleno, altura, foco). */
  boxClassNames: string;
  /** Props del `<label>`; `null` si no hay etiqueta. */
  labelProps: ElementProps | null;
  /** Props del `<input>` nativo, ya con clase. */
  controlProps: ElementProps;
  /** Props del texto de ayuda; `null` si no se muestra. */
  descriptionProps: ElementProps | null;
  /** Props del mensaje de error; `null` si no se muestra. */
  errorMessageProps: ElementProps | null;
  /** Ref que hay que montar en el `<input>`. */
  domRef: React.RefObject<HTMLInputElement | null>;
  label: ReactNode;
  description: ReactNode;
  errorMessage: ReactNode;
  startIcon: ReactNode;
  endIcon: ReactNode;
}

/**
 * Toda la lógica del Input: clases, accesibilidad y reparto de props entre
 * los cuatro nodos del campo.
 *
 * Sigue los 5 pasos de `AGENTS.md` §5.2. La particularidad frente a
 * `useButton` es que `useTextField` devuelve **cuatro** bolsas de props a la
 * vez (`labelProps`, `inputProps`, `descriptionProps`, `errorMessageProps`)
 * porque es quien genera y enlaza los `id`. Por eso el campo entero —label,
 * caja, ayuda y error— lo monta este componente y no un `<Field>` externo:
 * un contenedor aparte tendría que recibir hacia arriba unos props que React
 * sólo sabe pasar hacia abajo. Ver la decisión D-02 de `specs/lote-10.md`.
 */
export function useInput(
  props: InputProps,
  ref: ReactRef<HTMLInputElement | null>
): UseInputResult {
  // 1) Destructuring con defaults. TODA prop de configuración sale aquí: lo
  //    que quede en `restProps` va al DOM tal cual.
  const {
    theme = "neutral",
    variant,
    size = "md",
    type = "text",
    label,
    description,
    errorMessage,
    invalid = false,
    startIcon,
    endIcon,
    className = "",
    fieldClassName = "",
    disabled = false,
    readOnly = false,
    value,
    defaultValue,
    onChange,
    ...restProps
  } = props;

  /** El error sólo existe si el campo está marcado como inválido. */
  const visibleError = invalid ? errorMessage : undefined;

  // 2) Clases memoizadas.
  //    El tamaño se aplica **dos veces**, en el contenedor y en la caja, y es
  //    intencionado: las clases de tamaño definen `--input-fontsize`, y el
  //    `<label>` y el texto de ayuda son hermanos de la caja, no hijos, así
  //    que no heredarían el token si sólo viviera en ella.
  const sizeCls = input.size[size] || "";

  const fieldClassNames = useMemo(
    () =>
      [input.part.field, sizeCls, fieldClassName]
        .filter((part) => part && part.length > 0)
        .join(" ")
        .trim(),
    [sizeCls, fieldClassName]
  );

  const boxClassNames = useMemo(() => {
    const themeCls = input.theme[theme] || "";
    const variantCls = variant ? input.variant[variant] || "" : "";
    const invalidCls = invalid ? input.state.invalid : "";
    const readOnlyCls = readOnly ? input.state.readOnly : "";
    const disabledCls = disabled ? input.state.disabled : "";

    return [
      input.part.box,
      themeCls,
      variantCls,
      sizeCls,
      invalidCls,
      readOnlyCls,
      disabledCls,
      className,
    ]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, variant, sizeCls, invalid, readOnly, disabled, className]);

  // 3) Ref que React Aria necesita y que el componente tiene que montar.
  const domRef = useDOMRef<HTMLInputElement>(ref);

  // 4) React Aria: genera los `id`, enlaza `<label for>`, compone
  //    `aria-describedby` con la ayuda y el error, y pone `aria-invalid`.
  const {
    labelProps: ariaLabelProps,
    inputProps: ariaInputProps,
    descriptionProps: ariaDescriptionProps,
    errorMessageProps: ariaErrorMessageProps,
  } = useTextField(
    {
      ...(restProps as Record<string, never>),
      type,
      label: typeof label === "string" ? label : undefined,
      description,
      errorMessage: visibleError,
      isDisabled: disabled,
      isReadOnly: readOnly,
      isInvalid: invalid,
      value,
      defaultValue,
      onChange,
      // Sin etiqueta visible, React Aria avisa por consola salvo que haya
      // `aria-label` o `aria-labelledby`; el aviso es correcto y se deja.
      "aria-label": restProps["aria-label"],
      "aria-labelledby": restProps["aria-labelledby"],
    },
    domRef as React.RefObject<HTMLInputElement>
  );

  // 5) Mezclar con lo nativo. `restProps` ya fue a React Aria, que devuelve
  //    los atributos del DOM que correspondan, así que no se vuelve a
  //    esparcir: hacerlo duplicaría handlers.
  const controlProps: ElementProps = {
    ...ariaInputProps,
    className: input.part.control,
  };

  return {
    fieldClassNames,
    boxClassNames,
    labelProps: label ? { ...ariaLabelProps, className: input.part.label } : null,
    controlProps,
    descriptionProps: description
      ? { ...ariaDescriptionProps, className: input.part.description }
      : null,
    errorMessageProps: visibleError
      ? { ...ariaErrorMessageProps, className: input.part.errorMessage }
      : null,
    domRef,
    label,
    description,
    errorMessage: visibleError,
    startIcon,
    endIcon,
  };
}

export default useInput;

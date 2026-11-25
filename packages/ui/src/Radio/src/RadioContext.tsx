// RadioContext.tsx
import { createContext, useContext } from "react";
import type { RadioGroupState } from "@react-stately/radio";
import type { RadioSize, RadioTheme } from "./Radio.types";

export interface RadioGroupContextValue {
  state: RadioGroupState;
  theme?: RadioTheme;
  size?: RadioSize;
  invalid?: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/**
 * Lee el contexto del grupo y **lanza** si no hay.
 *
 * Al reves que el Checkbox, aqui el fallo rapido es lo correcto: un radio
 * suelto no es un caso legitimo sino un control imposible. Sin grupo no hay
 * estado compartido, asi que no habria nada que deseleccionar al elegir otra
 * opcion, y el usuario se quedaria con dos radios marcados y sin forma de
 * volver atras. Mejor un error en desarrollo que eso en produccion.
 */
export function useRadioGroupContext(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error("<Radio> tiene que estar dentro de un <RadioGroup>.");
  }

  return context;
}

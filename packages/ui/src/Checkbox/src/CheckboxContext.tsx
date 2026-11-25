// CheckboxContext.tsx
import { createContext, useContext } from "react";
import type { CheckboxGroupState } from "@react-stately/checkbox";
import type { CheckboxSize, CheckboxTheme } from "./Checkbox.types";

export interface CheckboxGroupContextValue {
  state: CheckboxGroupState;
  theme?: CheckboxTheme;
  size?: CheckboxSize;
  invalid?: boolean;
}

/**
 * Contexto del grupo de casillas.
 *
 * El valor por defecto es `null` y **no** se lanza al consumirlo fuera del
 * provider, a diferencia de `useDropdownContext`: una casilla suelta es un
 * caso legitimo y frecuente, no un error de uso. Lo que decide el contexto es
 * de donde sale el estado, no si el componente puede existir.
 */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}

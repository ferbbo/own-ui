// AvatarGroupContext.tsx
import { createContext, useContext } from "react";
import { AvatarGroupContextValue } from "./Avatar.types";

/**
 * Configuración que un `Avatar.Group` comparte con sus avatares: tamaño y
 * forma.
 *
 * Es contexto y no `cloneElement` porque el grupo no conoce a sus hijos: con
 * `cloneElement` habría que inspeccionar cada nodo, decidir si es un Avatar y
 * reescribir sus props, y cualquier envoltorio intermedio (un `<Tooltip>`
 * alrededor de un avatar, lo normal en una lista de miembros) rompería la
 * cadena. Con contexto, el avatar lee la configuración esté donde esté.
 *
 * `null` es un valor legítimo: significa "no hay grupo", y entonces el avatar
 * usa sus propios defaults. Por eso **no** lanza error fuera del provider, al
 * contrario que `useDropdownContext`: aquí el contexto es configuración
 * opcional, no un requisito de funcionamiento.
 */
export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export function useAvatarGroupContext(): AvatarGroupContextValue | null {
  return useContext(AvatarGroupContext);
}

export default AvatarGroupContext;

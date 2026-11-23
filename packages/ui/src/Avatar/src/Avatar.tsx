// Avatar.tsx
import React, { Children, forwardRef, useMemo } from "react";
import { avatar } from "@ownui/tw-theme/variants";
import useAvatar from "./useAvatar";
import { AvatarGroupProps, AvatarProps } from "./Avatar.types";
import { AvatarGroupContext } from "./AvatarGroupContext";

/**
 * Icono de reserva: una silueta genérica. Va aquí y no en el CSS (como
 * `background-image`) porque un SVG inline hereda `currentColor` y escala con
 * la caja sin un segundo juego de tokens.
 */
function FallbackIcon() {
  return (
    <svg className={avatar.part.fallback} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 12.5a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" />
      <path d="M12 14.25c-4 0-7.25 2.3-7.25 5.13 0 .34.28.62.63.62h13.24c.35 0 .63-.28.63-.62 0-2.83-3.25-5.13-7.25-5.13Z" />
    </svg>
  );
}

/**
 * Cáscara de render: la cascada de contenido, las clases y la accesibilidad
 * viven en `useAvatar`.
 *
 * El contenido se resuelve en este orden: **imagen → hijos → iniciales →
 * icono de reserva**. Si la imagen falla al cargar, el avatar vuelve a entrar
 * en la cascada por el escalón siguiente en vez de dejar el hueco de una
 * imagen rota.
 */
const AvatarRoot = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  const { classNames, avatarProps, kind, imageProps, initials, children } = useAvatar(props);

  return (
    <span ref={ref} className={classNames} {...avatarProps}>
      {kind === "image" ? <img {...imageProps} /> : null}
      {kind === "children" ? children : null}
      {kind === "initials" ? <span className={avatar.part.initials}>{initials}</span> : null}
      {kind === "fallback" ? <FallbackIcon /> : null}
    </span>
  );
});

/**
 * Fila de avatares solapados.
 *
 * `max` recorta la lista y resume el resto en un contador `+N`. `total`
 * permite dar el número real cuando los `children` son sólo los que se han
 * cargado (una lista paginada de 50 miembros con 4 avatares).
 *
 * El tamaño y la forma viajan por contexto, no por `cloneElement`: un avatar
 * envuelto en un tooltip —lo normal en una lista de miembros— seguiría
 * heredándolos. Ver `AvatarGroupContext`.
 */
const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { children, className = "", max, total, size, shape, theme = "neutral", ...restProps },
  ref
) {
  const items = Children.toArray(children);
  const visible = max !== undefined && max > 0 ? items.slice(0, max) : items;
  const hiddenHere = items.length - visible.length;
  /** Lo que no se ve: lo que se recortó aquí más lo que nunca llegó. */
  const hidden = hiddenHere + Math.max(0, (total ?? items.length) - items.length);

  const context = useMemo(() => ({ size, shape }), [size, shape]);

  return (
    <AvatarGroupContext.Provider value={context}>
      <span
        ref={ref}
        className={[avatar.part.group, className].filter(Boolean).join(" ")}
        {...restProps}
      >
        {visible}
        {hidden > 0 ? (
          <AvatarRoot theme={theme} initials={`+${hidden}`} aria-label={`${hidden} más`} />
        ) : null}
      </span>
    </AvatarGroupContext.Provider>
  );
});

const MemoizedAvatar = React.memo(AvatarRoot);
const MemoizedAvatarGroup = React.memo(AvatarGroup);

/**
 * El compound se ensambla con un cast, como el Dropdown (`AGENTS.md` §5.3).
 */
interface AvatarCompoundComponent
  extends React.NamedExoticComponent<AvatarProps & React.RefAttributes<HTMLSpanElement>> {
  Group: typeof MemoizedAvatarGroup;
}

const Avatar = MemoizedAvatar as AvatarCompoundComponent;
Avatar.Group = MemoizedAvatarGroup;

export default Avatar;
export { MemoizedAvatarGroup as AvatarGroup };

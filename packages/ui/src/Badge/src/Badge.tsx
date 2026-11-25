// Badge.tsx
import React, { forwardRef } from "react";
import useBadge from "./useBadge";
import { BadgeProps } from "./Badge.types";

/**
 * Cáscara de render: la lógica (clases, atributos, contenido) vive en
 * `useBadge`.
 *
 * Sale siempre como `<span>`: ver la nota de `BadgeProps` sobre por qué no es
 * polimórfico.
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { classNames, badgeProps, content } = useBadge(props);

  return (
    <span ref={ref} className={classNames} {...badgeProps}>
      {content}
    </span>
  );
});

export default React.memo(Badge);

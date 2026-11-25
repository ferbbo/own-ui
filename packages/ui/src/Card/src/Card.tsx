// Card.tsx
import React, { forwardRef } from "react";
import { card } from "@ownui/tw-theme/variants";
import useCard from "./useCard";
import {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from "./Card.types";

/**
 * Une clases sin dejar espacios sueltos. Las partes del card no tienen
 * variantes, así que no necesitan el `useMemo` del hook: su única clase es la
 * del contrato más la que traiga el consumidor.
 */
const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(" ");

/**
 * Cáscara de render: la lógica (clases, elemento, atributos) vive en
 * `useCard`.
 *
 * El card es un **compound estático**: `Card.Header`, `Card.Title`,
 * `Card.Body` y `Card.Footer` no comparten estado con el root y por eso no hay
 * Provider ni contexto (ver D-03 de `specs/lote-12.md`). El tamaño y el rol
 * viajan por la cascada de CSS —las partes leen `--card-p`, `--card-gap` y
 * `--card-color` del contenedor—, que es justo lo que este sistema de theming
 * existe para hacer.
 *
 *     <Card theme="info" variant="elevated" size="lg">
 *       <Card.Header><Card.Title as="h2">Título</Card.Title></Card.Header>
 *       <Card.Body>Contenido</Card.Body>
 *       <Card.Footer><Button>Acción</Button></Card.Footer>
 *     </Card>
 */
const CardRoot = forwardRef<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement, CardProps>(
  function Card(props, ref) {
    const { children } = props;
    const { classNames, cardProps, Comp } = useCard(props);

    return (
      <Comp ref={ref} className={classNames} {...cardProps}>
        {children}
      </Comp>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, children, ...restProps },
  ref
) {
  return (
    <div ref={ref} className={join(card.part.header, className)} {...restProps}>
      {children}
    </div>
  );
});

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as: Comp = "h3", className, children, ...restProps },
  ref
) {
  return (
    <Comp ref={ref} className={join(card.part.title, className)} {...restProps}>
      {children}
    </Comp>
  );
});

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, children, ...restProps },
  ref
) {
  return (
    <div ref={ref} className={join(card.part.body, className)} {...restProps}>
      {children}
    </div>
  );
});

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, children, ...restProps },
  ref
) {
  return (
    <div ref={ref} className={join(card.part.footer, className)} {...restProps}>
      {children}
    </div>
  );
});

const MemoizedCard = React.memo(CardRoot);
const MemoizedCardHeader = React.memo(CardHeader);
const MemoizedCardTitle = React.memo(CardTitle);
const MemoizedCardBody = React.memo(CardBody);
const MemoizedCardFooter = React.memo(CardFooter);

/**
 * El compound se ensambla con un cast, no con `Object.assign`: es el patrón
 * que ya usa el Dropdown (`AGENTS.md` §5.3) y el que conserva los tipos de
 * cada subcomponente.
 */
interface CardCompoundComponent
  extends React.NamedExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement>
  > {
  Header: typeof MemoizedCardHeader;
  Title: typeof MemoizedCardTitle;
  Body: typeof MemoizedCardBody;
  Footer: typeof MemoizedCardFooter;
}

const Card = MemoizedCard as CardCompoundComponent;
Card.Header = MemoizedCardHeader;
Card.Title = MemoizedCardTitle;
Card.Body = MemoizedCardBody;
Card.Footer = MemoizedCardFooter;

export default Card;
export {
  MemoizedCardHeader as CardHeader,
  MemoizedCardTitle as CardTitle,
  MemoizedCardBody as CardBody,
  MemoizedCardFooter as CardFooter,
};

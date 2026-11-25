import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Avatar from "../src/Avatar";
import { initialsFromName } from "../src/useAvatar";
import { avatar } from "@ownui/tw-theme/variants";

/**
 * Tests del Avatar (lote 12).
 *
 * Comportamiento observable: qué nodo sale al DOM en cada escalón de la
 * cascada de contenido, qué anuncia un lector de pantalla y qué clases emite.
 * `pnpm check:contract` ya garantiza que esas clases existen en
 * `css/avatar.css`.
 */
describe("Avatar", () => {
  describe("contrato de clases", () => {
    it("aplica la clase base y los defaults (neutral, circle, md)", () => {
      const { container } = render(<Avatar name="Ada Lovelace" />);
      const root = container.querySelector(`.${avatar.part.root}`);

      expect(root?.tagName).toBe("SPAN");
      expect(root).toHaveClass(avatar.theme.neutral);
      expect(root).toHaveClass(avatar.shape.circle);
      expect(root).toHaveClass(avatar.size.md);
    });

    it.each(Object.entries(avatar.theme))("aplica la clase del rol %s", (theme, expected) => {
      render(<Avatar name="Ada" theme={theme as keyof typeof avatar.theme} />);
      expect(screen.getByRole("img", { name: "Ada" })).toHaveClass(expected);
    });

    it.each(Object.entries(avatar.shape))("aplica la clase de la forma %s", (shape, expected) => {
      render(<Avatar name="Ada" shape={shape as keyof typeof avatar.shape} />);
      expect(screen.getByRole("img", { name: "Ada" })).toHaveClass(expected);
    });

    it.each(Object.entries(avatar.size))("aplica la clase del tamaño %s", (size, expected) => {
      render(<Avatar name="Ada" size={size as keyof typeof avatar.size} />);
      expect(screen.getByRole("img", { name: "Ada" })).toHaveClass(expected);
    });

    it("conserva las clases del consumidor y no filtra props al DOM", () => {
      render(<Avatar name="Ada" className="extra" theme="info" shape="square" size="lg" />);
      const root = screen.getByRole("img", { name: "Ada" });

      expect(root).toHaveClass(avatar.part.root);
      expect(root).toHaveClass("extra");
      for (const attr of ["theme", "shape", "size", "name", "initials", "src"]) {
        expect(root).not.toHaveAttribute(attr);
      }
    });
  });

  describe("cascada de contenido", () => {
    it("con `src` pinta la imagen, y el `alt` cae al nombre", () => {
      render(<Avatar src="/ada.png" name="Ada Lovelace" />);
      const image = screen.getByRole("img", { name: "Ada Lovelace" });

      expect(image.tagName).toBe("IMG");
      expect(image).toHaveClass(avatar.part.image);
      expect(image).toHaveAttribute("src", "/ada.png");
      // La caja no añade un segundo nombre: dos nombres anidados se anuncian
      // dos veces.
      expect(image.parentElement).not.toHaveAttribute("role", "img");
      expect(image.parentElement).not.toHaveAttribute("aria-label");
    });

    it("`alt` explícito gana sobre el nombre", () => {
      render(<Avatar src="/ada.png" name="Ada Lovelace" alt="Retrato de Ada" />);
      expect(screen.getByAltText("Retrato de Ada")).toBeInTheDocument();
    });

    it("sin imagen pinta las iniciales derivadas del nombre", () => {
      render(<Avatar name="Ada Lovelace" />);
      const root = screen.getByRole("img", { name: "Ada Lovelace" });

      expect(root.querySelector(`.${avatar.part.initials}`)).toHaveTextContent("AL");
    });

    it("las iniciales explícitas ganan sobre el nombre", () => {
      render(<Avatar name="Ada Lovelace" initials="ADA" />);
      expect(
        screen.getByRole("img", { name: "Ada Lovelace" }).querySelector(`.${avatar.part.initials}`)
      ).toHaveTextContent("ADA");
    });

    it("los hijos ganan sobre las iniciales, pero no sobre la imagen", () => {
      const { rerender } = render(
        <Avatar name="Ada Lovelace">
          <span data-testid="propio">★</span>
        </Avatar>
      );

      expect(screen.getByTestId("propio")).toBeInTheDocument();
      expect(screen.queryByText("AL")).not.toBeInTheDocument();

      rerender(
        <Avatar name="Ada Lovelace" src="/ada.png">
          <span data-testid="propio">★</span>
        </Avatar>
      );

      expect(screen.queryByTestId("propio")).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Ada Lovelace" }).tagName).toBe("IMG");
    });

    it("sin imagen ni nombre pinta el icono de reserva", () => {
      const { container } = render(<Avatar aria-label="Sin datos" />);

      expect(container.querySelector(`.${avatar.part.fallback}`)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Sin datos" })).toBeInTheDocument();
    });
  });

  describe("imagen que falla", () => {
    it("cae a las iniciales cuando `onError` se dispara", () => {
      render(<Avatar src="/roto.png" name="Ada Lovelace" />);
      const image = screen.getByRole("img", { name: "Ada Lovelace" });

      fireEvent.error(image);

      const root = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(root.tagName).toBe("SPAN");
      expect(root.querySelector(`.${avatar.part.initials}`)).toHaveTextContent("AL");
      expect(root.querySelector("img")).not.toBeInTheDocument();
    });

    it("cae al icono de reserva si tampoco hay nombre", () => {
      const { container } = render(<Avatar src="/roto.png" aria-label="Sin datos" />);

      fireEvent.error(container.querySelector("img") as HTMLElement);

      expect(container.querySelector(`.${avatar.part.fallback}`)).toBeInTheDocument();
    });

    it("cambiar `src` vuelve a intentar la carga", () => {
      // Se guarda la url que falló, no un booleano: por eso no hace falta un
      // efecto que resetee el estado al cambiar de imagen.
      const { rerender, container } = render(<Avatar src="/roto.png" name="Ada Lovelace" />);

      fireEvent.error(container.querySelector("img") as HTMLElement);
      expect(container.querySelector("img")).not.toBeInTheDocument();

      rerender(<Avatar src="/otra.png" name="Ada Lovelace" />);
      expect(container.querySelector("img")).toHaveAttribute("src", "/otra.png");
    });
  });

  describe("accesibilidad", () => {
    it("sin nombre que dar, el avatar es decorativo", () => {
      const { container } = render(<Avatar />);
      const root = container.querySelector(`.${avatar.part.root}`);

      expect(root).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("`aria-labelledby` también cuenta como nombre", () => {
      render(
        <>
          <span id="quien">Ada Lovelace</span>
          <Avatar initials="AL" aria-labelledby="quien" />
        </>
      );

      expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
    });

    it("`aria-label` explícito gana sobre el nombre", () => {
      render(<Avatar name="Ada Lovelace" aria-label="Autora" />);
      expect(screen.getByRole("img", { name: "Autora" })).toBeInTheDocument();
    });
  });

  describe("initialsFromName", () => {
    it.each([
      ["Ada Lovelace", "AL"],
      ["ada lovelace", "AL"],
      ["Ada", "A"],
      ["  Ada   Byron   Lovelace ", "AB"],
      ["", ""],
      ["   ", ""],
      ["Ángela Ruiz", "ÁR"],
    ])("%s -> %s", (name, expected) => {
      expect(initialsFromName(name)).toBe(expected);
    });
  });

  describe("Avatar.Group", () => {
    const miembros = [
      <Avatar key="a" name="Ada Lovelace" />,
      <Avatar key="g" name="Grace Hopper" />,
      <Avatar key="t" name="Alan Turing" />,
      <Avatar key="k" name="Katherine Johnson" />,
    ];

    it("pinta todos los avatares y la clase del grupo", () => {
      const { container } = render(<Avatar.Group>{miembros}</Avatar.Group>);

      expect(container.querySelector(`.${avatar.part.group}`)).toBeInTheDocument();
      expect(container.querySelectorAll(`.${avatar.part.root}`)).toHaveLength(4);
    });

    it("`max` recorta y resume el resto en un contador", () => {
      render(<Avatar.Group max={2}>{miembros}</Avatar.Group>);

      expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Grace Hopper" })).toBeInTheDocument();
      expect(screen.queryByRole("img", { name: "Alan Turing" })).not.toBeInTheDocument();

      const contador = screen.getByRole("img", { name: "2 más" });
      expect(contador).toHaveTextContent("+2");
    });

    it("`total` cuenta también los que nunca llegaron", () => {
      // 50 miembros, 4 avatares cargados, 2 visibles: sobran 48.
      render(
        <Avatar.Group max={2} total={50}>
          {miembros}
        </Avatar.Group>
      );

      expect(screen.getByRole("img", { name: "48 más" })).toHaveTextContent("+48");
    });

    it("sin nada que resumir no hay contador", () => {
      render(<Avatar.Group max={4}>{miembros}</Avatar.Group>);

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it("`max` no positivo se ignora", () => {
      const { container } = render(<Avatar.Group max={0}>{miembros}</Avatar.Group>);

      expect(container.querySelectorAll(`.${avatar.part.root}`)).toHaveLength(4);
    });

    it("el tamaño y la forma del grupo los heredan los avatares", () => {
      render(
        <Avatar.Group size="xl" shape="square" max={1} total={3}>
          {miembros}
        </Avatar.Group>
      );

      const primero = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(primero).toHaveClass(avatar.size.xl);
      expect(primero).toHaveClass(avatar.shape.square);

      // También el contador, que es un avatar más.
      const contador = screen.getByRole("img", { name: "3 más" });
      expect(contador).toHaveClass(avatar.size.xl);
      expect(contador).toHaveClass(avatar.shape.square);
    });

    it("la prop del avatar gana sobre la del grupo", () => {
      render(
        <Avatar.Group size="xl">
          <Avatar name="Ada Lovelace" size="xs" />
        </Avatar.Group>
      );

      const node = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(node).toHaveClass(avatar.size.xs);
      expect(node).not.toHaveClass(avatar.size.xl);
    });

    it("un avatar envuelto sigue heredando del grupo", () => {
      // Es lo que el contexto compra frente a `cloneElement`.
      render(
        <Avatar.Group size="lg">
          <div>
            <Avatar name="Ada Lovelace" />
          </div>
        </Avatar.Group>
      );

      expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveClass(avatar.size.lg);
    });

    it("conserva las clases y los atributos del consumidor", () => {
      render(
        <Avatar.Group className="extra" data-testid="grupo" aria-label="Equipo">
          {miembros}
        </Avatar.Group>
      );
      const grupo = screen.getByTestId("grupo");

      expect(grupo).toHaveClass(avatar.part.group);
      expect(grupo).toHaveClass("extra");
      expect(grupo).toHaveAttribute("aria-label", "Equipo");
    });
  });

  describe("refs", () => {
    it("el avatar y el grupo exponen su nodo", () => {
      const ref = createRef<HTMLSpanElement>();
      const groupRef = createRef<HTMLSpanElement>();

      render(
        <Avatar.Group ref={groupRef}>
          <Avatar ref={ref} name="Ada Lovelace" />
        </Avatar.Group>
      );

      expect(ref.current).toHaveClass(avatar.part.root);
      expect(groupRef.current).toHaveClass(avatar.part.group);
    });
  });
});

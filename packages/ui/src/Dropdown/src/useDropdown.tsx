// useDropdown.tsx
import { useMemo, useCallback, useEffect, RefObject, Ref } from "react";
import { useButton } from "@react-aria/button";
import { mergeProps, mergeRefs } from "@react-aria/utils";
import { button } from "@ownui/tw-theme/variants";
import { useDropdownContext } from "./DropdownContext";
import { useDOMRef } from "@ownui/dom-utils";
import {
  DropdownProps,
  DropdownTriggerProps,
  DropdownMenuProps,
  DropdownItemProps,
} from "./Dropdown.types";

export type ReactRef<T> = RefObject<T> | Ref<T>;

/**
 * Items del menú que pueden recibir el foco, en orden de documento.
 *
 * Se consultan al DOM en el momento de pulsar la tecla en vez de mantener un
 * registro de refs: los items son hijos libres del compound y pueden
 * aparecer, desaparecer o reordenarse (la story `WithSelection` los genera
 * con un `map`), así que cualquier índice guardado se queda obsoleto. El DOM
 * es la única fuente que siempre está al día.
 *
 * Los deshabilitados se excluyen aquí, y por eso las flechas los saltan sin
 * lógica extra.
 */
const focusableItems = (menu: HTMLElement | null): HTMLElement[] =>
  menu
    ? Array.from(
        menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
      )
    : [];

// Hook local para manejar DOM refs (equivalente al useDOMRef)
/*const useDOMRef = <T extends HTMLElement>(ref: ReactRef<T | null>) => {
  const innerRef = useRef<T>(null);
  useImperativeHandle(ref, () => innerRef.current as T);
  return innerRef;
};*/

/**
 * Hook principal del dropdown para generar clases CSS del contenedor.
 * El estado ahora se maneja en el DropdownProvider.
 *
 * @param props - Props del componente Dropdown raíz
 * @returns Clases CSS para el contenedor
 */
export function useDropdown(props: Pick<DropdownProps, "className">): {
  dropdownClasses: string;
  wrapperRef: RefObject<HTMLDivElement | null>;
} {
  const { className = "" } = props;

  // Obtener estado del contexto
  const { open, variant, size, styleVariant, wrapperRef } = useDropdownContext();

  // Generar clases CSS para el contenedor dropdown
  const dropdownClasses = useMemo(() => {
    const base = "dropdown";
    const variantClass = variant ? `dropdown-${variant}` : "";
    const sizeClass = size ? `dropdown-${size}` : "";
    const styleClass = styleVariant ? `dropdown-${styleVariant}` : "";
    const openClass = open ? "dropdown-open" : "";

    return [base, variantClass, sizeClass, styleClass, openClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [variant, size, styleVariant, open, className]);

  return { dropdownClasses, wrapperRef };
}

/**
 * Hook para el trigger del dropdown.
 * Integra react-aria para accesibilidad y obtiene el contexto automáticamente.
 *
 * El trigger **es un `.btn`** (lote 6, D-08): emite
 * `btn btn-{rol} btn-{tamaño} dropdown-trigger` leyendo el contrato de
 * `@ownui/tw-theme/variants`, en vez de reimplementar superficie, altura,
 * hover y foco en `dropdown.css`. `dropdown-trigger` sólo aporta lo que el
 * botón no puede saber: ancho del wrapper y reparto horizontal.
 *
 * @param props - Props del DropdownTrigger
 * @param ref - Ref del elemento trigger
 * @returns Props y clases para el trigger
 */
export function useDropdownTrigger(
  props: DropdownTriggerProps,
  ref: ReactRef<HTMLButtonElement | HTMLDivElement | null>
): {
  triggerClasses: string;
  triggerProps: any;
  triggerRef: Ref<HTMLButtonElement | HTMLDivElement>;
  Comp: string;
} {
  const { as = "button", className = "", onClick, onKeyDown, children, ...restProps } = props;

  // Obtener estado del contexto automáticamente
  const {
    open,
    setOpen,
    variant,
    size,
    menuId,
    triggerId,
    triggerRef: contextTriggerRef,
    menuRef,
  } = useDropdownContext();

  // Generar clases CSS para el trigger: el rol y el tamaño salen del
  // contrato del Button, no de uno propio del Dropdown.
  const triggerClasses = useMemo(() => {
    const themeClass = variant ? button.theme[variant] : "";
    const sizeClass = size ? button.size[size] : "";
    const activeClass = open ? "dropdown-trigger-active" : "";

    return ["btn", themeClass, sizeClass, "dropdown-trigger", activeClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [variant, size, open, className]);

  // Configurar React Aria para accesibilidad
  const innerRef = useDOMRef(ref);

  /**
   * El trigger lleva tres refs y hay que montarlas todas en el mismo nodo:
   * la de `useDOMRef` (que React Aria necesita y que reexpone la del
   * consumidor) y la del contexto (que usa el retorno de foco al cerrar).
   *
   * Hasta el lote 7 el componente montaba la ref **forwarded** en vez de la
   * `innerRef` que este hook devuelve, así que `innerRef.current` era siempre
   * `null`: React Aria trabajaba sin nodo y la ref del consumidor resolvía a
   * `null`. `Button` tenía el mismo bug y lo arregló el lote 5 (devuelve
   * `domRef` y el componente lo monta); el Dropdown se había quedado atrás.
   */
  const triggerRef = useMemo(
    // El cast es por varianza, no por duda: el contexto guarda la ref como
    // `HTMLElement` porque el trigger es polimórfico (`button` o `div`), y el
    // nodo real siempre es uno de los dos.
    () => mergeRefs(innerRef, contextTriggerRef) as Ref<HTMLButtonElement | HTMLDivElement>,
    [innerRef, contextTriggerRef]
  );

  const handlePress = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const ariaOptions = {
    onPress: handlePress,
    elementType: as,
  };

  const { buttonProps: ariaProps } = useButton(ariaOptions, innerRef);

  // Combinar handlers de click
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
      if (onClick) {
        onClick(event as any);
      }
    },
    [onClick]
  );

  /**
   * `ArrowDown` / `ArrowUp` abren el menú desde el trigger, que es lo que
   * espera el patrón de menú de la APG: la flecha no sólo abre, también deja
   * el foco dentro (en el primer item o en el último). El foco inicial lo
   * resuelve `useDropdownMenu` al montarse; aquí sólo se abre.
   *
   * `Enter` y `Space` ya los cubre `useButton` de React Aria vía `onPress`.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        if (!open) {
          setOpen(true);
        } else {
          // Ya abierto: la flecha entra al menú.
          const items = focusableItems(menuRef.current);
          const target = event.key === "ArrowDown" ? items[0] : items[items.length - 1];
          target?.focus();
        }
      }

      onKeyDown?.(event as any);
    },
    [open, setOpen, menuRef, onKeyDown]
  );

  // Props combinadas para el trigger
  const triggerProps = mergeProps(
    ariaProps,
    {
      id: triggerId,
      "aria-expanded": open,
      "aria-haspopup": "menu",
      // Enlaza trigger y panel: sin esto, un lector de pantalla anuncia que
      // hay un menú pero no sabe cuál.
      "aria-controls": menuId,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    },
    restProps
  );

  const Comp = as;

  return { triggerClasses, triggerProps, triggerRef, Comp };
}

/**
 * Hook para el menú del dropdown.
 * Obtiene el contexto automáticamente.
 *
 * @param props - Props del DropdownMenu
 * @returns Props y clases para el menú
 */
export function useDropdownMenu(props: DropdownMenuProps): {
  menuClasses: string;
  menuProps: any;
  menuRef: RefObject<HTMLDivElement | null>;
  isVisible: boolean;
} {
  const { className = "", onKeyDown, ...restProps } = props;

  // Obtener estado del contexto automáticamente
  const { open, size, variant, styleVariant, menuId, triggerId, menuRef, wrapperRef, setOpen } =
    useDropdownContext();

  // Generar clases CSS para el menú
  const menuClasses = useMemo(() => {
    const base = "dropdown-menu";
    const variantClass = variant ? `dropdown-menu-${variant}` : "";
    const sizeClass = size ? `dropdown-menu-${size}` : "";
    const styleClass = styleVariant ? `dropdown-menu-${styleVariant}` : "";
    const visibleClass = open ? "dropdown-menu-open" : "dropdown-menu-closed";

    return [base, variantClass, sizeClass, styleClass, visibleClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [variant, size, styleVariant, open, className]);

  /**
   * Foco inicial al abrir: el item seleccionado si hay uno, el primero si no.
   *
   * Es obligatorio en el patrón de menú: el menú se abre con el foco dentro,
   * porque los items llevan `tabIndex={-1}` y sin esto no habría forma de
   * llegar a ellos con el teclado. El componente desmonta el menú al cerrar,
   * así que este efecto corre una vez por apertura.
   */
  useEffect(() => {
    if (!open) return;

    const items = focusableItems(menuRef.current);
    const selected = items.find((item) => item.getAttribute("aria-selected") === "true");

    (selected ?? items[0])?.focus();
  }, [open, menuRef]);

  /**
   * Click fuera: cierra sin devolver el foco al trigger.
   *
   * Se escucha `pointerdown` y no `click` para cerrar antes de que el
   * elemento de destino procese su propio click, y el listener **sólo existe
   * mientras está abierto**: registrarlo siempre sería pagar un listener de
   * documento por cada dropdown montado de la página.
   */
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent | MouseEvent) => {
      const target = event.target as Node | null;
      if (target && wrapperRef.current?.contains(target)) return;

      // Sin `returnFocus`: el usuario está yendo a otra parte de la página y
      // robarle el foco para devolverlo al trigger es hostil.
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, wrapperRef, setOpen]);

  /**
   * Teclado del menú (patrón de menú de la APG).
   *
   * Vive en el menú y no en cada item a propósito: los eventos de los items
   * burbujean hasta aquí, así que un único handler cubre toda la lista y no
   * hay que mantener índices ni un registro de refs.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const items = focusableItems(menuRef.current);
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      const focusAt = (index: number) => {
        const target = items[(index + items.length) % items.length];
        target?.focus();
      };

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focusAt(currentIndex + 1);
          break;

        case "ArrowUp":
          event.preventDefault();
          focusAt(currentIndex <= 0 ? items.length - 1 : currentIndex - 1);
          break;

        case "Home":
          event.preventDefault();
          items[0]?.focus();
          break;

        case "End":
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;

        case "Escape":
          event.preventDefault();
          // Con `returnFocus`: si no, el foco se queda en un elemento que
          // acaba de desmontarse y el lector de pantalla pierde el sitio.
          setOpen(false, { returnFocus: true });
          break;

        case "Tab":
          // Tab saca el foco del menú, así que el menú deja de tener sentido.
          // No se hace `preventDefault`: el usuario quiere ir al siguiente
          // elemento de la página, y ahí es donde debe acabar.
          setOpen(false);
          break;

        default:
          break;
      }

      onKeyDown?.(event);
    },
    [menuRef, setOpen, onKeyDown]
  );

  /**
   * Props del menú.
   *
   * El panel se queda montado al cerrarse (para que la transición de
   * apertura se vea), así que hay que retirarlo de verdad en vez de
   * confiar en que no se ve:
   *
   *   · `aria-hidden` lo saca del árbol de accesibilidad. Es además lo que
   *     hace que las consultas por rol de Testing Library no lo encuentren,
   *     igual que un lector de pantalla.
   *   · `inert` lo saca del alcance del foco y del puntero, incluido todo su
   *     subárbol. Sin esto, tabular podría aterrizar en un item de un menú
   *     cerrado: `visibility: hidden` lo evita en un navegador, pero depende
   *     del CSS, y el comportamiento no debe depender de que la hoja de
   *     estilos haya cargado.
   */
  const menuProps = {
    ...restProps,
    id: menuId,
    role: "menu",
    "aria-labelledby": triggerId,
    "aria-hidden": !open,
    inert: !open,
    onKeyDown: handleKeyDown,
  };

  return { menuClasses, menuProps, menuRef, isVisible: open };
}

/**
 * Hook que encapsula la lógica de estilos para los elementos del dropdown.
 * Obtiene el contexto automáticamente.
 *
 * @param props - Props del DropdownItem
 * @returns Objeto con las clases CSS y props del elemento
 */
export function useDropdownItem(props: DropdownItemProps): {
  itemProps: any;
  itemClasses: string;
  children: DropdownItemProps["children"];
} {
  const {
    children,
    selected = false,
    disabled = false,
    className = "",
    onSelect,
    onClick,
    onKeyDown,
    ...restProps
  } = props;

  // Obtener estado del contexto automáticamente
  const { setOpen } = useDropdownContext();

  // Generar clases CSS para el elemento del dropdown
  const itemClasses = useMemo(() => {
    const base = "dropdown-item";
    const selectedClass = selected ? "dropdown-item-selected" : "";
    const disabledClass = disabled ? "dropdown-item-disabled" : "";

    return [base, selectedClass, disabledClass, className]
      .filter((cls) => cls && cls.length > 0)
      .join(" ")
      .trim();
  }, [selected, disabled, className]);

  /**
   * Seleccionar: avisa, cierra y devuelve el foco al trigger.
   *
   * El `returnFocus` es el mismo caso que el de `Esc`: el menú se desmonta y
   * el item que tenía el foco desaparece con él.
   */
  const select = useCallback(() => {
    onSelect?.();
    setOpen(false, { returnFocus: true });
  }, [onSelect, setOpen]);

  // Combinar handlers de click
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      select();
      onClick?.(event);
    },
    [disabled, select, onClick]
  );

  /**
   * `Enter` y `Space` seleccionan.
   *
   * El resto de teclas no se tocan: burbujean al `onKeyDown` del menú, que es
   * quien lleva las flechas, `Home`/`End`, `Esc` y `Tab`.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        // `Space` haría scroll de la página si se dejara pasar.
        event.preventDefault();
        select();
      }

      onKeyDown?.(event);
    },
    [disabled, select, onKeyDown]
  );

  /**
   * Props del elemento. `className` se devuelve **aparte** (`itemClasses`),
   * como en los otros tres hooks: tenerlo dentro de `itemProps` obligaba al
   * componente a saber que ahí venía una clase y era la única excepción del
   * paquete.
   *
   * `tabIndex` es -1 en todos los items, incluidos los habilitados: en el
   * patrón de menú el único punto de entrada por `Tab` es el trigger, y
   * dentro del menú el foco se mueve con las flechas.
   */
  const itemProps = {
    ...restProps,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    role: "menuitem",
    tabIndex: -1,
    "aria-disabled": disabled,
    "aria-selected": selected,
  };

  return { itemProps, itemClasses, children };
}

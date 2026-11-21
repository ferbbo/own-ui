/**
 * Definiciones de tipos para funciones globales expuestas en los fixtures HTML
 * Esto permite que los tests de Playwright usen estas funciones sin errores de tipo.
 */

declare global {
  interface Window {
    /**
     * Obtiene el color de fondo computado de un elemento por su ID
     * @param id - ID del elemento
     * @returns Color RGB en formato "rgb(r, g, b)" o null si no existe
     */
    getElementBgColor(id: string): string | null;

    /**
     * Obtiene el color de texto computado de un elemento por su ID
     */
    getElementTextColor(id: string): string | null;

    /**
     * Obtiene el color de borde computado de un elemento por su ID
     */
    getElementBorderColor(id: string): string | null;

    /**
     * Obtiene el color de outline computado de un elemento por su ID
     */
    getElementOutlineColor(id: string): string | null;

    /**
     * Obtiene el valor de una variable CSS de un elemento
     * @param selector - Selector CSS del elemento
     * @param varName - Nombre de la variable CSS (ej: "--color-primary")
     * @returns Valor de la variable o null si no existe
     */
    getCSSVariable(selector: string, varName: string): string | null;

    /**
     * Obtiene cualquier propiedad computada de un elemento por su ID
     * @param id - ID del elemento
     * @param prop - Propiedad CSS (ej: "height", "border-radius", "display")
     * @returns Valor computado o null si el elemento no existe
     */
    getComputedProp(id: string, prop: string): string | null;

    /**
     * Rectangulo del elemento (`getBoundingClientRect`), para comprobar
     * posicionamiento: que el panel del dropdown flote bajo el trigger.
     */
    getRect(id: string): { top: number; left: number; width: number; height: number } | null;

    /**
     * Establece el tema actual usando data-theme
     */
    setTheme(theme: string | null): void;

    /**
     * Obtiene el tema actual
     */
    getTheme(): string;

    /**
     * Cambia entre temas rápidamente (para testing)
     */
    switchThemesRapidly(times: number): Promise<void>;

    /**
     * Verifica si existen variables del tema light
     */
    hasLightThemeVars(): boolean;

    /**
     * Verifica si existen variables del tema dark
     */
    hasDarkThemeVars(): boolean;

    /**
     * Obtiene todas las variables de tema de un selector
     */
    getAllThemeVars(selector: string): {
      primary: string;
      secondary: string;
      accent: string;
      neutral: string;
      info: string;
      success: string;
      warning: string;
      error: string;
    } | null;

    /**
     * Simula hover en un elemento
     */
    triggerHover(id: string): Promise<string | null>;

    /**
     * Luminancia relativa WCAG 2.1 de un color computado (`rgb(r, g, b)`).
     * @returns Valor entre 0 y 1, o null si el color no se pudo parsear
     */
    relativeLuminance(rgbString: string): number | null;

    /**
     * Ratio de contraste WCAG 2.1 entre dos colores computados.
     * @returns Ratio entre 1 y 21, o null si algun color no se pudo parsear
     */
    contrastRatio(fg: string, bg: string): number | null;
  }
}

export {};

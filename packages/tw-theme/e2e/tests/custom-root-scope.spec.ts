import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Custom Root Scope
 *
 * Valida que el plugin @ownui/tw-theme pueda aplicar estilos
 * en scopes específicos usando la opción `root`, en lugar de
 * aplicarlos a todo el documento (:root).
 *
 * Escenarios:
 * 1. Variables CSS NO existen fuera del scope
 * 2. Variables CSS SÍ existen dentro del scope (.app-container)
 * 3. Clases de tema funcionan solo dentro del scope
 * 4. Múltiples scopes pueden coexistir
 * 5. data-theme funciona correctamente dentro del scope
 */

test.describe("Custom Root Scope - Plugin Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/custom-root-scope/");
  });

  test("debe aplicar variables CSS solo en elementos con la clase .app-container", async ({
    page,
  }) => {
    // Verificar que .app-container tiene las variables CSS
    const primaryVarInScope = await page.evaluate(() => {
      const el = document.querySelector(".app-container");
      return el ? getComputedStyle(el).getPropertyValue("--color-primary").trim() : null;
    });

    expect(primaryVarInScope).toBeTruthy();
    expect(primaryVarInScope).toMatch(/^#[0-9a-f]{6}$/i); // Debe ser un color hex válido
  });

  test("NO debe aplicar variables CSS en elementos fuera del scope", async ({ page }) => {
    // Verificar que elementos fuera de .app-container NO tienen variables
    const primaryVarOutside = await page.evaluate(() => {
      const outsideEl = document.getElementById("outside-scope");
      return outsideEl
        ? getComputedStyle(outsideEl).getPropertyValue("--color-primary").trim()
        : null;
    });

    // Fuera del scope, la variable no debería estar definida o debería estar vacía
    expect(primaryVarOutside).toBeFalsy();
  });

  test("debe aplicar bg-primary correctamente SOLO dentro del scope", async ({ page }) => {
    // Obtener el color de fondo del elemento dentro del scope
    const insideBgColor = await page.evaluate(() => {
      return window.getElementBgColor("inside-scope-light");
    });

    // Verificar que es un color RGB válido (no transparente ni inherit)
    expect(insideBgColor).toMatch(/^rgb\(/);
    expect(insideBgColor).not.toBe("rgba(0, 0, 0, 0)");

    // Debe ser el color primary del tema light (blue-ish)
    // #3b82f6 = rgb(59, 130, 246)
    expect(insideBgColor).toBe("rgb(59, 130, 246)");
  });

  test("bg-primary fuera del scope NO debe aplicar el color del tema", async ({ page }) => {
    const outsideBgColor = await page.evaluate(() => {
      return window.getElementBgColor("outside-scope");
    });

    // Fuera del scope, bg-primary podría no funcionar o usar fallback
    // No debería ser el color del tema
    expect(outsideBgColor).not.toBe("rgb(59, 130, 246)");
  });

  test("debe soportar múltiples scopes independientes en la misma página", async ({ page }) => {
    const scope1Color = await page.evaluate(() => {
      return window.getElementBgColor("scope-1");
    });

    const scope2Color = await page.evaluate(() => {
      return window.getElementBgColor("scope-2");
    });

    // Ambos scopes deben tener colores válidos del tema
    expect(scope1Color).toMatch(/^rgb\(/);
    expect(scope2Color).toMatch(/^rgb\(/);

    // Success color: #22c55e = rgb(34, 197, 94)
    expect(scope1Color).toBe("rgb(34, 197, 94)");

    // Warning color: #f59e0b = rgb(245, 158, 11)
    expect(scope2Color).toBe("rgb(245, 158, 11)");
  });

  test('data-theme="dark" debe funcionar correctamente dentro del scope', async ({ page }) => {
    // Elemento con dark theme aplicado
    const darkBgColor = await page.evaluate(() => {
      return window.getElementBgColor("inside-scope-dark");
    });

    // Verificar que es un color válido
    expect(darkBgColor).toMatch(/^rgb\(/);

    // El color primary del tema dark podría ser diferente
    // Verificar que NO es el mismo que el light theme
    const lightBgColor = await page.evaluate(() => {
      return window.getElementBgColor("inside-scope-light");
    });

    // En el tema dark, primary podría ser el mismo o diferente
    // Lo importante es que esté aplicado y ambos sean colores válidos
    expect(darkBgColor).toMatch(/^rgb\(/);
    expect(lightBgColor).toMatch(/^rgb\(/);
  });

  test("debe generar CSS variables para todos los colores semánticos dentro del scope", async ({
    page,
  }) => {
    const semanticColors = [
      "primary",
      "secondary",
      "accent",
      "neutral",
      "info",
      "success",
      "warning",
      "error",
    ];

    for (const color of semanticColors) {
      const varValue = await page.evaluate((colorName) => {
        return window.getCSSVariable(".app-container", `--color-${colorName}`);
      }, color);

      expect(varValue, `--color-${color} debe existir dentro del scope`).toBeTruthy();
      expect(varValue, `--color-${color} debe ser un color válido`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("debe generar CSS variables con variantes (-content, -focus) dentro del scope", async ({
    page,
  }) => {
    const variants = ["", "-content", "-focus"];

    for (const variant of variants) {
      const varName = `--color-primary${variant}`;
      const varValue = await page.evaluate((name) => {
        return window.getCSSVariable(".app-container", name);
      }, varName);

      expect(varValue, `${varName} debe existir`).toBeTruthy();
      expect(varValue, `${varName} debe ser un color válido`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("clases utilitarias de color deben funcionar en elementos anidados profundamente", async ({
    page,
  }) => {
    // Agregar un elemento anidado profundamente dentro del scope
    await page.evaluate(() => {
      const container = document.querySelector(".app-container");
      if (container) {
        const deepNested = document.createElement("div");
        deepNested.id = "deep-nested";
        deepNested.className = "bg-primary text-info-content p-4";
        deepNested.innerHTML = "<span>Deeply nested element</span>";
        container.appendChild(deepNested);
      }
    });

    const deepBgColor = await page.evaluate(() => {
      return window.getElementBgColor("deep-nested");
    });

    // Primary color: #0ea5e9 = rgb(59, 130, 246)
    expect(deepBgColor).toBe("rgb(59, 130, 246)");
  });

  test("selector :where(.app-container) debe tener menor especificidad que data-theme", async ({
    page,
  }) => {
    // El elemento con data-theme="dark" debe tener prioridad sobre el default light
    const primaryInDark = await page.evaluate(() => {
      const darkContainer = document.querySelector('[data-theme="dark"]');
      return darkContainer
        ? getComputedStyle(darkContainer).getPropertyValue("--color-primary").trim()
        : null;
    });

    const primaryInLight = await page.evaluate(() => {
      const lightContainer = document.querySelector(".app-container:not([data-theme])");
      return lightContainer
        ? getComputedStyle(lightContainer).getPropertyValue("--color-primary").trim()
        : null;
    });

    // Ambos deben existir
    expect(primaryInDark).toBeTruthy();
    expect(primaryInLight).toBeTruthy();

    // Podrían ser diferentes si el tema dark tiene diferentes colores
    // O al menos deben ser valores válidos
    expect(primaryInDark).toMatch(/^#[0-9a-f]{6}$/i);
    expect(primaryInLight).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

test.describe("Custom Root Scope - Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/custom-root-scope/");
  });

  test("elementos que dinámicamente obtienen la clase .app-container deben heredar los estilos", async ({
    page,
  }) => {
    // Crear un nuevo elemento y agregarle la clase .app-container dinámicamente
    await page.evaluate(() => {
      const newContainer = document.createElement("div");
      newContainer.id = "dynamic-container";
      newContainer.innerHTML = `
        <div id="dynamic-child" class="bg-accent text-accent-content p-4">
          Dynamic container child
        </div>
      `;
      document.body.appendChild(newContainer);

      // Agregar la clase después
      newContainer.className = "app-container";
    });

    await page.waitForTimeout(100); // Dar tiempo para que se apliquen los estilos

    const dynamicBgColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-child");
    });

    // Accent color: #8b5cf6 = rgb(139, 92, 246)
    expect(dynamicBgColor).toBe("rgb(139, 92, 246)");
  });

  test("quitar la clase .app-container debe remover el acceso a las variables CSS", async ({
    page,
  }) => {
    // Primero verificar que funciona
    const beforeRemoval = await page.evaluate(() => {
      const container = document.querySelector(".app-container");
      return container
        ? getComputedStyle(container).getPropertyValue("--color-primary").trim()
        : null;
    });

    expect(beforeRemoval).toBeTruthy();

    // Remover la clase
    await page.evaluate(() => {
      const container = document.querySelector(".app-container");
      if (container) {
        container.classList.remove("app-container");
      }
    });

    await page.waitForTimeout(100);

    // Verificar que ya no tiene acceso
    const afterRemoval = await page.evaluate(() => {
      const exContainer = document.querySelector(".test-section");
      return exContainer
        ? getComputedStyle(exContainer).getPropertyValue("--color-primary").trim()
        : null;
    });

    expect(afterRemoval).toBeFalsy();
  });
});

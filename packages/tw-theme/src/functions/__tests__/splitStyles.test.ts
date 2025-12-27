import separateClassSelectorsFromStyles from "../splitStyles.ts";

describe("separateClassSelectorsFromStyles", () => {
  test("should correctly separate base class selector (.btn)", () => {
    const input = {
      ".btn": {
        display: "inline-flex",
        padding: "1rem",
      },
      ".btn-primary": {
        backgroundColor: "blue",
      },
    };

    const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(input);

    expect(classSelectors[".btn"]).toBeDefined();
    expect(classSelectors[".btn-primary"]).toBeDefined();
    expect(Object.keys(otherStyles)).toHaveLength(0);
  });

  test("should handle pseudo-classes correctly", () => {
    const input = {
      ".btn": { display: "block" },
      ".btn:hover": { backgroundColor: "red" },
      ".btn:focus-visible": { outline: "2px solid" },
      ".btn-primary:not(.btn-active)": { color: "white" },
    };

    const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(input);

    expect(Object.keys(classSelectors)).toHaveLength(4);
    expect(classSelectors[".btn"]).toBeDefined();
    expect(classSelectors[".btn:hover"]).toBeDefined();
    expect(classSelectors[".btn:focus-visible"]).toBeDefined();
    expect(classSelectors[".btn-primary:not(.btn-active)"]).toBeDefined();
    expect(Object.keys(otherStyles)).toHaveLength(0);
  });

  test("should separate non-class selectors to otherStyles", () => {
    const input = {
      ".btn": { display: "block" },
      ":root": { "--color-primary": "blue" },
      '[data-theme="dark"]': { "--color-primary": "lightblue" },
      "@media (min-width: 768px)": {
        ".btn": { fontSize: "1.5rem" },
      },
    };

    const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(input);

    expect(classSelectors[".btn"]).toBeDefined();
    expect(otherStyles[":root"]).toBeDefined();
    expect(otherStyles['[data-theme="dark"]']).toBeDefined();
    expect(otherStyles["@media (min-width: 768px)"]).toBeDefined();
  });

  test("should handle complex component class patterns", () => {
    const input = {
      ".dropdown": { position: "relative" },
      ".dropdown-content": { position: "absolute" },
      ".dropdown-menu": { display: "none" },
      ".dropdown-item:hover": { backgroundColor: "gray" },
      ".loader": { display: "inline-block" },
      ".loader-sm": { width: "1rem" },
    };

    const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(input);

    expect(Object.keys(classSelectors)).toHaveLength(6);
    expect(classSelectors[".dropdown"]).toBeDefined();
    expect(classSelectors[".dropdown-content"]).toBeDefined();
    expect(classSelectors[".dropdown-menu"]).toBeDefined();
    expect(classSelectors[".dropdown-item:hover"]).toBeDefined();
    expect(classSelectors[".loader"]).toBeDefined();
    expect(classSelectors[".loader-sm"]).toBeDefined();
    expect(Object.keys(otherStyles)).toHaveLength(0);
  });

  test("should handle underscore in class names", () => {
    const input = {
      ".my_component": { display: "block" },
      ".my_component-variant": { color: "red" },
      ".my_component_variant": { color: "blue" },
    };

    const { classSelectors } = separateClassSelectorsFromStyles(input);

    expect(classSelectors[".my_component"]).toBeDefined();
    expect(classSelectors[".my_component-variant"]).toBeDefined();
    expect(classSelectors[".my_component_variant"]).toBeDefined();
  });

  test("should handle single letter class names", () => {
    const input = {
      ".a": { display: "block" },
      ".b": { color: "red" },
      ".x-large": { fontSize: "2rem" },
    };

    const { classSelectors } = separateClassSelectorsFromStyles(input);

    expect(classSelectors[".a"]).toBeDefined();
    expect(classSelectors[".b"]).toBeDefined();
    expect(classSelectors[".x-large"]).toBeDefined();
  });

  test("regression test - ensure .btn is not sent to otherStyles", () => {
    const buttonStyles = {
      ".btn": {
        display: "inline-flex",
        cursor: "pointer",
      },
      ".btn-primary": {
        "--btn-color": "var(--color-primary)",
      },
      ".btn-secondary": {
        "--btn-color": "var(--color-secondary)",
      },
    };

    const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(buttonStyles);

    // Critical assertion: .btn MUST be in classSelectors
    expect(classSelectors[".btn"]).toBeDefined();
    expect(classSelectors[".btn"]).toEqual(expect.objectContaining({ display: "inline-flex" }));

    // .btn should NOT be in otherStyles
    expect(otherStyles[".btn"]).toBeUndefined();

    // All button classes should be in classSelectors
    expect(Object.keys(classSelectors)).toContain(".btn");
    expect(Object.keys(classSelectors)).toContain(".btn-primary");
    expect(Object.keys(classSelectors)).toContain(".btn-secondary");
  });
});

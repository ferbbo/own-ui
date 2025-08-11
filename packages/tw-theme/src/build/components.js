export const buttonStyles = {
  ":where(.btn)": {
    "width": "unset"
  },
  ".btn": {
    "display": "inline-flex",
    "flexShrink": 0,
    "cursor": "pointer",
    "flexWrap": "nowrap",
    "alignItems": "center",
    "justifyContent": "center",
    "textAlign": "center",
    "verticalAlign": "middle",
    "outlineOffset": "2px",
    "WebkitUserSelect": "none",
    "userSelect": "none",
    "paddingInline": "var(--btn-p)",
    "color": "var(--btn-fg)",
    "--tw-prose-links": "var(--btn-fg)",
    "height": "var(--size)",
    "fontSize": "var(--fontsize, 0.875rem)",
    "fontWeight": 600,
    "outlineColor": "var(--btn-color, var(--color-base-content))",
    "transitionProperty": "color, background-color, border-color, box-shadow",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
    "transitionDuration": "0.2s",
    "borderStartStartRadius": "var(--join-ss, var(--radius-field))",
    "borderStartEndRadius": "var(--join-se, var(--radius-field))",
    "borderEndStartRadius": "var(--join-es, var(--radius-field))",
    "borderEndEndRadius": "var(--join-ee, var(--radius-field))",
    "backgroundColor": "var(--btn-bg)",
    "backgroundSize": "auto, calc(var(--noise) * 100%)",
    "backgroundImage": "none, var(--btn-noise)",
    "borderWidth": "var(--border)",
    "borderStyle": "solid",
    "borderColor": "var(--btn-border)",
    "textShadow": "0 0.5px oklch(100% 0 0 / calc(var(--depth) * 0.15))",
    "touchAction": "manipulation",
    "boxShadow": "0 0.5px 0 0.5px oklch(100% 0 0 / calc(var(--depth) * 6%)) inset, var(--btn-shadow)",
    "--btn-color": "var(--color-base-200)",
    "--size": "calc(var(--size-field, 0.25rem) * 10)",
    "--btn-bg": "var(--btn-color, var(--color-base-200))",
    "--btn-fg": "var(--color-base-content)",
    "--btn-p": "1rem",
    "--btn-border": "color-mix(in oklab, var(--btn-bg), #000 calc(var(--depth) * 5%))",
    "--btn-shadow": "0 3px 2px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000),\n    0 4px 3px -2px color-mix(in oklab, var(--btn-bg) calc(var(--depth) * 30%), #0000)",
    "--btn-noise": "var(--fx-noise)"
  },
  ".prose .btn": {
    "textDecorationLine": "none"
  },
  "@media (hover: hover)": [
    {
      ".btn:hover": {
        "--btn-bg": "color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%)"
      }
    },
    {
      ".btn:is(:disabled,[disabled],.btn-disabled):hover": {
        "--btn-fg": "color-mix(in oklch, var(--color-base-content) 20%, #0000)"
      }
    }
  ],
  ".btn:focus-visible": {
    "outlineWidth": "2px",
    "outlineStyle": "solid",
    "isolation": "isolate"
  },
  ".btn:active:not(.btn-active)": {
    "translate": "0 0.5px",
    "--btn-bg": "color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 5%)",
    "--btn-border": "color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%)",
    "--btn-shadow": "0 0 0 0 oklch(0% 0 0/0), 0 0 0 0 oklch(0% 0 0/0)"
  },
  ".btn:is(:disabled,[disabled],.btn-disabled):not(.btn-link,.btn-ghost)": {
    "boxShadow": "none"
  },
  ".btn:is(:disabled,[disabled],.btn-disabled)": {
    "pointerEvents": "none",
    "--btn-border": "#0000",
    "--btn-noise": "none",
    "--btn-fg": "color-mix(in oklch, var(--color-base-content) 20%, #0000)"
  },
  ".btn:is(input[type=\"checkbox\"],input[type=\"radio\"])": {
    "appearance": "none"
  },
  ".btn:is(input[type=\"checkbox\"],input[type=\"radio\"])::after": {
    "content": "attr(aria-label)"
  },
  ".btn:where(input:checked:not(.filter .btn))": {
    "--btn-color": "var(--color-primary)",
    "--btn-fg": "var(--color-primary-content)",
    "isolation": "isolate"
  },
  ".btn-active": {
    "--btn-bg": "color-mix(in oklab, var(--btn-color, var(--color-base-200)), #000 7%)",
    "--btn-shadow": "0 0 0 0 oklch(0% 0 0/0), 0 0 0 0 oklch(0% 0 0/0)",
    "isolation": "isolate"
  },
  ".btn-primary": {
    "--btn-color": "var(--color-primary)",
    "--btn-fg": "var(--color-primary-content)"
  },
  ".btn-secondary": {
    "--btn-color": "var(--color-secondary)",
    "--btn-fg": "var(--color-secondary-content)"
  },
  ".btn-accent": {
    "--btn-color": "var(--color-accent)",
    "--btn-fg": "var(--color-accent-content)"
  },
  ".btn-neutral": {
    "--btn-color": "var(--color-neutral)",
    "--btn-fg": "var(--color-neutral-content)"
  },
  ".btn-info": {
    "--btn-color": "var(--color-info)",
    "--btn-fg": "var(--color-info-content)"
  },
  ".btn-success": {
    "--btn-color": "var(--color-success)",
    "--btn-fg": "var(--color-success-content)"
  },
  ".btn-warning": {
    "--btn-color": "var(--color-warning)",
    "--btn-fg": "var(--color-warning-content)"
  },
  ".btn-error": {
    "--btn-color": "var(--color-error)",
    "--btn-fg": "var(--color-error-content)"
  },
  ".btn-ghost:not(.btn-active,:hover,:active:focus,:focus-visible)": {
    "--btn-shadow": "\"\"",
    "--btn-bg": "#0000",
    "--btn-border": "#0000",
    "--btn-noise": "none"
  },
  ".btn-ghost:not(.btn-active,:hover,:active:focus,:focus-visible):not(:disabled,[disabled],.btn-disabled)": {
    "outlineColor": "currentcolor",
    "--btn-fg": "currentColor"
  },
  ".btn-link": {
    "textDecorationLine": "underline",
    "outlineColor": "currentcolor",
    "--btn-border": "#0000",
    "--btn-bg": "#0000",
    "--btn-fg": "var(--color-primary)",
    "--btn-noise": "none",
    "--btn-shadow": "\"\""
  },
  ".btn-link:is(.btn-active,:hover,:active:focus,:focus-visible)": {
    "textDecorationLine": "underline",
    "--btn-border": "#0000",
    "--btn-bg": "#0000"
  },
  ".btn-outline:not(.btn-active,:hover,:active:focus,:focus-visible,:disabled,[disabled],.btn-disabled,:checked)": {
    "--btn-shadow": "\"\"",
    "--btn-bg": "#0000",
    "--btn-fg": "var(--btn-color)",
    "--btn-border": "var(--btn-color)",
    "--btn-noise": "none"
  },
  "@media (hover: none)": [
    {
      ".btn-outline:hover:not(.btn-active,:active,:focus-visible,:disabled,[disabled],.btn-disabled,:checked)": {
        "--btn-shadow": "\"\"",
        "--btn-bg": "#0000",
        "--btn-fg": "var(--btn-color)",
        "--btn-border": "var(--btn-color)",
        "--btn-noise": "none"
      }
    },
    {
      ".btn-dash:hover:not(.btn-active,:active,:focus-visible,:disabled,[disabled],.btn-disabled,:checked)": {
        "--btn-shadow": "\"\"",
        "borderStyle": "dashed",
        "--btn-bg": "#0000",
        "--btn-fg": "var(--btn-color)",
        "--btn-border": "var(--btn-color)",
        "--btn-noise": "none"
      }
    },
    {
      ".btn-soft:hover:not(.btn-active,:active,:focus-visible,:disabled,[disabled],.btn-disabled)": {
        "--btn-shadow": "\"\"",
        "--btn-fg": "var(--btn-color, var(--color-base-content))",
        "--btn-bg": "color-mix(in oklab, var(--btn-color, var(--color-base-content)) 8%, var(--color-base-content))",
        "--btn-border": "color-mix(in oklab, var(--btn-color, var(--color-base-content)) 10%, var(--color-base-content))",
        "--btn-noise": "none"
      }
    }
  ],
  ".btn-dash:not(.btn-active,:hover,:active:focus,:focus-visible,:disabled,[disabled],.btn-disabled,:checked)": {
    "--btn-shadow": "\"\"",
    "borderStyle": "dashed",
    "--btn-bg": "#0000",
    "--btn-fg": "var(--btn-color)",
    "--btn-border": "var(--btn-color)",
    "--btn-noise": "none"
  },
  ".btn-soft:not(.btn-active,:hover,:active:focus,:focus-visible,:disabled,[disabled],.btn-disabled)": {
    "--btn-shadow": "\"\"",
    "--btn-fg": "var(--btn-color, var(--color-base-content))",
    "--btn-bg": "color-mix(in oklab, var(--btn-color, var(--color-base-content)) 8%, var(--color-base-content))",
    "--btn-border": "color-mix(in oklab, var(--btn-color, var(--color-base-content)) 10%, var(--color-base-content))",
    "--btn-noise": "none"
  },
  ".btn-xs": {
    "--fontsize": "0.6875rem",
    "--btn-p": "0.5rem",
    "--size": "calc(var(--size-field, 0.25rem) * 6)"
  },
  ".btn-sm": {
    "--fontsize": "0.75rem",
    "--btn-p": "0.75rem",
    "--size": "calc(var(--size-field, 0.25rem) * 8)"
  },
  ".btn-md": {
    "--fontsize": "0.875rem",
    "--btn-p": "1rem",
    "--size": "calc(var(--size-field, 0.25rem) * 10)"
  },
  ".btn-lg": {
    "--fontsize": "1.125rem",
    "--btn-p": "1.25rem",
    "--size": "calc(var(--size-field, 0.25rem) * 12)"
  },
  ".btn-xl": {
    "--fontsize": "1.375rem",
    "--btn-p": "1.5rem",
    "--size": "calc(var(--size-field, 0.25rem) * 14)"
  },
  ".btn-square": {
    "width": "var(--size)",
    "height": "var(--size)"
  },
  ".btn-circle": {
    "borderRadius": "calc(infinity * 1px)",
    "width": "var(--size)",
    "height": "var(--size)"
  },
  ".btn-wide": {
    "width": "100%"
  },
  ".btn-block": {
    "width": "100%"
  }
}
export const dropdownStyles = {
  ":where(.dropdown)": {
    "width": "unset"
  },
  ".dropdown": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "position": "relative",
    "padding": "var(--dropdown-p)",
    "backgroundColor": "var(--dropdown-bg)",
    "borderRadius": "var(--dropdown-radius)",
    "boxShadow": "var(--dropdown-shadow)",
    "gap": "var(--dropdown-gap)",
    "--dropdown-color": "var(--color-base-100)",
    "--dropdown-bg": "var(--dropdown-color, var(--color-base-100))",
    "--dropdown-p": "0.25rem",
    "--dropdown-radius": "var(--radius-field, 0.75rem)",
    "--dropdown-gap": "0",
    "--dropdown-shadow": "0px 8px 24px -6px rgba(0, 0, 0, 0.16),\n    0px 0px 1px 0px rgba(0, 0, 0, 0.4)"
  },
  ".dropdown-item": {
    "display": "flex",
    "flexDirection": "column",
    "alignItems": "flex-start",
    "justifyContent": "flex-start",
    "cursor": "pointer",
    "userSelect": "none",
    "width": "100%",
    "paddingInline": "var(--dropdown-item-px)",
    "paddingBlock": "var(--dropdown-item-py)",
    "backgroundColor": "var(--dropdown-item-bg)",
    "color": "var(--dropdown-item-fg)",
    "borderRadius": "var(--dropdown-item-radius)",
    "transitionProperty": "background-color, color",
    "transitionTimingFunction": "cubic-bezier(0, 0, 0.2, 1)",
    "transitionDuration": "0.15s",
    "--dropdown-item-color": "var(--color-base-100)",
    "--dropdown-item-bg": "var(--dropdown-item-color, var(--color-base-100))",
    "--dropdown-item-fg": "var(--color-base-content)",
    "--dropdown-item-px": "0.75rem",
    "--dropdown-item-py": "0.5rem",
    "--dropdown-item-radius": "var(--radius-field, 0.5rem)"
  },
  ".dropdown-item:focus-visible": {
    "outlineWidth": "2px",
    "outlineStyle": "solid",
    "outlineColor": "var(--dropdown-item-color, var(--color-base-content))",
    "outlineOffset": "2px",
    "isolation": "isolate"
  },
  "@media (hover: hover)": [
    {
      ".dropdown-item:hover": {
        "--dropdown-item-bg": "color-mix(in oklab, var(--dropdown-item-color, var(--color-base-100)), #000 8%)"
      }
    },
    {
      ".dropdown-item:is(:disabled,[disabled],.dropdown-item-disabled):hover": {
        "pointerEvents": "none",
        "--dropdown-item-fg": "color-mix(in oklch, var(--color-base-content) 40%, #0000)"
      }
    }
  ],
  ".dropdown-item:active": {
    "--dropdown-item-bg": "color-mix(in oklab, var(--dropdown-item-color, var(--color-base-100)), #000 12%)"
  },
  ".dropdown-item.dropdown-item-selected": {
    "--dropdown-item-bg": "color-mix(in oklab, var(--dropdown-item-color, var(--color-base-100)), #000 6%)",
    "isolation": "isolate"
  },
  ".dropdown-item:is(:disabled,[disabled],.dropdown-item-disabled)": {
    "pointerEvents": "none",
    "--dropdown-item-fg": "color-mix(in oklch, var(--color-base-content) 40%, #0000)",
    "opacity": 0.6
  },
  ".dropdown-primary": {
    "--dropdown-color": "var(--color-primary)",
    "--dropdown-item-color": "var(--color-primary)",
    "--dropdown-item-fg": "var(--color-primary-content)"
  },
  ".dropdown-secondary": {
    "--dropdown-color": "var(--color-secondary)",
    "--dropdown-item-color": "var(--color-secondary)",
    "--dropdown-item-fg": "var(--color-secondary-content)"
  },
  ".dropdown-accent": {
    "--dropdown-color": "var(--color-accent)",
    "--dropdown-item-color": "var(--color-accent)",
    "--dropdown-item-fg": "var(--color-accent-content)"
  },
  ".dropdown-neutral": {
    "--dropdown-color": "var(--color-neutral)",
    "--dropdown-item-color": "var(--color-neutral)",
    "--dropdown-item-fg": "var(--color-neutral-content)"
  },
  ".dropdown-xs": {
    "--dropdown-p": "0.125rem",
    "--dropdown-item-px": "0.5rem",
    "--dropdown-item-py": "0.25rem",
    "--dropdown-item-radius": "0.25rem"
  },
  ".dropdown-sm": {
    "--dropdown-p": "0.25rem",
    "--dropdown-item-px": "0.625rem",
    "--dropdown-item-py": "0.375rem",
    "--dropdown-item-radius": "0.375rem"
  },
  ".dropdown-md": {
    "--dropdown-p": "0.25rem",
    "--dropdown-item-px": "0.75rem",
    "--dropdown-item-py": "0.5rem",
    "--dropdown-item-radius": "0.5rem"
  },
  ".dropdown-lg": {
    "--dropdown-p": "0.375rem",
    "--dropdown-item-px": "1rem",
    "--dropdown-item-py": "0.75rem",
    "--dropdown-item-radius": "0.625rem"
  },
  ".dropdown-xl": {
    "--dropdown-p": "0.5rem",
    "--dropdown-item-px": "1.25rem",
    "--dropdown-item-py": "1rem",
    "--dropdown-item-radius": "0.75rem"
  },
  ".dropdown-ghost": {
    "--dropdown-bg": "transparent",
    "--dropdown-shadow": "none"
  },
  ":is(.dropdown-ghost .dropdown-item):not(.dropdown-item-selected,:hover,:active:focus,:focus-visible)": {
    "--dropdown-item-bg": "transparent"
  },
  ".dropdown-bordered": {
    "border": "1px solid color-mix(in oklab, var(--dropdown-color, var(--color-base-100)), #000 15%)"
  },
  ".dropdown-compact": {
    "--dropdown-gap": "0",
    "--dropdown-p": "0.125rem"
  },
  ".dropdown-compact .dropdown-item": {
    "--dropdown-item-radius": "0.25rem"
  },
  ".dropdown-item-text": {
    "display": "flex",
    "flexDirection": "column",
    "justifyContent": "center",
    "textAlign": "left",
    "width": "100%",
    "fontFamily": "var(--font-family, 'DM Sans', sans-serif)",
    "fontSize": "var(--dropdown-item-font-size, 0.875rem)",
    "fontWeight": 400,
    "lineHeight": "var(--dropdown-item-line-height, 1.5rem)",
    "whiteSpace": "nowrap"
  },
  ".dropdown-item-text p": {
    "display": "block",
    "whiteSpace": "pre",
    "lineHeight": "inherit"
  },
  ".dropdown-xs .dropdown-item-text": {
    "--dropdown-item-font-size": "0.75rem",
    "--dropdown-item-line-height": "1.25rem"
  },
  ".dropdown-sm .dropdown-item-text": {
    "--dropdown-item-font-size": "0.8125rem",
    "--dropdown-item-line-height": "1.375rem"
  },
  ".dropdown-md .dropdown-item-text": {
    "--dropdown-item-font-size": "0.875rem",
    "--dropdown-item-line-height": "1.5rem"
  },
  ".dropdown-lg .dropdown-item-text": {
    "--dropdown-item-font-size": "1rem",
    "--dropdown-item-line-height": "1.625rem"
  },
  ".dropdown-xl .dropdown-item-text": {
    "--dropdown-item-font-size": "1.125rem",
    "--dropdown-item-line-height": "1.75rem"
  }
}
export const menuStyles = {}

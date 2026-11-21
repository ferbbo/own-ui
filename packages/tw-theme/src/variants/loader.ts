/**
 * Contrato de clases del Loader: prop de React -> clase CSS.
 *
 * Verificado contra `css/loader.css` por
 * `src/variants/__tests__/contract.test.ts`.
 */
export default {
  color: {
    primary: "loader-primary",
    secondary: "loader-secondary",
    accent: "loader-accent",
    neutral: "loader-neutral",
    info: "loader-info",
    success: "loader-success",
    warning: "loader-warning",
    error: "loader-error",
    /** Hereda el `color` del contexto (lote 5): lo usa el spinner del Button. */
    current: "loader-current",
  },
  size: {
    "2xs": "loader-2xs",
    xs: "loader-xs",
    sm: "loader-sm",
    md: "loader-md",
    lg: "loader-lg",
  },
};

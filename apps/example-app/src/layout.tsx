import { ReactNode } from "react";

/**
 * Primitivas de maquetación de la app de ejemplo.
 *
 * Son deliberadamente tontas: la app no es un escaparate de CSS propio, así
 * que todo el color sale de las utilidades de superficie que genera el plugin
 * (`bg-base-200`, `text-base-content`, `border-base-300`) y lo demás son
 * utilidades de layout de Tailwind. Ningún color literal.
 */

export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-b border-base-300 px-6 py-10 last:border-b-0">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm opacity-70">{description}</p>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-mono text-xs uppercase tracking-widest opacity-60">{label}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-base-300 bg-base-200 p-4">{children}</div>;
}

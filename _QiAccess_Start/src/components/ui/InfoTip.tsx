import type { ReactNode } from "react";
import { InfoIcon } from "../icons/qi-icons";

type InfoTipProps = {
  align?: "left" | "right";
  children: ReactNode;
  interactive?: boolean;
  label?: string;
};

export function InfoTip({ align = "left", children, interactive = true, label = "More details" }: InfoTipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {interactive ? (
        <button
          aria-label={label}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-2 text-muted transition hover:border-brand-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          title={label}
          type="button"
        >
          <InfoIcon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-2 text-muted transition group-hover/tooltip:border-brand-200 group-hover/tooltip:text-brand-600"
          title={label}
        >
          <InfoIcon className="h-3.5 w-3.5" />
        </span>
      )}
      <span
        className={`pointer-events-none absolute top-full z-30 mt-2 hidden w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-slate-950/96 px-3 py-2 text-left text-xs leading-5 text-slate-100 shadow-2xl group-hover/tooltip:block ${
          interactive ? "group-focus-within/tooltip:block " : ""
        }${
          align === "right" ? "right-0" : "left-0"
        }`}
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
}

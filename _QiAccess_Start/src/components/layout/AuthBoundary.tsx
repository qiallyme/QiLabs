import type { ReactNode } from "react";

export function AuthBoundary({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-brand-900">Auth boundary placeholder.</span>{" "}
          Assume Cloudflare Access or Zero Trust protects this app for now.
        </div>
        <span className="rounded-full border border-brand-300 bg-brand-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-800">
          v1 trusted edge
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

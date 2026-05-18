import { useState } from "react";
import { useLocation } from "react-router-dom";
import { resolvePageMeta } from "../../lib/navigation";
import { BoxesIcon, XIcon } from "../icons/qi-icons";
import { TreeMenu } from "./TreeMenu";

export function Topbar() {
  const location = useLocation();
  const page = resolvePageMeta(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface px-3 py-3 backdrop-blur sm:px-4 lg:px-6 lg:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-heading sm:text-2xl">{page.title}</h1>
        </div>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-2 text-heading shadow-card transition hover:border-brand-400 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          {menuOpen ? <XIcon className="h-5 w-5" /> : <BoxesIcon className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="mt-3 rounded-3xl border border-border bg-surface-2 p-3 shadow-card lg:hidden">
          <TreeMenu mode="mobile" onNavigate={() => setMenuOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MDXProvider } from "./MDXProvider";

type DocLayoutProps = {
  children: ReactNode;
  title?: string;
  sourcePath?: string;
};

export function DocLayout({ children, title, sourcePath }: DocLayoutProps) {
  return (
    <MDXProvider>
      <div className="grid gap-6 2xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Link className="hover:text-brand-600" to="/docs">
                Knowledge
              </Link>
              <span>/</span>
              <span className="font-medium text-body">Blueprint</span>
            </div>
            {title && <h1 className="mt-4 text-4xl font-bold tracking-tight text-heading">{title}</h1>}
          </header>

          <article className="panel prose prose-slate max-w-none p-8 lg:p-12">
            {children}
          </article>

          <footer className="mt-12 border-t border-border pt-8 text-sm text-muted">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>© 2026 QiLabs // QiAccess Start Blueprint</p>
              {sourcePath && (
                <div className="font-mono text-[11px] uppercase tracking-wider">
                  Source: <span className="text-brand-600">{sourcePath}</span>
                </div>
              )}
            </div>
          </footer>
        </div>

        <aside className="hidden 2xl:block">
          <div className="sticky top-24 space-y-6">
            <section className="panel p-5">
              <div className="eyebrow">On this page</div>
              <div className="mt-4 text-sm text-muted">
                {/* TOC would go here - dynamic MDX TOC is a bit more complex */}
                Navigation matches the active blueprint structure.
              </div>
            </section>
            
            <section className="panel p-5">
              <div className="eyebrow">Quick Links</div>
              <nav className="mt-4 grid gap-2">
                <Link className="text-sm text-body hover:text-brand-600" to="/docs">Docs Overview</Link>
                <Link className="text-sm text-body hover:text-brand-600" to="/system/blueprint">Blueprint Module</Link>
              </nav>
            </section>
          </div>
        </aside>
      </div>
    </MDXProvider>
  );
}

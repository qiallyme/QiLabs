import { MDXProvider as BaseProvider } from "@mdx-js/react";
import type { ReactNode, ComponentPropsWithoutRef } from "react";

const components = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mb-4 mt-8 text-3xl font-bold tracking-tight text-heading" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mb-4 mt-8 border-b border-border pb-2 text-2xl font-semibold tracking-tight text-heading" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-heading" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4 leading-7 text-body last:mb-0" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-body" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-body" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="pl-1" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="mb-4 border-l-4 border-brand-200 bg-brand-50/50 py-3 pl-4 pr-3 text-brand-900" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[0.9em] text-brand-700" {...props} />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100" {...props} />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-border" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="font-medium text-brand-600 underline underline-offset-4 hover:text-brand-700" {...props} />
  ),
};

export function MDXProvider({ children }: { children: ReactNode }) {
  return <BaseProvider components={components}>{children}</BaseProvider>;
}

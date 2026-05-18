import { Link } from "react-router-dom";

const memoryRows = [
  {
    label: "Status",
    value: "Planned",
    detail: "No ingestion-backed memory layer is active in QiAccess yet.",
  },
  {
    label: "Current Source",
    value: "Capture drafts",
    detail: "Capture keeps local drafts, but there is no durable memory pipeline behind them yet.",
  },
  {
    label: "Use Now",
    value: "System Diagnostics",
    detail: "Use Diagnostics for the actual relationship map that exists today.",
  },
];

export function MemoryPage() {
  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Memory</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Status and purpose only</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          Memory stays intentionally thin in this phase. Nothing on this page should imply retrieval, embeddings, or durable context unless the pipeline exists.
        </p>
        <div className="mt-5">
          <Link className="button-secondary" to="/system/diagnostics">
            Open Diagnostics
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {memoryRows.map((row) => (
          <div className="panel-muted p-5" key={row.label}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-subtle">{row.label}</div>
            <div className="mt-2 text-lg font-semibold text-heading">{row.value}</div>
            <div className="mt-2 text-sm leading-6 text-body">{row.detail}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

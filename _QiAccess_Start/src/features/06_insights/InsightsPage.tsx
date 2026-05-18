const insightRows = [
  {
    label: "Status",
    value: "Planned",
    detail: "There is no trusted synthesis layer running in QiAccess yet.",
  },
  {
    label: "Needs First",
    value: "Real ingestion",
    detail: "Insights should come after documents, notes, and sources are actually flowing somewhere durable.",
  },
  {
    label: "Purpose",
    value: "Future summaries",
    detail: "This root is reserved for source-backed summaries, patterns, and reports once the pipeline is real.",
  },
];

export function InsightsPage() {
  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Insights</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Not active yet</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          Insights stays honest here. No summaries, pattern claims, or agent language until the app has real source flow to support them.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {insightRows.map((row) => (
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

import { storageBuckets } from "../../data/storageBuckets";
import { SystemSectionPage } from "./SystemSectionPage";

export function SystemStoragePage() {
  return (
    <div className="grid gap-4">
      <SystemSectionPage sectionId="storage" />
      <section className="panel p-6">
        <div className="eyebrow">QiNexus Buckets</div>
        <h2 className="mt-2 text-2xl font-semibold text-heading">Storage backbone placeholders</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {storageBuckets.map((bucket) => (
            <div className="panel-muted p-5" key={bucket.id}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold text-heading">{bucket.label}</div>
                <span className="chip">{bucket.visibility}</span>
              </div>
              <div className="mt-2 font-mono text-xs text-brand-600">{bucket.path}</div>
              <div className="mt-2 text-sm leading-6 text-body">{bucket.purpose}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

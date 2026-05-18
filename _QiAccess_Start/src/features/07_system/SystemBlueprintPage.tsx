import { blueprintSections } from "../../data/blueprintSections";

export function SystemBlueprintPage() {
  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Blueprint</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">QiAccess blueprint structure</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          This page keeps the route alive inside the app and shows the current doctrine shape without pretending the full blueprint is maintained here.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {blueprintSections.map((section) => (
          <div className="panel-muted p-5" key={section.id}>
            <div className="eyebrow">{section.id}</div>
            <h2 className="mt-1 text-lg font-semibold text-heading">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-body">{section.description}</p>
            <div className="mt-4 text-xs uppercase tracking-wider text-muted">{section.primaryQuestion}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

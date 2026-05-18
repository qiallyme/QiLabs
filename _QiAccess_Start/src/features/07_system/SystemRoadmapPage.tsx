import { roadmapPhases } from "../../data/roadmapPhases";

export function SystemRoadmapPage() {
  return (
    <div className="grid gap-4">
      <section className="panel p-6">
        <div className="eyebrow">Roadmap</div>
        <h1 className="mt-2 text-2xl font-semibold text-heading">QiAccess rollout phases</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">
          This route reflects the current in-app roadmap phases. Project-level application planning continues in the docs portfolio under Applications Roadmap.
        </p>
      </section>

      <section className="grid gap-3">
        {roadmapPhases.map((phase) => (
          <section className="panel-muted p-5" key={phase.id}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-semibold text-heading">{phase.title}</div>
              <span className="chip">{phase.status}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-body">{phase.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {phase.deliverables.map((deliverable) => (
                <span className="chip" key={`${phase.id}-${deliverable}`}>
                  {deliverable}
                </span>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}

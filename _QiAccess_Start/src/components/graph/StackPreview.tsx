import type { Resource } from "../../types/resource";

type StackPreviewProps = {
  onSelect: (resourceId: string) => void;
  resources: Resource[];
};

const zoneOrder = ["local", "tailnet", "admin", "public", "private"] as const;

export function StackPreview({ onSelect, resources }: StackPreviewProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-5">
        {zoneOrder.map((zone) => {
          const zoneResources = resources.filter((resource) => resource.zone === zone).slice(0, 4);

          return (
            <div className="panel-muted p-4" key={zone}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{zone}</div>
              <div className="mt-3 grid gap-2">
                {zoneResources.map((resource) => (
                  <button
                    className="rounded-xl border border-border bg-surface px-3 py-2 text-left shadow-sm transition hover:border-brand-200 hover:shadow-card-hover"
                    key={resource.id}
                    onClick={() => onSelect(resource.id)}
                    type="button"
                  >
                    <div className="text-sm font-semibold text-heading">{resource.name}</div>
                    <div className="mt-1 text-[11px] text-muted">{resource.type}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-muted p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Key relationships</div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {resources
            .flatMap((resource) =>
              (resource.dependsOn ?? []).slice(0, 2).map((dependency) => ({
                dependency,
                resourceId: resource.id,
                resourceName: resource.name,
              })),
            )
            .slice(0, 8)
            .map((item) => (
              <button
                className="rounded-xl border border-border bg-surface px-3 py-3 text-left text-sm text-body shadow-sm transition hover:border-brand-200 hover:shadow-card-hover"
                key={`${item.resourceId}-${item.dependency}`}
                onClick={() => onSelect(item.resourceId)}
                type="button"
              >
                <span className="font-semibold text-heading">{item.resourceName}</span>
                <span className="mx-2 text-muted">depends on</span>
                <span className="font-semibold text-brand-600">{item.dependency}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

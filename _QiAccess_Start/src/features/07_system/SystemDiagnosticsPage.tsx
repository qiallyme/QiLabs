import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import type { EditorOutletContext } from "../../components/app/routes";
import { ResourceDetailPanel } from "../../components/graph/ResourceDetailPanel";
import { StackMapCanvas } from "../../components/graph/StackMapCanvas";
import { useRegistry } from "../resources/registry-store";

export function SystemDiagnosticsPage() {
  const { resources } = useRegistry();
  const { onEdit } = useOutletContext<EditorOutletContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string>(searchParams.get("selected") ?? resources[0]?.id ?? "");

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedId) ?? resources[0] ?? null,
    [resources, selectedId],
  );

  useEffect(() => {
    const fromQuery = searchParams.get("selected");
    if (fromQuery && fromQuery !== selectedId) {
      setSelectedId(fromQuery);
    }
  }, [searchParams, selectedId]);

  useEffect(() => {
    if (!selectedResource) {
      return;
    }

    if (searchParams.get("selected") === selectedResource.id) {
      return;
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("selected", selectedResource.id);
      return next;
    });
  }, [searchParams, selectedResource, setSearchParams]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-surface-2 px-6 py-4">
          <div>
            <div className="eyebrow">Diagnostics</div>
            <h2 className="section-title mt-0.5">Relationship graph and current audit map</h2>
          </div>
          <span className="chip">No live health checks yet</span>
        </div>
        <div className="p-4 pb-1">
          <p className="text-sm leading-6 text-muted">
            This graph is still seeded from static registry data, but it is the best current picture of launch paths,
            dependencies, and what should remain private only.
          </p>
        </div>
        <div className="p-6">
          <StackMapCanvas onSelect={setSelectedId} resources={resources} selectedId={selectedId} />
        </div>
      </section>
      <ResourceDetailPanel onEdit={onEdit} resource={selectedResource} />
    </div>
  );
}

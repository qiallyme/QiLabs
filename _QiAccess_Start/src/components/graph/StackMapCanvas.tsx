import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import type { ComponentType } from "react";
import { useMemo } from "react";
import { zoneOrder } from "../../lib/status/resource-status";
import type { Resource } from "../../types/resource";
import { ResourceNode, type ResourceMapNode } from "./ResourceNode";

type StackMapCanvasProps = {
  compact?: boolean;
  onSelect?: (resourceId: string) => void;
  resources: Resource[];
  selectedId?: string | null;
};

const nodeTypes: NodeTypes = {
  resourceNode: ResourceNode as ComponentType<any>,
};

export function StackMapCanvas({ compact = false, onSelect, resources, selectedId }: StackMapCanvasProps) {
  const { edges, nodes } = useMemo(() => {
    const groupedByZone = new Map(zoneOrder.map((zone) => [zone, resources.filter((resource) => resource.zone === zone)]));

    const builtNodes: ResourceMapNode[] = [];

    zoneOrder.forEach((zone, zoneIndex) => {
      const zoneResources = groupedByZone.get(zone) ?? [];

      zoneResources.forEach((resource, resourceIndex) => {
        builtNodes.push({
          id: resource.id,
          type: "resourceNode",
          data: { resource },
          draggable: !compact,
          position: {
            x: zoneIndex * 320,
            y: resourceIndex * 150,
          },
          selected: resource.id === selectedId,
        });
      });
    });

    const builtEdges: Edge[] = [];
    const seenEdges = new Set<string>();

    resources.forEach((resource) => {
      resource.dependsOn?.forEach((dependency) => {
        const edgeId = `depends-${resource.id}-${dependency}`;
        if (seenEdges.has(edgeId)) {
          return;
        }

        builtEdges.push({
          id: edgeId,
          source: dependency,
          target: resource.id,
          label: "depends on",
          type: "smoothstep",
          style: { stroke: "#818cf8", strokeOpacity: 0.6 },
          labelStyle: { fill: "#4f46e5", fontSize: 11 },
        });
        seenEdges.add(edgeId);
      });

      resource.launches?.forEach((launchId) => {
        const edgeId = `launches-${resource.id}-${launchId}`;
        if (seenEdges.has(edgeId)) {
          return;
        }

        builtEdges.push({
          id: edgeId,
          source: resource.id,
          target: launchId,
          label: "launches",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#6366f1", strokeOpacity: 0.7 },
          labelStyle: { fill: "#312e81", fontSize: 11 },
        });
        seenEdges.add(edgeId);
      });
    });

    return { edges: builtEdges, nodes: builtNodes };
  }, [compact, resources, selectedId]);

  return (
    <div className={`${compact ? "h-[320px]" : "h-[720px]"} overflow-hidden rounded-2xl border border-border bg-surface-3`}>
      <ReactFlow
        defaultEdgeOptions={{ type: "smoothstep" }}
        edges={edges}
        fitView
        fitViewOptions={{ padding: compact ? 0.18 : 0.12 }}
        minZoom={0.3}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect?.(node.id)}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={!compact}
      >
        <Background color="#cbd0df" gap={24} size={1.2} />
        {!compact ? <MiniMap pannable zoomable /> : null}
        {!compact ? <Controls /> : null}
      </ReactFlow>
    </div>
  );
}

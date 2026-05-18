import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { Resource } from "../../types/resource";

export type ResourceNodeData = {
  resource: Resource;
};

export type ResourceMapNode = Node<ResourceNodeData, "resourceNode">;

export function ResourceNode({ data, selected }: NodeProps<ResourceMapNode>) {
  const resource = data.resource;

  const dotClass =
    resource.status === "online"
      ? "status-online"
      : resource.status === "offline"
        ? "status-offline"
        : "status-unknown";

  return (
    <div
      className={`min-w-[220px] cursor-pointer rounded-2xl border bg-surface px-4 py-3 shadow-card transition
        ${selected
          ? "border-brand-400 shadow-ring-brand"
          : "border-border hover:border-brand-200 hover:shadow-card-hover"
        }`}
    >
      <Handle position={Position.Top} type="target" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{resource.zone}</div>
          <div className="mt-1.5 text-sm font-bold text-heading">{resource.name}</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-subtle">{resource.type}</div>
        </div>
        <span className={`dot animate-pulseSoft mt-0.5 ${dotClass}`} />
      </div>
      <div className="mt-2 text-xs leading-5 text-muted">{resource.description}</div>
      <Handle position={Position.Bottom} type="source" />
    </div>
  );
}

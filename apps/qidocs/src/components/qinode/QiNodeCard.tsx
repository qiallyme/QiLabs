import { useNavigate } from "react-router-dom";
import type { QiNode } from "../../core/state/useQiStore";
import GlassCard from "../common/GlassCard";

interface Props {
  node: QiNode;
}

export default function QiNodeCard({ node }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/node/${encodeURIComponent(node.qid)}`);
  };


  return (
    <GlassCard
      hover
      onClick={handleClick}
      className="p-4 cursor-pointer"
    >
      <div className="text-xs text-slate-500 mb-1 font-mono">{node.qid}</div>
      <h3 className="text-sm font-medium text-slate-50 mb-1 line-clamp-2">
        {node.title || "(Untitled QiNode)"}
      </h3>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{node.realm}</span>
        <span>•</span>
        <span>{node.orbit}</span>
        <span>•</span>
        <span>{node.system}</span>
      </div>
      {node.summary && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
          {node.summary}
        </p>
      )}
    </GlassCard>
  );
}


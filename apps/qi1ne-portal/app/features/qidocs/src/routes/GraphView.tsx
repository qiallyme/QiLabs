import { useEffect, useRef, useState, useMemo } from "react";
import { useQiStore, type QiNode } from "../core/state/useQiStore";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/common/GlassCard";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  node: QiNode;
}

export default function GraphView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const allNodes = useQiStore((s) => Object.values(s.nodes));
  const navigate = useNavigate();
  const nodesRef = useRef<string>(""); // Track node IDs to detect changes

  // Initialize graph nodes from QiNodes
  useEffect(() => {
    if (allNodes.length === 0) {
      setNodes([]);
      nodesRef.current = "";
      return;
    }

    // Create stable ID string to detect actual changes
    const nodeIds = allNodes.map(n => n.qid).sort().join(",");
    if (nodesRef.current === nodeIds) return; // No change, skip update
    nodesRef.current = nodeIds;

    const graphNodes: GraphNode[] = allNodes.map((node, idx) => {
      // Distribute nodes in a circle initially
      const angle = (idx / allNodes.length) * Math.PI * 2;
      const radius = 150;
      return {
        id: node.qid,
        x: Math.cos(angle) * radius + 400,
        y: Math.sin(angle) * radius + 300,
        vx: 0,
        vy: 0,
        node,
      };
    });

    setNodes(graphNodes);
  }, [allNodes]);

  // Simple force-directed graph simulation
  useEffect(() => {
    if (nodes.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrame: number;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simple force-directed layout
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const repulsionForce = 100;
      const attractionForce = 0.01;

      // Update positions
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Reset velocity
        node.vx = 0;
        node.vy = 0;

        // Repulsion from other nodes
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsionForce / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }

        // Attraction to center
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * attractionForce;
        node.vy += dy * attractionForce;

        // Apply velocity with damping
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx * 0.1;
        node.y += node.vy * 0.1;

        // Boundary constraints
        node.x = Math.max(50, Math.min(canvas.width - 50, node.x));
        node.y = Math.max(50, Math.min(canvas.height - 50, node.y));
      }

      // Draw edges (simple - connect nodes in same realm/orbit)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          if (a.node.realm === b.node.realm && a.node.orbit === b.node.orbit) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((graphNode) => {
        const isSelected = selectedNode === graphNode.id;
        const radius = isSelected ? 12 : 8;

        // Node circle
        ctx.beginPath();
        ctx.arc(graphNode.x, graphNode.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? "rgb(14, 165, 233)"
          : graphNode.node.realm === "QiOne"
          ? "rgb(139, 92, 246)"
          : "rgb(100, 116, 139)";
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected ? "rgb(56, 189, 248)" : "rgba(148, 163, 184, 0.5)";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Label
        if (isSelected || graphNode.node.title.length < 20) {
          ctx.fillStyle = "rgb(241, 245, 249)";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            graphNode.node.title.substring(0, 15),
            graphNode.x,
            graphNode.y + radius + 16
          );
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    // Handle clicks
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const graphNode of nodes) {
        const dx = x - graphNode.x;
        const dy = y - graphNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 15) {
          setSelectedNode(graphNode.id);
          navigate(`/node/${encodeURIComponent(graphNode.id)}`);
          return;
        }
      }
      setSelectedNode(null);
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("click", handleClick);
    };
  }, [nodes, selectedNode, navigate]);

  return (
    <div className="h-full flex flex-col gap-4">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              QiGraph
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Visual representation of your QiMultiverse ({allNodes.length} nodes)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Reset graph view by reinitializing nodes
                const graphNodes: GraphNode[] = allNodes.map((node, idx) => {
                  const angle = (idx / allNodes.length) * Math.PI * 2;
                  const radius = 150;
                  return {
                    id: node.qid,
                    x: Math.cos(angle) * radius + 400,
                    y: Math.sin(angle) * radius + 300,
                    vx: 0,
                    vy: 0,
                    node,
                  };
                });
                setNodes(graphNodes);
              }}
              className="px-3 py-1.5 rounded-lg glass-card text-sm text-slate-300 hover:bg-indigo-500/20 transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="flex-1 overflow-hidden p-4">
        {allNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-4xl mb-4">🌌</div>
              <h3 className="text-sm font-medium text-slate-300 mb-1">
                No nodes yet
              </h3>
              <p className="text-xs text-slate-500">
                Create some QiNodes to see them in the graph
              </p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg"
            style={{ cursor: "pointer" }}
          />
        )}
      </GlassCard>
    </div>
  );
}


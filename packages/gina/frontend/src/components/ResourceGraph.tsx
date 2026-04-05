import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { getGraphData } from "../api/resourceWorkerClient";

interface GraphNode {
  id: string;
  type: "need" | "offer";
  label: string;
  category?: string;
  location?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  error?: string;
}

interface ResourceGraphProps {
  onRefresh?: () => void;
}

export const ResourceGraph: React.FC<ResourceGraphProps> = ({ onRefresh }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const graphRef = useRef<any>();

  useEffect(() => {
    loadGraph();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadGraph, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadGraph() {
    setLoading(true);
    setError(null);
    try {
      const data = await getGraphData();
      if (data.error) {
        setError(data.error);
        setGraphData({ nodes: [], edges: [] });
      } else {
        setGraphData({
          nodes: data.nodes || [],
          edges: data.edges || [],
        });
      }
    } catch (err) {
      console.error("Error loading graph:", err);
      setError("Couldn't load the resource graph. Make sure the worker is running.");
      setGraphData({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  }

  if (loading && graphData.nodes.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading resource graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={loadGraph} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.emptyText}>
          No needs or offers in the network yet. Create some using the forms above to see them appear here.
        </p>
      </div>
    );
  }

  // Color nodes by type
  const nodeColor = (node: GraphNode) => {
    if (node.type === "need") return "#3b82f6"; // Blue
    if (node.type === "offer") return "#10b981"; // Green
    return "#6b7280"; // Gray
  };

  // Size nodes
  const nodeSize = 8;

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <button onClick={loadGraph} style={styles.refreshButton}>
          Refresh Graph
        </button>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: "#3b82f6" }}></div>
            <span>Needs</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: "#10b981" }}></div>
            <span>Offers</span>
          </div>
        </div>
      </div>
      <div style={styles.graphWrapper}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={(node: any) => {
            const n = node as GraphNode;
            return `${n.type}: ${n.label}${n.location ? ` (${n.location})` : ""}`;
          }}
          nodeColor={nodeColor}
          nodeVal={nodeSize}
          linkColor={() => "#94a3b8"}
          linkWidth={2}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          cooldownTicks={100}
          onNodeHover={(node: any) => {
            if (node) {
              graphRef.current?.canvas();
            }
          }}
          onNodeClick={(node: any) => {
            if (node) {
              const n = node as GraphNode;
              alert(`${n.type.toUpperCase()}: ${n.label}\n${n.location ? `Location: ${n.location}\n` : ""}${n.category ? `Category: ${n.category}` : ""}`);
            }
          }}
        />
      </div>
      <p style={styles.helpText}>
        Click and drag to pan, scroll to zoom. Click a node to see details. Blue = Needs, Green = Offers.
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "500px",
    position: "relative",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  refreshButton: {
    background: "#0ea5e9",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  legend: {
    display: "flex",
    gap: "16px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  graphWrapper: {
    width: "100%",
    height: "450px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#ffffff",
  },
  loadingText: {
    textAlign: "center",
    color: "#6b7280",
    padding: "40px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
  },
  errorText: {
    color: "#991b1b",
    margin: "0 0 12px 0",
  },
  retryButton: {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "40px",
    fontStyle: "italic",
  },
  helpText: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "8px",
    textAlign: "center",
  },
};


import React, { useState, useEffect } from "react";
import { NeedForm } from "../components/NeedForm";
import { OfferForm } from "../components/OfferForm";
import { ResourceGraph } from "../components/ResourceGraph";
import { createResource, matchResources, getGraphData, type MatchResult } from "../api/resourceWorkerClient";
import "../App.css";

interface GraphStats {
  totalNeeds: number;
  totalOffers: number;
  totalMatches: number;
}

export const NavigatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<GraphStats>({ totalNeeds: 0, totalOffers: 0, totalMatches: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [globalMatches, setGlobalMatches] = useState<MatchResult[]>([]);
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const graphData = await getGraphData();
      if (graphData.error) {
        setError(graphData.error);
        setStats({ totalNeeds: 0, totalOffers: 0, totalMatches: 0 });
      } else {
        const needs = graphData.nodes?.filter((n: any) => n.type === "need") || [];
        const offers = graphData.nodes?.filter((n: any) => n.type === "offer") || [];
        setStats({
          totalNeeds: needs.length,
          totalOffers: offers.length,
          totalMatches: graphData.edges?.length || 0
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Couldn't load resource graph stats. Make sure the worker is running and configured.");
      setStats({ totalNeeds: 0, totalOffers: 0, totalMatches: 0 });
    } finally {
      setLoading(false);
    }
  }

  const handleNeedCreated = async () => {
    await loadStats();
    setGraphRefreshKey(prev => prev + 1); // Trigger graph refresh
  };

  const handleOfferCreated = async () => {
    await loadStats();
    setGraphRefreshKey(prev => prev + 1); // Trigger graph refresh
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Navigator Dashboard</h1>
        <p style={styles.subtitle}>
          Track needs, offers, and matches across the Lumara network. Use this to see what's happening in real-time.
        </p>
      </header>

      {error && (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error}</p>
          <p style={styles.errorHelp}>
            To enable the resource graph, configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your worker environment.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{loading ? "..." : stats.totalNeeds}</div>
          <div style={styles.statLabel}>Active Needs</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{loading ? "..." : stats.totalOffers}</div>
          <div style={styles.statLabel}>Active Offers</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{loading ? "..." : stats.totalMatches}</div>
          <div style={styles.statLabel}>Potential Matches</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsSection}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <button
            onClick={() => {
              const form = document.getElementById("need-form-trigger");
              form?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={styles.actionButton}
          >
            Log a New Need
          </button>
          <button
            onClick={() => {
              const form = document.getElementById("offer-form-trigger");
              form?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={styles.actionButton}
          >
            Log a New Offer
          </button>
          <button
            onClick={() => setShowGraph(!showGraph)}
            style={styles.actionButton}
          >
            {showGraph ? "Hide" : "Show"} Resource Graph
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      {showGraph && (
        <div style={styles.graphSection}>
          <h2 style={styles.sectionTitle}>Resource Graph</h2>
          <p style={styles.sectionSubtitle}>
            Visual representation of needs and offers in the network. Nodes represent needs (blue) and offers (green). 
            Edges show potential matches.
          </p>
          <ResourceGraph key={graphRefreshKey} onRefresh={loadStats} />
        </div>
      )}

      {/* Forms */}
      <div style={styles.formsSection}>
        <div id="need-form-trigger" style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Log a Need</h2>
          <NeedForm
            onMatches={(matches) => {
              setGlobalMatches(matches);
              handleNeedCreated();
            }}
          />
        </div>
        <div id="offer-form-trigger" style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Log an Offer</h2>
          <OfferForm
            onMatches={(matches) => {
              setGlobalMatches(matches);
              handleOfferCreated();
            }}
          />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    margin: 0,
  },
  errorCard: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "24px",
  },
  errorText: {
    color: "#991b1b",
    margin: "0 0 8px 0",
    fontWeight: 600,
  },
  errorHelp: {
    color: "#7f1d1d",
    margin: 0,
    fontSize: "0.9rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#0ea5e9",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  actionsSection: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 16px 0",
  },
  sectionSubtitle: {
    fontSize: "0.9rem",
    color: "#6b7280",
    margin: "0 0 16px 0",
  },
  actionsGrid: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  actionButton: {
    background: "#0ea5e9",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  graphSection: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
    minHeight: "500px",
  },
  formsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
  },
};


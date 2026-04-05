import React, { useState, useEffect } from "react";
import { WidgetShell } from "../components/WidgetShell";
import { getGraphData, type MatchResult } from "../api/resourceWorkerClient";
import "../App.css";

interface NeedOrOffer {
  id: string;
  type: "need" | "offer";
  description: string;
  location?: string;
}

export const ClientPortal: React.FC = () => {
  const [myNeeds, setMyNeeds] = useState<NeedOrOffer[]>([]);
  const [suggestedOffers, setSuggestedOffers] = useState<NeedOrOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const graphData = await getGraphData();
      if (graphData.error) {
        setError(graphData.error);
        setMyNeeds([]);
        setSuggestedOffers([]);
      } else {
        // Get last 5 needs
        const needs = (graphData.nodes || [])
          .filter((n: any) => n.type === "need")
          .slice(0, 5)
          .map((n: any) => ({
            id: n.id,
            type: "need" as const,
            description: n.label || "Need",
            location: n.location,
          }));
        
        // Get last 5 offers
        const offers = (graphData.nodes || [])
          .filter((n: any) => n.type === "offer")
          .slice(0, 5)
          .map((n: any) => ({
            id: n.id,
            type: "offer" as const,
            description: n.label || "Offer",
            location: n.location,
          }));

        setMyNeeds(needs);
        setSuggestedOffers(offers);
      }
    } catch (err) {
      console.error("Error loading portal data:", err);
      setError("Couldn't load your needs and offers. The resource graph may not be configured yet.");
      setMyNeeds([]);
      setSuggestedOffers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.branding}>
          <h1 style={styles.brandTitle}>Lumara</h1>
          <p style={styles.brandSubtitle}>Your safety network. Here when you need us.</p>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Chat Section */}
        <div style={styles.chatSection}>
          <h2 style={styles.sectionTitle}>Chat with Lina</h2>
          <p style={styles.sectionSubtitle}>
            Tell me what you need right now and I'll try to connect it to any offers in the network.
          </p>
          <div style={styles.chatContainer}>
            <WidgetShell source="client-portal" />
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* My Needs */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Your Active Needs</h3>
            {error && (
              <div style={styles.configMessage}>
                <p style={styles.configText}>
                  Resource graph storage isn't configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable this feature.
                </p>
              </div>
            )}
            {loading ? (
              <p style={styles.loadingText}>Loading...</p>
            ) : myNeeds.length === 0 ? (
              <p style={styles.emptyText}>No active needs yet. Use the chat to let Lina know what you need.</p>
            ) : (
              <ul style={styles.list}>
                {myNeeds.map((need) => (
                  <li key={need.id} style={styles.listItem}>
                    <div style={styles.itemContent}>
                      <div style={styles.itemDescription}>{need.description}</div>
                      {need.location && (
                        <div style={styles.itemLocation}>📍 {need.location}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Suggested Offers */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>Available Offers</h3>
            {loading ? (
              <p style={styles.loadingText}>Loading...</p>
            ) : suggestedOffers.length === 0 ? (
              <p style={styles.emptyText}>No offers available right now. Check back soon.</p>
            ) : (
              <ul style={styles.list}>
                {suggestedOffers.map((offer) => (
                  <li key={offer.id} style={styles.listItem}>
                    <div style={styles.itemContent}>
                      <div style={styles.itemDescription}>{offer.description}</div>
                      {offer.location && (
                        <div style={styles.itemLocation}>📍 {offer.location}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "32px",
    color: "#ffffff",
  },
  branding: {
    textAlign: "center",
  },
  brandTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    margin: "0 0 8px 0",
    color: "#ffffff",
  },
  brandSubtitle: {
    fontSize: "1.1rem",
    margin: 0,
    opacity: 0.95,
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "24px",
  },
  chatSection: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 8px 0",
  },
  sectionSubtitle: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0 0 24px 0",
  },
  chatContainer: {
    minHeight: "500px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  sidebarSection: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
  },
  sidebarTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 16px 0",
  },
  configMessage: {
    background: "#fef3c7",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
  },
  configText: {
    fontSize: "0.85rem",
    color: "#92400e",
    margin: 0,
  },
  loadingText: {
    fontSize: "0.9rem",
    color: "#6b7280",
    fontStyle: "italic",
    margin: 0,
  },
  emptyText: {
    fontSize: "0.9rem",
    color: "#9ca3af",
    fontStyle: "italic",
    margin: 0,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  itemContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  itemDescription: {
    fontSize: "0.9rem",
    color: "#111827",
    lineHeight: "1.5",
  },
  itemLocation: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
};


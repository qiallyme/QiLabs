// frontend/src/pages/Home.tsx
import React, { useState } from "react";
import { WidgetShell } from "../components/WidgetShell";
import { NeedForm } from "../components/NeedForm";
import { OfferForm } from "../components/OfferForm";
import { NavigatorMediationPanel } from "../components/NavigatorMediationPanel";
import type { MatchResult } from "../api/resourceWorkerClient";
import "../App.css";

type RoleView = "client" | "agent" | "admin" | "graph";

export const Home: React.FC = () => {
  const [view, setView] = useState<RoleView>("client");
  const [globalMatches, setGlobalMatches] = useState<MatchResult[]>([]);

  const isClient = view === "client";

  const cardStyle: React.CSSProperties = isClient
    ? {
        borderRadius: 24,
        border: "1px solid #e5e7eb",
        boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
        background: "#ffffff",
        padding: 20,
      }
    : {
        borderRadius: 24,
        border: "1px solid rgba(148,163,184,0.6)",
        boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
        background:
          "radial-gradient(circle at top left, #0f172a, #020617 55%, #020617)",
        padding: 20,
        color: "#e5e7eb",
      };

  const titleColor = isClient ? "#111827" : "#e5e7eb";
  const subtextColor = isClient ? "#6b7280" : "#9ca3af";
  const pillBg = isClient ? "#f3f4f6" : "rgba(15,23,42,0.8)";
  const pillBorder = isClient ? "#e5e7eb" : "rgba(148,163,184,0.6)";

  return (
    <div style={cardStyle}>
      <header style={{ marginBottom: 12 }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 600,
            color: titleColor,
          }}
        >
          Lumara Navigator Cockpit
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: ".8rem",
            color: subtextColor,
          }}
        >
          Switch views to see how Lina supports{" "}
          <strong>members</strong> (light) and how{" "}
          <strong>navigators / admins</strong> work behind the scenes (dark).
        </p>
      </header>

      {/* Role pills */}
      <div
        style={{
          display: "inline-flex",
          padding: 4,
          borderRadius: 999,
          background: pillBg,
          border: `1px solid ${pillBorder}`,
          marginBottom: 12,
          gap: 4,
        }}
      >
        {roleButton("Client view", "client", view, setView, "member")}
        {roleButton("Agent view", "agent", view, setView, "internal")}
        {roleButton("Admin view", "admin", view, setView, "internal")}
        {roleButton("Graph view", "graph", view, setView, "internal")}
      </div>

      {view === "client" && <ClientView />}
      {view === "agent" && (
        <AgentView
          globalMatches={globalMatches}
          onMatches={setGlobalMatches}
        />
      )}
      {view === "admin" && <AdminView />}
      {view === "graph" && <GraphView matches={globalMatches} />}
    </div>
  );
};

function roleButton(
  label: string,
  value: RoleView,
  current: RoleView,
  setView: (v: RoleView) => void,
  kind: "member" | "internal"
) {
  const active = current === value;
  const isClient = value === "client";

  const activeBg = isClient ? "#0ea5e9" : "#22c55e";
  const activeColor = "#ffffff";
  const inactiveColor = kind === "member" ? "#4b5563" : "#9ca3af";

  return (
    <button
      type="button"
      onClick={() => setView(value)}
      style={{
        borderRadius: 999,
        border: "none",
        padding: "4px 10px",
        fontSize: "0.78rem",
        cursor: "pointer",
        background: active ? activeBg : "transparent",
        color: active ? activeColor : inactiveColor,
        fontWeight: active ? 600 : 500,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "999px",
          background: kind === "member" ? "#93c5fd" : "#34d399",
          opacity: active ? 1 : 0.6,
        }}
      />
    </button>
  );
}

const ClientView: React.FC = () => (
  <div style={{ marginTop: 8 }}>
    <h3
      style={{
        margin: "0 0 4px",
        fontSize: ".9rem",
        color: "#111827",
      }}
    >
      Member view (light)
    </h3>
    <p
      style={{
        margin: "0 0 8px",
        fontSize: ".8rem",
        color: "#6b7280",
      }}
    >
      This mirrors what a Lumara member feels: soft, bright, and calm. Lina is
      there to listen without exposing any of the internal tools.
    </p>
    <div
      style={{
        height: 280,
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        padding: 8,
      }}
    >
      <WidgetShell source="cockpit-client" />
    </div>
  </div>
);

const AgentView: React.FC<{
  globalMatches: MatchResult[];
  onMatches: (m: MatchResult[]) => void;
}> = ({ globalMatches, onMatches }) => (
  <div style={{ marginTop: 8 }}>
    <h3
      style={{
        margin: "0 0 4px",
        fontSize: ".9rem",
        color: "#e5e7eb",
      }}
    >
      Agent view (dark)
    </h3>
    <p
      style={{
        margin: "0 0 8px",
        fontSize: ".8rem",
        color: "#9ca3af",
      }}
    >
      Internal dispatch surface where navigators see live needs, offers, and
      graph matches. If no match is found, the request is added to a live queue
      waiting for its “mate.”
    </p>

    <div
      style={{
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit,minmax(0,1fr))",
        marginBottom: 10,
      }}
    >
      <NeedForm
        compact
        onMatches={(m) => {
          onMatches(m);
        }}
      />
      <OfferForm
        compact
        onMatches={(m) => {
          onMatches(m);
        }}
      />
    </div>

    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(148,163,184,0.6)",
        background: "rgba(15,23,42,0.9)",
        padding: 10,
      }}
    >
      <NavigatorMediationPanel matches={globalMatches} />
    </div>
  </div>
);

const AdminView: React.FC = () => (
  <div style={{ marginTop: 8 }}>
    <h3
      style={{
        margin: "0 0 4px",
        fontSize: ".9rem",
        color: "#e5e7eb",
      }}
    >
      Admin view (dark)
    </h3>
    <p
      style={{
        margin: "0 0 8px",
        fontSize: ".8rem",
        color: "#9ca3af",
      }}
    >
      Queue management, risk controls, and coverage planning live here. This is
      where Lumara stays safe, fair, and sustainable.
    </p>
    <ul
      style={{
        margin: 0,
        paddingLeft: "1.1rem",
        fontSize: ".8rem",
        color: "#cbd5f5",
      }}
    >
      <li>Live “unmatched” needs and offers</li>
      <li>Risk / severity and escalation rules</li>
      <li>Coverage gaps by region and language</li>
      <li>Partner verification and tiering</li>
    </ul>
  </div>
);

const GraphView: React.FC<{ matches: MatchResult[] }> = ({ matches }) => (
  <div style={{ marginTop: 8 }}>
    <h3
      style={{
        margin: "0 0 4px",
        fontSize: ".9rem",
        color: "#e5e7eb",
      }}
    >
      Resource graph view (dark)
    </h3>
    <p
      style={{
        margin: "0 0 8px",
        fontSize: ".8rem",
        color: "#9ca3af",
      }}
    >
      Future home of a live graph visualization. For now, it shows the same
      matches the agent sees, so you can narrate how the graph would behave.
    </p>
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(148,163,184,0.6)",
        background: "rgba(15,23,42,0.9)",
        padding: 10,
      }}
    >
      <NavigatorMediationPanel matches={matches} />
    </div>
  </div>
);

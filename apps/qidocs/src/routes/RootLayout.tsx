import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import React from "react";

// Lazy load with error boundaries
const Sidebar = React.lazy(() => import("../components/layout/Sidebar"));
const TopBar = React.lazy(() => import("../components/layout/TopBar"));
const GinaChatPanel = React.lazy(() => import("../components/gina/GinaChatPanel"));

const ComponentErrorFallback = ({ name }: { name: string }) => (
  <div style={{ padding: "20px", background: "#1e293b", color: "#ef4444", borderRadius: "8px", margin: "10px" }}>
    <p>Error loading {name}. Check console for details.</p>
  </div>
);

export default function RootLayout() {
  const location = useLocation();
  
  // Extract active realm and note from location
  const activeRealm = location.pathname.includes("/realm/")
    ? location.pathname.split("/realm/")[1]?.split("/")[0]
    : undefined;
  const activeNoteId = location.pathname.includes("/node/")
    ? location.pathname.split("/node/")[1]
    : undefined;

  console.log("RootLayout rendering", { activeRealm, activeNoteId });

  return (
    <div className="h-screen w-screen flex text-slate-100 relative z-10">
      <ErrorBoundary fallback={<ComponentErrorFallback name="Sidebar" />}>
        <React.Suspense fallback={<div style={{ width: "256px", background: "#1e293b" }}>Loading sidebar...</div>}>
          <Sidebar />
        </React.Suspense>
      </ErrorBoundary>
      
      <div className="flex flex-col flex-1 border-l border-slate-800/50 relative z-10">
        <ErrorBoundary fallback={<ComponentErrorFallback name="TopBar" />}>
          <React.Suspense fallback={<div style={{ height: "64px", background: "#1e293b" }}>Loading topbar...</div>}>
            <TopBar />
          </React.Suspense>
        </ErrorBoundary>
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      
      {/* Gina Chat Panel */}
      <ErrorBoundary fallback={null}>
        <React.Suspense fallback={null}>
          <GinaChatPanel activeRealm={activeRealm} activeNoteId={activeNoteId} />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}


import React from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load components to isolate errors
const RootLayout = React.lazy(() => import("./routes/RootLayout"));
const HomePage = React.lazy(() => import("./routes/HomePage"));
const RealmView = React.lazy(() => import("./routes/RealmView"));
const NodeView = React.lazy(() => import("./routes/NodeView"));
const GraphView = React.lazy(() => import("./routes/GraphView"));
const DocsView = React.lazy(() => import("./routes/DocsView"));
const DataIntakePage = React.lazy(() => import("./routes/DataIntakePage"));
const VaultSettings = React.lazy(() => import("./routes/VaultSettings"));
const VaultView = React.lazy(() => import("./routes/VaultView"));

function App() {
  console.log("App component rendering");
  
  return (
    <React.Suspense fallback={
      <div style={{ padding: "40px", color: "white", background: "#0f172a", minHeight: "100vh" }}>
        <h1>Loading QiNote...</h1>
        <p>If this doesn't go away, check console for errors</p>
      </div>
    }>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="realm/:realmId" element={<RealmView />} />
          <Route path="node/:qid" element={<NodeView />} />
          <Route path="docs/:qid" element={<DocsView />} />
          <Route path="graph" element={<GraphView />} />
          <Route path="ingest" element={<DataIntakePage />} />
          <Route path="vault" element={<VaultView />} />
          <Route path="vault-settings" element={<VaultSettings />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default App;


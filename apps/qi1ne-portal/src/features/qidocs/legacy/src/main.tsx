import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./styles/index.css";

// Debug logging
console.log("QiNote: Starting initialization");
console.log("Root element exists:", !!document.getElementById("root"));
console.log("React version:", React.version);

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 40px; color: red; font-family: system-ui;">Error: Root element not found!</div>';
  throw new Error("Root element #root not found in DOM!");
}

// Add a visible indicator that React is loading (will be replaced by React)
rootElement.innerHTML = '<div style="padding: 40px; color: white; background: #0f172a; font-family: system-ui; min-height: 100vh;"><h1>Loading QiNote...</h1><p>If this doesn\'t change, check console (F12) for errors.</p></div>';

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("QiNote: App rendered successfully");
} catch (error) {
  console.error("QiNote: Fatal error during render:", error);
  rootElement.innerHTML = `
    <div style="padding: 40px; color: white; font-family: system-ui; background: #0f172a; min-height: 100vh;">
      <h1 style="color: #ef4444;">Fatal Error</h1>
      <pre style="background: #1e293b; padding: 20px; border-radius: 8px; overflow: auto; color: #ef4444; margin: 20px 0;">${String(error)}</pre>
      <p style="color: #94a3b8; margin-top: 20px;">Check browser console (F12) for details</p>
      <div style="color: #94a3b8; margin-top: 20px;">
        <p><strong>Common fixes:</strong></p>
        <ul style="margin-left: 20px;">
          <li>Run: npm install</li>
          <li>Check browser console for import errors</li>
          <li>Verify .env file exists</li>
          <li>Check terminal for build errors</li>
        </ul>
      </div>
    </div>
  `;
}


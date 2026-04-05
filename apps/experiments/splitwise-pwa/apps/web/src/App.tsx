import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./state/useAuth";
import { useOutbox } from "./state/useOutbox";
import { api } from "./lib/api";
import { db } from "./lib/dexie";
import { Login } from "./routes/Login";
import { Home } from "./routes/Home";
import { Space } from "./routes/Space";
import { AddExpense } from "./routes/AddExpense";
import { SettlePlan } from "./routes/SettlePlan";
import { AuthVerify } from "./routes/AuthVerify";
import { SyncBanner } from "./components/SyncBanner";

const queryClient = new QueryClient();

function AppContent() {
  const { user, setUser, isLoading } = useAuth();
  const { setPending } = useOutbox();

  useEffect(() => {
    // Check auth on mount
    api.auth
      .getMe()
      .then((data: any) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      });

    // Request storage persistence
    if (navigator.storage?.persist) {
      navigator.storage.persist().then((granted) => {
        console.log("Storage persistence:", granted ? "granted" : "denied");
      });
    }

    // Poll outbox count
    const pollOutbox = async () => {
      try {
        const count = await db.outbox.count();
        setPending(count);
      } catch (error) {
        console.error("Failed to poll outbox", error);
      }
    };

    pollOutbox();
    const interval = setInterval(pollOutbox, 5000);

    return () => clearInterval(interval);
  }, []);

  // beforeunload handler
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const outbox = useOutbox.getState();
      if (outbox.pending > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Auth verify route - accessible without login */}
        <Route path="/auth/verify" element={<AuthVerify />} />
        
        {/* Protected routes */}
        {user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/spaces/:id" element={<Space />} />
            <Route path="/spaces/:id/add-expense" element={<AddExpense />} />
            <Route path="/spaces/:id/settle" element={<SettlePlan />} />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SyncBanner />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

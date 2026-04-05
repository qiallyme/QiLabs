import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import GoalsPage from "./pages/GoalsPage";
import TimelinePage from "./pages/TimelinePage";
import DocumentsPage from "./pages/DocumentsPage";
import ChatsPage from "./pages/ChatsPage";
import EvidencePage from "./pages/EvidencePage";
import "./styles/main.css";

function App() {
  return (
    <Router>
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
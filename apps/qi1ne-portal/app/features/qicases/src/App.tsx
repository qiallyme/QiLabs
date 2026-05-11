import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

type View = 'jobs' | 'cases' | 'chat';

interface Case {
  Id: number;
  case_name: string;
  cause_number?: string;
  court?: string;
  status?: string;
  summary?: string;
  Filed?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('cases');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am GINA, your legal assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch Cases
  const fetchCases = async () => {
    try {
      console.log('Fetching cases from:', `${API_BASE_URL}/cases`);
      const resp = await fetch(`${API_BASE_URL}/cases`);
      const data = await resp.json();
      setCases(data);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'cases') fetchCases();
  }, [currentView]);

  // Job Polling Logic
  useEffect(() => {
    let interval: any;
    if (activeJobId && (jobStatus?.status !== 'finished' && jobStatus?.status !== 'failed')) {
      interval = setInterval(async () => {
        try {
          const resp = await fetch(`${API_BASE_URL}/jobs/${activeJobId}`);
          const data = await resp.json();
          setJobStatus(data);
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeJobId, jobStatus]);

  const enqueuePing = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/jobs/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Ping from Ops Dashboard" })
      });
      const data = await resp.json();
      setActiveJobId(data.job_id);
      setJobStatus({ status: 'queued' });
    } catch (err) {
      alert('Failed to enqueue job');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return;
    
    const userMsg = chatInput;
    setMessages((prev: Message[]) => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsSending(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await resp.json();
      setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="root">
      <aside className="sidebar">
        <div className="logo">FCFCU OPS</div>
        <nav>
          <div 
            className={`nav-link ${currentView === 'cases' ? 'active' : ''}`}
            onClick={() => setCurrentView('cases')}
          >
            📋 Cases
          </div>
          <div 
            className={`nav-link ${currentView === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentView('chat')}
          >
            🤖 AI Chat
          </div>
          <div 
            className={`nav-link ${currentView === 'jobs' ? 'active' : ''}`}
            onClick={() => setCurrentView('jobs')}
          >
            ⚙️ Jobs
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {currentView === 'cases' && (
          <div className="view">
            <header className="view-header">
              <h1>Case Management</h1>
              <p>View and organize legal cases directly from NocoDB.</p>
            </header>
            <div className="glass-card">
              <table className="case-table">
                <thead>
                  <tr>
                    <th>Case Name</th>
                    <th>Cause #</th>
                    <th>Status</th>
                    <th>Filed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.Id}>
                      <td><strong>{c.case_name}</strong></td>
                      <td>{c.cause_number || 'N/A'}</td>
                      <td>
                        <span className="status-badge">{c.status}</span>
                      </td>
                      <td>{c.Filed || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'chat' && (
          <div className="view">
            <header className="view-header">
              <h1>AI Legal Assistant</h1>
              <p>Chat with GINA for research and case analysis.</p>
            </header>
            <div className="glass-card chat-container">
              <div className="messages-list">
                {messages.map((m, i) => (
                  <div key={i} className={`message ${m.role}`}>
                    {m.content}
                  </div>
                ))}
                {isSending && <div className="message assistant">Typing...</div>}
              </div>
              <div className="chat-input-area">
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask GINA anything about the cases..."
                />
                <button onClick={handleSendMessage} disabled={isSending}>Send</button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'jobs' && (
          <div className="view">
            <header className="view-header">
              <h1>Background Jobs</h1>
              <p>Monitor and trigger Redis/RQ tasks.</p>
            </header>
            <div className="grid-container">
              <div className="glass-card">
                <h3>Actions</h3>
                <button onClick={enqueuePing} style={{ width: '100%' }}>Send Ping Job</button>
              </div>
              <div className="glass-card">
                <h3>Active Job Status</h3>
                {activeJobId ? (
                  <div>
                    <p><strong>ID:</strong> {activeJobId}</p>
                    <p><strong>Status:</strong> <span className="status-badge">{jobStatus?.status || 'unknown'}</span></p>
                    {jobStatus?.result && (
                      <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                        {JSON.stringify(jobStatus.result, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <p>No active job being tracked.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

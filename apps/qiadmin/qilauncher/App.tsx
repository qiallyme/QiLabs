// apps/qilauncher/App.tsx
// Canonical App entrypoint for QiLauncher web admin
import { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/layout/Sidebar';
import { MobileHeader } from './components/layout/MobileHeader';
import { PageHeader } from './components/dashboard/PageHeader';
import { HealthWidget } from './components/dashboard/HealthWidget';
import { QueueWidget } from './components/dashboard/QueueWidget';
import { WorkersWidget } from './components/dashboard/WorkersWidget';
import { StatCard } from './components/dashboard/StatCard';
import { DeploymentsTable } from './components/dashboard/DeploymentsTable';
import { ChatSidebar } from './components/chat/ChatSidebar';
import { HealthView } from './components/views/HealthView';
import { QueueView } from './components/views/QueueView';
import { WorkersView } from './components/views/WorkersView';
import { SettingsView } from './components/views/SettingsView';
import { JobsView } from './components/views/JobsView';
import { QiLauncherClient } from './api/client';
import { AdminClient } from './api/adminClient';
import type {
  SystemStatus,
  HealthStats,
  QueueStats,
  WorkersStats,
  Deployment,
  ChatMessage,
  User,
} from './types';
import './styles.css';

const MOCK_USER: User = {
  id: 'admin',
  name: 'Admin User',
  avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff',
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'gina',
    text: "Morning. I'm watching your queues. Try not to break anything before coffee.",
    timestamp: '10:02 AM',
    type: 'text',
  },
];

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('operational');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [health, setHealth] = useState<HealthStats>({
    uptimePercent: 0,
    cpuLoadPercent: 0,
    memoryLoadPercent: 0,
  });
  const [queue, setQueue] = useState<QueueStats>({
    pendingJobs: 0,
    processedCount: 0,
    failedCount: 0,
  });
  const [workers, setWorkers] = useState<WorkersStats>({
    activeNodes: 0,
    totalNodes: 0,
    workers: [],
  });
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount and periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, queueData, workersData, deploymentsData] = await Promise.all([
          QiLauncherClient.getHealth().catch(() => ({ status: 'down', db_path: '' })),
          QiLauncherClient.getQueueStats().catch(() => ({ pendingJobs: 0, processedCount: 0, failedCount: 0 })),
          QiLauncherClient.getWorkers().catch(() => ({ activeNodes: 0, totalNodes: 0, workers: [] })),
          QiLauncherClient.getDeployments().catch(() => []),
        ]);

        setSystemStatus(healthData.status === 'ok' ? 'operational' : 'down');
        setHealth({
          uptimePercent: healthData.status === 'ok' ? 99.98 : 0,
          cpuLoadPercent: 34, // TODO: get from backend
          memoryLoadPercent: 62, // TODO: get from backend
        });
        setQueue(queueData);
        setWorkers(workersData);
        setDeployments(deploymentsData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setSystemStatus('down');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    try {
      const [healthData, queueData, workersData, deploymentsData] = await Promise.all([
        QiLauncherClient.getHealth().catch(() => ({ status: 'down', db_path: '' })),
        QiLauncherClient.getQueueStats().catch(() => ({ pendingJobs: 0, processedCount: 0, failedCount: 0 })),
        QiLauncherClient.getWorkers().catch(() => ({ activeNodes: 0, totalNodes: 0, workers: [] })),
        QiLauncherClient.getDeployments().catch(() => []),
      ]);

      setSystemStatus(healthData.status === 'ok' ? 'operational' : 'down');
      setHealth({
        uptimePercent: healthData.status === 'ok' ? 99.98 : 0,
        cpuLoadPercent: 34,
        memoryLoadPercent: 62,
      });
      setQueue(queueData);
      setWorkers(workersData);
      setDeployments(deploymentsData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleExportLogs = async () => {
    try {
      const logs = await AdminClient.getLogs();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qios-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
      alert('Failed to export logs. Check console for details.');
    }
  };

  const handleSendMessage = async (text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: now,
      type: 'text',
    };
    setMessages(prev => [...prev, userMsg]);

    // Call real /gina/chat endpoint
    try {
      const allMessages = [
        ...messages.map(m => ({
          role: m.sender === 'gina' ? 'assistant' : 'user',
          content: m.text,
        })),
        { role: 'user', content: text },
      ];
      
      const response = await QiLauncherClient.sendGinaMessage(allMessages);
      const ginaMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'gina',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        toolSuggestions: response.tool_suggestions,
      };
      setMessages(prev => [...prev, ginaMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'gina',
        text: `Error: ${error instanceof Error ? error.message : 'Failed to connect to GINA'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleInvokeTool = async (tool: string, args: Record<string, any>, label: string) => {
    try {
      const result = await QiLauncherClient.invokeTool(tool, args);
      
      if (result.ok) {
        const successMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'gina',
          text: `✅ ${label} completed successfully. ${JSON.stringify(result.result, null, 2)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        };
        setMessages(prev => [...prev, successMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'gina',
          text: `❌ ${label} failed: ${result.error || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Failed to invoke tool:', error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'gina',
        text: `❌ Failed to invoke tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const renderMainContent = () => {
    switch (currentPath) {
      case '/health':
        return <HealthView health={health} loading={loading} />;
      case '/queue':
        return <QueueView queue={queue} loading={loading} onRefresh={handleRefresh} />;
      case '/workers':
        return <WorkersView workers={workers} loading={loading} onRefresh={handleRefresh} />;
      case '/jobs':
        return <JobsView />;
      case '/settings':
        return <SettingsView />;
      case '/dashboard':
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Health Status" accentColor="emerald">
                <HealthWidget
                  uptime={health.uptimePercent}
                  cpuLoad={health.cpuLoadPercent}
                  memoryLoad={health.memoryLoadPercent}
                />
              </StatCard>

              <StatCard title="Job Queue" accentColor="amber">
                <QueueWidget
                  pendingJobs={queue.pendingJobs}
                  processedCount={queue.processedCount}
                  failedCount={queue.failedCount}
                />
              </StatCard>

              <StatCard title="Active Workers" accentColor="purple">
                <WorkersWidget
                  activeNodes={workers.activeNodes}
                  totalNodes={workers.totalNodes}
                  workers={workers.workers}
                />
              </StatCard>
            </div>

            <DeploymentsTable
              deployments={deployments}
              onFilter={() => { /* later */ }}
              onRefresh={async () => {
                const data = await QiLauncherClient.getDeployments();
                setDeployments(data);
              }}
            />
          </>
        );
    }
  };

  const getPageTitle = () => {
    switch (currentPath) {
      case '/health':
        return 'System Health';
      case '/queue':
        return 'Ingestion Queue';
      case '/workers':
        return 'Workers';
      case '/settings':
        return 'Settings';
      default:
        return 'System Overview';
    }
  };

  const main = (
    <>
      <MobileHeader onToggleMenu={() => { /* optional mobile sidebar toggle */ }} />

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
        {currentPath !== '/settings' && (
          <PageHeader
            title={getPageTitle()}
            systemStatus={systemStatus}
            onExportLogs={handleExportLogs}
          />
        )}

        {loading && currentPath === '/dashboard' ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading...</div>
          </div>
        ) : (
          renderMainContent()
        )}
      </div>
    </>
  );

  return (
    <AppLayout
      sidebar={
        <Sidebar
          currentPath={currentPath}
          user={MOCK_USER}
          onNavigate={setCurrentPath}
        />
      }
      main={main}
      chat={
        <ChatSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          onClearChat={() => setMessages(INITIAL_MESSAGES)}
          onInvokeTool={handleInvokeTool}
        />
      }
    />
  );
}


// apps/qilauncher/components/views/SettingsView.tsx
import { Settings, Database, Server, RefreshCw, Plug, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AdminClient } from '../../api/adminClient';
import { QiLauncherClient } from '../../api/client';
import { useState, useEffect } from 'react';

interface IntegrationStatus {
  name: string;
  configured: boolean;
  token_status?: string;
  token_expires?: string;
  imap_configured?: boolean;
  smtp_configured?: boolean;
  capabilities?: string[];
  note?: string;
}

export function SettingsView() {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({});
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const data = await QiLauncherClient.getIntegrationsStatus();
        setIntegrations(data.integrations);
      } catch (error) {
        console.error('Failed to fetch integration status:', error);
      } finally {
        setLoadingIntegrations(false);
      }
    };
    fetchIntegrations();
  }, []);

  const handleAction = async (action: 'REBUILD_INDEX' | 'RESCAN_VAULT' | 'CLEAR_LOGS') => {
    console.log('[SettingsView] handleAction called:', action);
    setActionLoading(action);
    try {
      console.log('[SettingsView] Calling AdminClient.triggerAction...');
      const result = await AdminClient.triggerAction(action);
      console.log('[SettingsView] Action result:', result);
      alert(result.message || 'Action completed');
    } catch (error) {
      console.error('[SettingsView] Action error:', error);
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatExpiry = (expires?: string) => {
    if (!expires) return null;
    try {
      const date = new Date(expires);
      return date.toLocaleString();
    } catch {
      return expires;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Database</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Connection</span>
              <span className="text-emerald-400 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Location</span>
              <span className="text-white text-sm font-mono">data/vector/qios_local.db</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">API Server</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 text-sm">Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">URL</span>
              <span className="text-white text-sm font-mono">http://localhost:7130</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Plug className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Integrations</h3>
        </div>
        {loadingIntegrations ? (
          <div className="text-slate-400 text-sm">Loading integration status...</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(integrations).map(([key, integration]) => (
              <div key={key} className="border border-white/10 rounded-lg p-4 bg-slate-900/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {integration.configured ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="font-medium text-white">{integration.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    integration.configured 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    {integration.configured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                
                {integration.note && (
                  <div className="flex items-start gap-2 mb-2 text-xs text-amber-400">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{integration.note}</span>
                  </div>
                )}
                
                {integration.token_status && integration.token_status !== 'not_configured' && (
                  <div className="text-xs text-slate-400 mb-2">
                    Token: <span className="text-emerald-400">Active</span>
                    {integration.token_expires && (
                      <span className="ml-2">(expires: {formatExpiry(integration.token_expires)})</span>
                    )}
                  </div>
                )}
                
                {integration.imap_configured !== undefined && (
                  <div className="text-xs text-slate-400 mb-2">
                    IMAP: <span className={integration.imap_configured ? 'text-emerald-400' : 'text-slate-500'}>
                      {integration.imap_configured ? 'Configured' : 'Not Configured'}
                    </span>
                    {' | '}
                    SMTP: <span className={integration.smtp_configured ? 'text-emerald-400' : 'text-slate-500'}>
                      {integration.smtp_configured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                )}
                
                {integration.capabilities && integration.capabilities.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-500 mb-1">Capabilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {integration.capabilities.map((cap, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-slate-800/50 text-slate-300 rounded">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {Object.keys(integrations).length === 0 && (
              <div className="text-slate-400 text-sm">No integrations found.</div>
            )}
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">System Actions</h3>
        </div>
        <div className="space-y-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[SettingsView] Rebuild Index button clicked');
              handleAction('REBUILD_INDEX');
            }}
            disabled={actionLoading !== null}
            className="w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-between border border-white/10 cursor-pointer"
            type="button"
          >
            <span>Rebuild Index</span>
            <RefreshCw className={`w-4 h-4 ${actionLoading === 'REBUILD_INDEX' ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[SettingsView] Rescan Vault button clicked');
              handleAction('RESCAN_VAULT');
            }}
            disabled={actionLoading !== null}
            className="w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-between border border-white/10 cursor-pointer"
            type="button"
          >
            <span>Rescan Vault</span>
            <RefreshCw className={`w-4 h-4 ${actionLoading === 'RESCAN_VAULT' ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[SettingsView] Clear Logs button clicked');
              handleAction('CLEAR_LOGS');
            }}
            disabled={actionLoading !== null}
            className="w-full px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-between border border-white/10 cursor-pointer"
            type="button"
          >
            <span>Clear Logs</span>
            <RefreshCw className={`w-4 h-4 ${actionLoading === 'CLEAR_LOGS' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}


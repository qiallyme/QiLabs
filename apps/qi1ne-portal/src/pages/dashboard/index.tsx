import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Folder, Book, Gavel, DollarSign, Plus, 
  MessageSquare, ExternalLink, Search, Clock, ArrowLeft,
  Briefcase, FileText, ChevronRight, Sparkles, User, LogOut, Settings, Home,
  Bell, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStats } from '@/hooks/useStats';
import { cn } from '@/lib/utils';

const moduleIconMap: any = {
  cases: Gavel,
  vault: Folder,
  knowledge: Book,
  tax: DollarSign,
  qihome: Home,
};

const moduleColorMap: any = {
  cases: 'from-blue-600 to-indigo-700 shadow-blue-500/20',
  vault: 'from-amber-500 to-orange-700 shadow-amber-500/20',
  knowledge: 'from-emerald-600 to-teal-800 shadow-emerald-500/20',
  tax: 'from-rose-600 to-pink-800 shadow-rose-500/20',
  qihome: 'from-cyan-600 to-blue-800 shadow-cyan-500/20',
};

// Auto-magically derives URLs based on the environment and the Qially rules
function getAppUrl(slug: string): string {
  // Strip "qi" prefix or "s" plural if it exists to match subdomain naming rules
  let cleanName = slug.toLowerCase().replace(/^qi/, '');
  if (cleanName === 'cases') cleanName = 'case'; 
  
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isLocal) {
    // Local development port mapping
    const localPorts: Record<string, string> = {
      case: '5175',
      care: '5176',
      message: '5177',
      docs: '5178',
      vault: '5179',
      admin: '5180'
    };
    return `http://localhost:${localPorts[cleanName] || '5173'}`;
  }
  
  // Production auto-routing (e.g., care.qially.com)
  return `https://${cleanName}.qially.com`;
}

export default function Dashboard() {
  const { profile, user, modules, signOut } = useAuth();
  const { stats } = useStats();
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchRecentFiles();
  }, [user]);

  const fetchRecentFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setRecentFiles(data || []);
    } catch (err) {
      console.warn('Failed to load recent files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-12">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-0.5 bg-purple-600/10 border border-purple-600/20 rounded-full">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[2px]">Canonical Node Active</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome, <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{profile?.full_name?.split(' ')[0] || 'Operator'}</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">System uptime 99.9% • Multi-tenant RLS Isolation Active</p>
        </div>
      </header>

      {/* Modules Grid */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
          <h2 className="text-xl font-bold tracking-tight text-white">Active Domains</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m) => {
            const Icon = moduleIconMap[m.slug] || Folder;
            const colorClass = moduleColorMap[m.slug] || 'from-gray-600 to-gray-800';
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/${m.slug}`)}
                className="group relative h-48 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 text-left transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-95"
              >
                <div className={cn(
                  "w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:rotate-6 group-hover:scale-110 text-white",
                  colorClass
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 leading-none">{m.name}</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2">{m.description}</p>
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="text-white/40" />
                </div>
              </button>
            );
          })}
          
          <button className="h-48 border-2 border-dashed border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-purple-600/50 hover:bg-purple-600/5 transition-all group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/20 group-hover:text-purple-400 transition-colors">
              <Plus className="text-gray-600 group-hover:text-purple-400" />
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Request Module</div>
          </button>
        </div>
      </section>

      {/* Artifacts & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-bold tracking-tight text-white">Ingested Lineage</h2>
            </div>
            <button 
              onClick={() => navigate('/vault')}
              className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tight"
            >
              View Vault
            </button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden">
            {loadingFiles ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600/30 border-b-blue-600 rounded-full animate-spin" />
              </div>
            ) : recentFiles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3 opacity-50">
                <FileText size={32} className="text-gray-600" />
                <p className="text-sm font-medium text-gray-600">No artifacts detected</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {recentFiles.map((file) => (
                  <div key={file.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-0.5 group-hover:text-blue-400 transition-colors">{file.title || file.name || 'Untitled Artifact'}</h4>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-tight">{file.category || 'artifact'}</span>
                           <span className="text-[10px] text-gray-600 font-medium">Synced {new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/20 rounded-[32px] p-8">
            <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles size={24} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Qially Assistant</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Query your legal matters or financial records using natural language.
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              <MessageSquare size={16} className="text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-[2px] text-white">Initialize AI</span>
            </button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Lineage Metrics</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Active Matters</span>
                <span className="text-sm font-bold text-blue-400">{stats.activeMatters}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Vault Artifacts</span>
                <span className="text-sm font-bold text-amber-500">{stats.vaultArtifacts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Compliance</span>
                <span className="text-sm font-bold text-emerald-400">{stats.complianceScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Integration */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#0d0d0f]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
           <div className="p-6 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20 text-white">
                    <Sparkles size={16} />
                 </div>
                 <h5 className="font-bold text-sm tracking-tight text-white">Qially Intelligence</h5>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-2 text-gray-500 hover:text-white"><X size={18} /></button>
           </div>
           <div className="flex-1 p-6 text-sm text-gray-400 leading-relaxed">
              Operator identified. System status nominal. How can I assist with your current matters?
           </div>
           <div className="p-6 pt-0">
              <input
                type="text"
                placeholder="Type a command..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
           </div>
        </div>
      )}
    </div>
  );
}

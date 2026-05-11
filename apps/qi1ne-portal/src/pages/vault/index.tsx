import { useVault } from '@/hooks/useVault';
import { Shield, Plus, Search, FileText, Download, ExternalLink, HardDrive, Clock, Tag } from 'lucide-react';

export default function VaultPage() {
  const { documents, loading } = useVault();

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'receipt': return <Tag className="w-5 h-5 text-green-400" />;
      default: return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            Artifact Vault
          </h1>
          <p className="text-gray-400 mt-1">Secure repository for legal artifacts, contracts, and financial receipts.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20">
          <Plus className="w-5 h-5" />
          Ingest Artifact
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Categories</h3>
            <nav className="space-y-1">
              {['All Artifacts', 'Contracts', 'Financials', 'Legal Discovery', 'Archive'].map((cat, i) => (
                <button 
                  key={cat} 
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${i === 0 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-5 h-5 text-gray-500" />
              <h3 className="text-sm font-bold text-white">Storage Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[65%]" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">1.2 GB of 2.0 GB used</span>
                <span className="text-blue-400">65%</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search vault by name, ID, or content..." 
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                />
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-white/[0.01] animate-pulse rounded-2xl border border-white/5" />
                ))
              ) : documents.length === 0 ? (
                <div className="col-span-2 py-20 text-center text-gray-500">
                  No artifacts registered in your vault.
                </div>
              ) : documents.map((doc) => (
                <div key={doc.id} className="group bg-white/[0.02] border border-white/5 hover:border-blue-500/30 p-5 rounded-[24px] transition-all hover:scale-[1.01] hover:bg-white/[0.04]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white/[0.05] rounded-xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                      {getDocIcon(doc.doc_type)}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {doc.archive?.original_filename || 'Unknown Document'}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                        {doc.doc_type}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${doc.status === 'executed' ? 'text-green-400' : 'text-blue-400'}`}>
                      {doc.status}
                    </span>
                    <span className="text-[10px] font-mono text-gray-600">{doc.archive_id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

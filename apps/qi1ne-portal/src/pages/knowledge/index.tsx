import { useKnowledge } from '@/hooks/useKnowledge';
import { Book, Plus, Search, Hash, Lock, Globe, FileText, Calendar, ArrowRight } from 'lucide-react';

export default function KnowledgePage() {
  const { notes, loading } = useKnowledge();

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-600/20 rounded-xl border border-amber-500/30">
              <Book className="w-6 h-6 text-amber-400" />
            </div>
            Research Domain
          </h1>
          <p className="text-gray-400 mt-1">Capture research, documentation, and institutional knowledge.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-900/20">
          <Plus className="w-5 h-5" />
          New Research Note
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Hash className="w-4 h-4" /> Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Legal', 'AI', 'Financial', 'Personal', 'Tech'].map(topic => (
                <button key={topic} className="px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  #{topic}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Privacy Levels</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Globe className="w-4 h-4 text-green-400" /> Public Notes
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Lock className="w-4 h-4 text-amber-400" /> Internal Only
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-red-400" /> Confidential
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search research notes, slugs, or content..." 
              className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-5 pl-16 pr-8 text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-all backdrop-blur-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-white/[0.01] animate-pulse rounded-[32px] border border-white/5" />
              ))
            ) : notes.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-gray-500 bg-white/[0.01] rounded-[32px] border border-dashed border-white/5">
                No research notes found. Start by creating a new note.
              </div>
            ) : notes.map((note) => (
              <div key={note.id} className="group bg-white/[0.03] border border-white/10 p-8 rounded-[32px] transition-all hover:bg-white/[0.05] hover:border-amber-500/30 cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-amber-600/20 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{note.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                  {note.content_md || 'No content provided.'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {note.sensitivity === 'confidential' ? <Lock className="w-3 h-3 text-red-400" /> : <Globe className="w-3 h-3 text-green-400" />}
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{note.sensitivity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCases } from '@/hooks/useCases';
import { Gavel, Plus, Search, Filter, MoreVertical, Briefcase } from 'lucide-react';

export default function CasesPage() {
  const { cases, loading } = useCases();

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
              <Gavel className="w-6 h-6 text-purple-400" />
            </div>
            Legal Domain
          </h1>
          <p className="text-gray-400 mt-1">Manage cases, deadlines, and legal documentation.</p>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/20">
          <Plus className="w-5 h-5" />
          Open New Case
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search cases, cause numbers..." 
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cause / Court</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-8 h-16 bg-white/[0.01]" />
                      </tr>
                    ))
                  ) : cases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                        No cases found in this domain.
                      </td>
                    </tr>
                  ) : cases.map((c) => (
                    <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">{c.case_name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{c.description || 'No description provided'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-300 font-mono">{c.case_number || 'PENDING'}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{c.court || 'Not Assigned'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-500 hover:text-white">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-purple-900/20">
            <Briefcase className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Legal Intelligence</h3>
            <p className="text-purple-100/70 text-sm leading-relaxed">
              Use the QiOne AI to analyze case documents, predict outcomes, and track element-level strength for every issue in your docket.
            </p>
            <button className="mt-6 w-full py-3 bg-white text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-colors">
              Run Analysis
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Due Today</span>
                  <span className="text-[10px] text-gray-500">2:00 PM</span>
                </div>
                <div className="text-sm text-white font-medium">Initial Disclosure Filing</div>
                <div className="text-[10px] text-gray-500 mt-1">Case: Smith v. Global Corp</div>
              </div>
              <p className="text-center text-xs text-gray-600 py-4">No other deadlines for this week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useTax } from '@/hooks/useTax';
import { Landmark, Plus, Search, Calendar, FileCheck, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function TaxPage() {
  const { returns, loading } = useTax();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'filed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 rounded-xl border border-emerald-500/30">
              <Landmark className="w-6 h-6 text-emerald-400" />
            </div>
            Financial Domain
          </h1>
          <p className="text-gray-400 mt-1">Track tax compliance, returns, and financial history.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20">
          <Plus className="w-5 h-5" />
          Prepare Return
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
          <div className="p-3 bg-emerald-600/20 w-fit rounded-xl mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Estimated Liability</div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
          <div className="p-3 bg-blue-600/20 w-fit rounded-xl mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Active Returns</div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
          <div className="p-3 bg-amber-600/20 w-fit rounded-xl mb-4">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">Apr 15</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Next Deadline</div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
          <div className="p-3 bg-purple-600/20 w-fit rounded-xl mb-4">
            <FileCheck className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">Verified</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Audit Status</div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Tax Returns History</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by year or type..." 
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-2 pl-12 pr-4 text-white text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax Year</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filing Kind</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Updated</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse h-16 bg-white/[0.01]" />
                ))
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-10 h-10 opacity-20" />
                      <p>No tax returns tracked yet.</p>
                    </div>
                  </td>
                </tr>
              ) : returns.map((ret) => (
                <tr key={ret.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{ret.tax_year}</div>
                  </td>
                  <td className="px-8 py-5 text-gray-300 font-medium">{ret.return_type}</td>
                  <td className="px-8 py-5 text-gray-500 uppercase text-[10px] tracking-widest">{ret.filing_kind}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(ret.status)}`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {new Date(ret.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-widest transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

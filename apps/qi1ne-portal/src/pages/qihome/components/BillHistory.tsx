import { useBills } from '../hooks/useBills';
import { Calendar, Tag, ChevronRight, Loader2, FileText } from 'lucide-react';

export default function BillHistory() {
  const { bills, loading } = useBills();

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-500 p-6">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm font-medium">Loading history...</span>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border-2 border-dashed border-white/10 rounded-3xl p-12 text-center">
        <FileText size={32} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">No bills recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <div key={bill.id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:bg-white/[0.05] transition-all group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                <Tag size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white">{bill.category}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500 font-medium uppercase tracking-tight">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(bill.billing_period).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border ${bill.is_finalized ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/30 text-amber-400 bg-amber-500/5'}`}>
                    {bill.is_finalized ? 'Finalized' : 'Estimate'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-4">
              <div>
                <div className="text-xl font-black text-white">
                  ${parseFloat(String(bill.amount_estimated)).toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">Total Bill</div>
              </div>
              <ChevronRight size={18} className="text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

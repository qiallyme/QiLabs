import { useState } from 'react';
import { useBills } from '../hooks/useBills';
import { Loader2, Receipt, Check } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
}

interface BillEntryProps {
  profiles: Profile[];
}

export default function BillEntry({ profiles }: BillEntryProps) {
  const [bill, setBill] = useState({ category: '', amount: 0 });
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { logBill } = useBills();

  const handleSave = async () => {
    try {
      setProcessing(true);
      setSuccess(false);
      const res = await logBill({
        category: bill.category,
        amount_estimated: bill.amount,
        billing_period: new Date().toISOString().split('T')[0]
      }, splits);

      if (res.success) {
        setSuccess(true);
        setBill({ category: '', amount: 0 });
        setSplits({});
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full" />
        Log New Bill Estimate
      </h2>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 block">Category</label>
          <input 
            placeholder="e.g. Electric, Water, Internet" 
            className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-medium placeholder:text-gray-600"
            value={bill.category}
            onChange={(e) => setBill({...bill, category: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 block">Total Amount</label>
          <input 
            type="number" 
            placeholder="0.00" 
            className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-mono font-medium placeholder:text-gray-600"
            value={bill.amount || ''}
            onChange={(e) => setBill({...bill, amount: parseFloat(e.target.value) || 0})}
          />
        </div>
        
        <div className="pt-4 border-t border-white/5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Assign Splits</label>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {profiles.map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5 sm:border-none sm:p-0">
                <span className="text-sm text-gray-400 sm:w-32 truncate font-medium">{p.username}</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full sm:flex-1 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2.5 px-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all placeholder:text-gray-600"
                  value={splits[p.id] || ''}
                  onChange={(e) => setSplits({...splits, [p.id]: parseFloat(e.target.value) || 0})}
                />
              </div>
            ))}
          </div>
        </div>

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center gap-2">
            <Check size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold tracking-tight">Bill logged successfully!</span>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={processing || !bill.category || !bill.amount}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-bold tracking-widest uppercase text-xs transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : <Receipt size={16} />}
          {processing ? 'Processing...' : 'Push to Ledger'}
        </button>
      </div>
    </div>
  );
}

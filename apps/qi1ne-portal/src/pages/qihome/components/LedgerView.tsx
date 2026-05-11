import { useLedger } from '../hooks/useLedger';
import { Wallet, ArrowRightLeft, Loader2 } from 'lucide-react';

export default function LedgerView() {
  const { balances, loading, settleBalance } = useLedger();

  const handleSettle = async (userId: string, username: string, amount: string) => {
    if (parseFloat(amount) === 0) return;
    const confirmed = window.confirm(`Settle balance for ${username}? This will add a credit entry to zero out the debt.`);
    if (confirmed) {
      const result = await settleBalance(userId, parseFloat(amount), `Settlement for ${username}`);
      if (!result.success) alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-500 p-6">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm font-medium">Loading balances...</span>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
        <Wallet size={32} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-medium">No ledger balances found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {balances.map((b) => (
        <div key={b.user_id} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.05] transition-all group gap-6 sm:gap-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400">
              <Wallet size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg leading-none mb-1">{b.username}</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Current Balance</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="text-left sm:text-right">
              <div className={`text-2xl font-black ${parseFloat(b.balance) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {parseFloat(b.balance) < 0 ? '-' : ''}${Math.abs(parseFloat(b.balance)).toFixed(2)}
              </div>
            </div>

            {parseFloat(b.balance) !== 0 && (
               <button 
                onClick={() => handleSettle(b.user_id, b.username, b.balance)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-95"
                title="Settle Balance"
               >
                 <ArrowRightLeft size={18} />
               </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserBalance {
  user_id: string;
  username: string;
  balance: string;
  tenant_id?: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  reference_id: string | null;
  entry_type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  tenant_id: string;
  created_at: string;
}

export function useLedger() {
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const fetchHouseholdId = async (): Promise<string | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('qione.profiles')
        .select('household_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      const profileData = data as any;
      setHouseholdId(profileData.household_id);
      return profileData.household_id;
    } catch (error: any) {
      console.error('Error fetching household:', error.message);
    }
  };

  const fetchLedgerData = async (hId?: string | null) => {
    try {
      setLoading(true);
      const targetHId = hId || householdId;
      if (!targetHId) return;

      // Fetch User Balances
      const { data: balanceData, error: balanceError } = await supabase
        .schema('qihome')
        .from('v_user_balances')
        .select('user_id, username, balance')
        .eq('tenant_id', targetHId);
      
      if (balanceError) throw balanceError;
      setBalances((balanceData as UserBalance[]) || []);

      // Fetch Recent Transactions
      const { data: transData, error: transError } = await supabase
        .schema('qihome')
        .from('ledger_entries')
        .select('*')
        .eq('tenant_id', targetHId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transError) throw transError;
      setTransactions((transData as LedgerEntry[]) || []);

    } catch (error: any) {
      console.error('Error fetching ledger data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const settleBalance = async (targetUserId: string, amount: number, description = 'Manual Settlement') => {
    try {
      if (!householdId) throw new Error("Household context missing");
      
      const { error } = await supabase
        .schema('qihome')
        .from('ledger_entries')
        .insert([{
          user_id: targetUserId,
          entry_type: 'CREDIT',
          amount: Math.abs(amount),
          description: description,
          tenant_id: householdId
        }]);

      if (error) throw error;
      fetchLedgerData();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const init = async () => {
      const hId = await fetchHouseholdId();
      if (hId) fetchLedgerData(hId);
    };
    init();
    
    const subscription = supabase
      .channel('ledger-changes')
      .on('postgres_changes', { event: '*', schema: 'qihome', table: 'ledger_entries' }, () => {
        fetchLedgerData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { balances, transactions, loading, settleBalance, refresh: fetchLedgerData };
}

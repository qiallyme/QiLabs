import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Bill {
  id: string;
  category: string;
  amount_estimated: number;
  billing_period: string;
  is_finalized: boolean;
  tenant_id: string;
  created_at: string;
}

export interface BillSplit {
  bill_id: string;
  user_id: string;
  share_amount_estimated: number;
  tenant_id: string;
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
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

  const fetchBills = async (hId?: string | null) => {
    try {
      const targetHId = hId || householdId;
      if (!targetHId) return;

      setLoading(true);
      const { data, error } = await supabase
        .schema('qihome')
        .from('bills')
        .select('*')
        .eq('tenant_id', targetHId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBills((data as Bill[]) || []);
    } catch (error: any) {
      console.error('Error fetching bills:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const logBill = async (
    billData: { category: string; amount_estimated: number; billing_period: string },
    splits: Record<string, number>
  ) => {
    try {
      if (!householdId) throw new Error("Household ID not found. Please refresh.");

      // 1. Insert Master Bill
      const { data: bill, error: billError } = await supabase
        .schema('qihome')
        .from('bills')
        .insert([{ ...billData, tenant_id: householdId }])
        .select()
        .single();

      if (billError) throw billError;

      // 2. Insert Shares
      const shareEntries = Object.entries(splits).map(([uid, amt]) => ({
        bill_id: bill.id,
        user_id: uid,
        share_amount_estimated: amt,
        tenant_id: householdId
      }));
      
      const { error: shareError } = await supabase
        .schema('qihome')
        .from('bill_shares')
        .insert(shareEntries);
      if (shareError) throw shareError;

      // 3. Insert Ledger Entries
      const ledgerEntries = Object.entries(splits).map(([uid, amt]) => ({
        user_id: uid,
        reference_id: bill.id,
        entry_type: 'DEBIT',
        amount: amt,
        description: `Estimated ${billData.category}`,
        tenant_id: householdId
      }));

      const { error: ledgerError } = await supabase
        .schema('qihome')
        .from('ledger_entries')
        .insert(ledgerEntries);
      if (ledgerError) throw ledgerError;

      fetchBills(); // Refresh history
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    const init = async () => {
      const hId = await fetchHouseholdId();
      if (hId) fetchBills(hId);
    };
    init();
  }, []);

  return { bills, loading, logBill, refresh: fetchBills };
}

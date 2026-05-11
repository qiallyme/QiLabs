import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface TaxReturn {
  id: string;
  tax_year: number;
  return_type: string;
  filing_kind: 'original' | 'amended';
  status: 'intake' | 'prep' | 'review' | 'signature' | 'ready_to_file' | 'filed' | 'accepted' | 'rejected';
  summary: any;
  created_at: string;
}

export function useTax() {
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  const fetchHouseholdId = async (): Promise<string | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('qione.profiles').select('household_id').eq('id', user.id).single();
      if (error) throw error;
      setHouseholdId(data.household_id);
      return data.household_id;
    } catch (err) { console.error(err); }
  };

  const fetchReturns = async (hId?: string | null) => {
    try {
      const targetHId = hId || householdId;
      if (!targetHId) return;
      setLoading(true);
      const { data, error } = await supabase.schema('qitax').from('returns').select('*').eq('tenant_id', targetHId).order('tax_year', { ascending: false });
      if (error) throw error;
      setReturns(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      const hId = await fetchHouseholdId();
      if (hId) fetchReturns(hId);
    };
    init();
  }, []);

  return { returns, loading, refresh: fetchReturns };
}

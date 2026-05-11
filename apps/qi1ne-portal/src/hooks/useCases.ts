import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Case {
  id: string;
  case_name: string;
  case_number: string | null;
  court: string | null;
  judge: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
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

  const fetchCases = async (hId?: string | null) => {
    try {
      const targetHId = hId || householdId;
      if (!targetHId) return;
      setLoading(true);
      const { data, error } = await supabase.schema('qicase').from('cases').select('*').eq('tenant_id', targetHId).order('created_at', { ascending: false });
      if (error) throw error;
      setCases(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      const hId = await fetchHouseholdId();
      if (hId) fetchCases(hId);
    };
    init();
  }, []);

  return { cases, loading, refresh: fetchCases };
}

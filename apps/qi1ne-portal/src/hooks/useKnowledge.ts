import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface KnowledgeNote {
  id: string;
  title: string;
  slug: string;
  content_md: string | null;
  sensitivity: 'public' | 'internal' | 'confidential';
  meta: any;
  created_at: string;
}

export function useKnowledge() {
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
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

  const fetchNotes = async (hId?: string | null) => {
    try {
      const targetHId = hId || householdId;
      if (!targetHId) return;
      setLoading(true);
      const { data, error } = await supabase.schema('qiknowledge').from('notes').select('*').eq('tenant_id', targetHId).order('created_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      const hId = await fetchHouseholdId();
      if (hId) fetchNotes(hId);
    };
    init();
  }, []);

  return { notes, loading, refresh: fetchNotes };
}

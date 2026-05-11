import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface VaultDocument {
  id: string;
  archive_id: string;
  doc_type: 'contract' | 'html_doc' | 'form_submission' | 'receipt';
  status: 'draft' | 'sent' | 'signed' | 'executed' | 'archived';
  form_data: any;
  created_at: string;
  archive?: {
    original_filename: string;
    mime_type: string;
    file_size: number;
    storage_path: string;
  };
}

export function useVault() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
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

  const fetchDocuments = async (hId?: string | null) => {
    try {
      const targetHId = hId || householdId;
      if (!targetHId) return;
      setLoading(true);
      // Join with qiarchive.archive_files
      const { data, error } = await supabase.schema('qivault').from('documents').select('*, archive:archive_id(*)').eq('tenant_id', targetHId).order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      const hId = await fetchHouseholdId();
      if (hId) fetchDocuments(hId);
    };
    init();
  }, []);

  return { documents, loading, refresh: fetchDocuments };
}

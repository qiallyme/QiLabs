import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DomainStats {
  activeMatters: number;
  vaultArtifacts: number;
  complianceScore: number;
}

export function useStats() {
  const [stats, setStats] = useState<DomainStats>({
    activeMatters: 0,
    vaultArtifacts: 0,
    complianceScore: 100,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('qione.profiles').select('household_id').eq('id', user.id).single();
      const householdId = profile?.household_id;
      if (!householdId) return;

      // Parallel counts
      const [casesCount, vaultCount] = await Promise.all([
        supabase.schema('qicase').from('cases').select('*', { count: 'exact', head: true }).eq('tenant_id', householdId),
        supabase.schema('qivault').from('documents').select('*', { count: 'exact', head: true }).eq('tenant_id', householdId),
      ]);

      setStats({
        activeMatters: casesCount.count || 0,
        vaultArtifacts: vaultCount.count || 0,
        complianceScore: 100,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refresh: fetchStats };
}

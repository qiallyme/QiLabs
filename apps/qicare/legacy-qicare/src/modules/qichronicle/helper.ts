import { supabase } from "../../lib/supabase";

export type ChronicleEvent = {
  title: string;
  description?: string;
  kind: string;
  status?: string;
  start_at: string;
  end_at?: string;
  is_all_day?: boolean;
  tags?: string[];
  context?: Record<string, any>;
};

/**
 * Small TS helper that other modules can call to emit events to QiChronicle.
 */
export const emitChronicleEvent = async (tenantId: string, event: ChronicleEvent) => {
  const { data, error } = await supabase
    .schema("qichronicle")
    .from("events")
    .insert([{
      ...event,
      tenant_id: tenantId,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error emitting chronicle event:", error);
    throw error;
  }
  return data;
};

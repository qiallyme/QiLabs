/* ─── Voice Command Types ─── */

export interface VoiceCommand {
  raw_text: string;
  confidence: number;
  parsed: ParsedVoiceAction | null;
  timestamp: string;
}

export type VoiceActionType =
  | 'log_medication'
  | 'log_treatment_start'
  | 'log_treatment_end'
  | 'start_timer'
  | 'log_symptom'
  | 'query_status'
  | 'query_next'
  | 'query_history'
  | 'unknown';

export interface ParsedVoiceAction {
  type: VoiceActionType;
  medication?: string;
  dose?: string;
  quantity?: number;
  timer_type?: string;
  timer_minutes?: number;
  symptom_type?: string;
  symptom_value?: number | string;
  query?: string;
}

/* ─── Mom Care — Core Type Definitions ─── */

// ─── Identity ───
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'primary' | 'secondary' | 'viewer';
  household_id: string;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
}

// ─── Patient ───
export interface Patient {
  id: string;
  household_id: string;
  name: string;
  age: number;
  photo_url?: string;
  conditions: string[];
  allergies: string[];
  baseline_medications: MedicationProfile[];
  prn_medications: MedicationProfile[];
  emergency_contacts: Contact[];
  doctor_contacts: Contact[];
  pharmacy_info?: string;
  baseline_breathing?: string;
  mobility_notes?: string;
  caffeine_habits?: string;
  nicotine_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
  notes?: string;
}

export interface MedicationProfile {
  id: string;
  name: string;
  generic_name?: string;
  dose: string;
  route: 'oral' | 'inhaled' | 'topical' | 'sublingual' | 'other';
  frequency: string;
  contains_ingredients: string[];
  category: 'scheduled' | 'prn';
  caution_tags: string[];
  notes?: string;
}

// ─── Events ───
export type EventType = 'medication' | 'treatment' | 'symptom' | 'vitals' | 'timer' | 'note';

export interface CareEvent {
  id: string;
  patient_id: string;
  household_id: string;
  type: EventType;
  category: string;
  label: string;
  details: Record<string, unknown>;
  dose?: string;
  route?: string;
  note?: string;
  input_method: 'manual' | 'voice';
  created_by: string;
  created_at: string;
  synced: boolean;
}

// ─── Timers ───
export type TimerStatus = 'running' | 'paused' | 'completed' | 'snoozed';

export interface CareTimer {
  id: string;
  patient_id: string;
  household_id: string;
  label: string;
  type: 'ice' | 'medication' | 'breathing' | 'reassessment' | 'monitoring' | 'custom';
  duration_seconds: number;
  started_at: string;
  ends_at: string;
  status: TimerStatus;
  linked_event_id?: string;
  created_by: string;
  snoozed_until?: string;
}

// ─── Safety / Warnings ───
export type WarningLevel = 'info' | 'caution' | 'alert';

export interface SafetyWarning {
  id: string;
  patient_id: string;
  level: WarningLevel;
  title: string;
  message: string;
  related_event_ids: string[];
  rule_id: string;
  dismissed: boolean;
  created_at: string;
}

export interface SafetyRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: SafetyCondition;
  warning_level: WarningLevel;
  warning_message: string;
  cooldown_minutes?: number;
}

export interface SafetyCondition {
  type: 'duplicate_ingredient' | 'timing_conflict' | 'combination_risk' | 'copd_caution' | 'sedation_stack' | 'custom';
  params: Record<string, unknown>;
}

// ─── Protocols ───
export interface CareProtocol {
  id: string;
  name: string;
  description: string;
  suggested_timers: Omit<CareTimer, 'id' | 'patient_id' | 'household_id' | 'started_at' | 'ends_at' | 'status' | 'created_by' | 'linked_event_id'>[];
  monitoring_prompts: string[];
  caution_notes: string[];
  quick_actions: string[];
  active: boolean;
  patient_id?: string;
}

// ─── Symptom ───
export type PainType = 'sharp' | 'aching' | 'throbbing' | 'pressure' | 'burning';
export type TrendDirection = 'better' | 'same' | 'worse';

export interface SymptomCheck {
  pain_level?: number;
  pain_location?: string;
  pain_type?: PainType;
  breathing_status?: 'comfortable' | 'labored' | 'struggling' | 'distressed';
  fatigue?: TrendDirection;
  dizziness?: boolean;
  swelling?: TrendDirection;
  mobility?: TrendDirection;
  appetite?: TrendDirection;
  sleep_quality?: TrendDirection;
  bowel_issues?: boolean;
  notes?: string;
}

// ─── Decision Support ───
export type CareLevel = 'monitor' | 'treat_home' | 'call_doctor' | 'urgent';

export interface CareGuidance {
  level: CareLevel;
  title: string;
  message: string;
  factors: string[];
}

// ─── App State ───
export interface AppSettings {
  dark_mode: boolean;
  large_text: boolean;
  voice_enabled: boolean;
  notification_enabled: boolean;
  active_patient_id: string | null;
  admin_mode: boolean;
}

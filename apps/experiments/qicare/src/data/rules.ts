/* ─── Safety Rules Engine Configuration ─── */
import type { SafetyRule } from '../types';

export const DEFAULT_SAFETY_RULES: SafetyRule[] = [
  {
    id: 'rule_duplicate_apap',
    name: 'Duplicate Acetaminophen',
    description: 'Warns when acetaminophen is logged after another acetaminophen-containing med within 4 hours',
    enabled: true,
    condition: {
      type: 'duplicate_ingredient',
      params: { ingredient: 'acetaminophen', window_minutes: 240 },
    },
    warning_level: 'caution',
    warning_message: 'Caution: This medication also contains acetaminophen. Check total daily intake — do not exceed 4000 mg in 24 hours.',
    cooldown_minutes: 60,
  },
  {
    id: 'rule_sedation_stack',
    name: 'Sedation Stack Risk',
    description: 'Warns when multiple CNS depressants are logged near each other',
    enabled: true,
    condition: {
      type: 'sedation_stack',
      params: {
        tags: ['opioid', 'cns_depressant', 'sedation'],
        window_minutes: 360,
        min_count: 2,
      },
    },
    warning_level: 'alert',
    warning_message: 'Caution: Combining sedating medications may increase drowsiness, fall risk, and respiratory depression. Monitor breathing and alertness closely.',
    cooldown_minutes: 120,
  },
  {
    id: 'rule_copd_respiratory',
    name: 'COPD Respiratory Caution',
    description: 'Warns when sedating medication is given to a patient with COPD',
    enabled: true,
    condition: {
      type: 'copd_caution',
      params: {
        patient_conditions: ['COPD'],
        trigger_tags: ['opioid', 'cns_depressant', 'respiratory_depression'],
      },
    },
    warning_level: 'alert',
    warning_message: 'Monitor breathing and alertness after this medication. COPD patients have higher respiratory depression risk.',
    cooldown_minutes: 180,
  },
  {
    id: 'rule_opioid_timing',
    name: 'Opioid Timing Warning',
    description: 'Warns when opioid is given before the minimum interval',
    enabled: true,
    condition: {
      type: 'timing_conflict',
      params: {
        tags: ['opioid'],
        min_interval_minutes: 360,
      },
    },
    warning_level: 'caution',
    warning_message: 'Wait window still active from last opioid dose. Consider timing before next dose.',
    cooldown_minutes: 30,
  },
  {
    id: 'rule_gabapentin_combo',
    name: 'Gabapentin + Opioid Combination',
    description: 'Warns when gabapentin and an opioid are used together',
    enabled: true,
    condition: {
      type: 'combination_risk',
      params: {
        pair: [['gabapentin'], ['opioid']],
        window_minutes: 480,
      },
    },
    warning_level: 'caution',
    warning_message: 'Caution: Hydrocodone plus gabapentin may increase drowsiness and fall risk. Monitor for sedation.',
    cooldown_minutes: 120,
  },
  {
    id: 'rule_fall_risk',
    name: 'Fall Risk Accumulation',
    description: 'Warns when multiple fall-risk medications are active',
    enabled: true,
    condition: {
      type: 'combination_risk',
      params: {
        pair: [['fall_risk'], ['fall_risk']],
        window_minutes: 480,
      },
    },
    warning_level: 'caution',
    warning_message: 'Multiple fall-risk medications active. Assist with mobility and prevent unattended walking.',
    cooldown_minutes: 240,
  },
];

/* ─── Seed Data: Demo Patient, Events, and Protocols ─── */
import type { Patient, CareEvent, CareTimer, CareProtocol } from '../types';

const now = new Date();
const today = (h: number, m: number) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const DEMO_PATIENT: Patient = {
  id: 'patient_001',
  household_id: 'household_001',
  name: 'Mom',
  age: 72,
  conditions: ['COPD', 'Chronic knee pain', 'Occasional weakness episodes'],
  allergies: ['Sulfa drugs', 'Shellfish'],
  baseline_medications: [
    {
      id: 'med_prednisone', name: 'Prednisone', generic_name: 'Prednisone',
      dose: '10 mg', route: 'oral', frequency: 'Daily (taper)',
      contains_ingredients: ['prednisone'], category: 'scheduled',
      caution_tags: ['steroid', 'blood_sugar', 'immune'],
    },
    {
      id: 'med_ipratropium', name: 'Ipratropium', generic_name: 'Ipratropium bromide',
      dose: '0.5 mg/2.5 mL', route: 'inhaled', frequency: 'Every 6-8 hours',
      contains_ingredients: ['ipratropium'], category: 'scheduled',
      caution_tags: ['anticholinergic'],
    },
  ],
  prn_medications: [
    {
      id: 'med_tylenol', name: 'Tylenol', generic_name: 'Acetaminophen',
      dose: '500 mg (2 tablets)', route: 'oral', frequency: 'Every 6h PRN',
      contains_ingredients: ['acetaminophen'], category: 'prn',
      caution_tags: ['liver', 'max_daily_4000mg'],
    },
    {
      id: 'med_ibuprofen', name: 'Ibuprofen', generic_name: 'Ibuprofen',
      dose: '200 mg', route: 'oral', frequency: 'Every 6h PRN',
      contains_ingredients: ['ibuprofen'], category: 'prn',
      caution_tags: ['nsaid', 'stomach', 'kidney'],
    },
    {
      id: 'med_gabapentin', name: 'Gabapentin', generic_name: 'Gabapentin',
      dose: '300 mg', route: 'oral', frequency: 'As directed',
      contains_ingredients: ['gabapentin'], category: 'prn',
      caution_tags: ['sedation', 'cns_depressant', 'fall_risk'],
    },
    {
      id: 'med_lortab', name: 'Lortab', generic_name: 'Hydrocodone-Acetaminophen',
      dose: '5/325 mg', route: 'oral', frequency: 'Every 6h PRN',
      contains_ingredients: ['hydrocodone', 'acetaminophen'], category: 'prn',
      caution_tags: ['opioid', 'sedation', 'cns_depressant', 'respiratory_depression', 'fall_risk', 'liver'],
    },
    {
      id: 'med_albuterol', name: 'Albuterol', generic_name: 'Albuterol sulfate',
      dose: '2.5 mg/3 mL', route: 'inhaled', frequency: 'Every 4-6h PRN',
      contains_ingredients: ['albuterol'], category: 'prn',
      caution_tags: ['bronchodilator', 'heart_rate'],
    },
  ],
  emergency_contacts: [
    { name: 'Dr. Williams', role: 'Primary Care', phone: '(555) 234-5678' },
    { name: 'Pulmonology Clinic', role: 'Specialist', phone: '(555) 345-6789' },
  ],
  doctor_contacts: [
    { name: 'Dr. Williams', role: 'Primary Care Physician', phone: '(555) 234-5678' },
    { name: 'Dr. Chen', role: 'Pulmonologist', phone: '(555) 345-6789' },
  ],
  pharmacy_info: 'Walgreens — (555) 456-7890 — 123 Main St',
  baseline_breathing: 'Baseline SpO2 ~94-96% on room air. Uses nebulizer treatments scheduled and PRN.',
  mobility_notes: 'Uses walker for longer distances. Needs standby assist with stairs. Fall history — twice in past 6 months.',
  caffeine_habits: '2 cups coffee morning, occasional afternoon sweet tea',
  nicotine_info: 'Nicotine patch 14mg/day. Former smoker — quit 3 years ago.',
  notes: 'Prefers to rest in recliner. Often underreports pain level. Tends to resist calling the doctor.',
  created_at: today(0, 0),
  updated_at: today(0, 0),
};

export const DEMO_EVENTS: CareEvent[] = [
  {
    id: 'evt_001', patient_id: 'patient_001', household_id: 'household_001',
    type: 'medication', category: 'scheduled', label: 'Prednisone 10 mg',
    details: { medication_key: 'prednisone' }, dose: '10 mg', route: 'oral',
    input_method: 'manual', created_by: 'Caregiver', created_at: today(8, 0), synced: true,
  },
  {
    id: 'evt_002', patient_id: 'patient_001', household_id: 'household_001',
    type: 'treatment', category: 'breathing', label: 'Breathing treatment started',
    details: { treatment_type: 'nebulizer', medications: ['albuterol', 'ipratropium'] },
    input_method: 'manual', created_by: 'Caregiver', created_at: today(8, 15), synced: true,
  },
  {
    id: 'evt_003', patient_id: 'patient_001', household_id: 'household_001',
    type: 'treatment', category: 'breathing', label: 'Breathing treatment completed',
    details: { treatment_type: 'nebulizer' },
    input_method: 'manual', created_by: 'Caregiver', created_at: today(8, 30), synced: true,
  },
  {
    id: 'evt_004', patient_id: 'patient_001', household_id: 'household_001',
    type: 'vitals', category: 'oxygen', label: 'O₂ level: 95%',
    details: { value: 95, unit: '%' },
    input_method: 'manual', created_by: 'Caregiver', created_at: today(8, 35), synced: true,
  },
  {
    id: 'evt_005', patient_id: 'patient_001', household_id: 'household_001',
    type: 'note', category: 'general', label: 'Ate half a bowl of oatmeal and coffee',
    details: {},
    input_method: 'manual', created_by: 'Caregiver', created_at: today(9, 0), synced: true,
  },
  {
    id: 'evt_006', patient_id: 'patient_001', household_id: 'household_001',
    type: 'symptom', category: 'pain', label: 'Pain check — level 4',
    details: { pain_level: 4, pain_location: 'right knee', pain_type: 'aching' },
    input_method: 'manual', created_by: 'Caregiver', created_at: today(10, 0), synced: true,
  },
  {
    id: 'evt_007', patient_id: 'patient_001', household_id: 'household_001',
    type: 'medication', category: 'prn', label: 'Tylenol 1000 mg',
    details: { medication_key: 'tylenol', tablets: 2 }, dose: '1000 mg', route: 'oral',
    input_method: 'voice', created_by: 'Caregiver', created_at: today(10, 5), synced: true,
  },
  {
    id: 'evt_008', patient_id: 'patient_001', household_id: 'household_001',
    type: 'medication', category: 'prn', label: 'Gabapentin 300 mg',
    details: { medication_key: 'gabapentin' }, dose: '300 mg', route: 'oral',
    input_method: 'manual', created_by: 'Caregiver', created_at: today(10, 7), synced: true,
  },
  {
    id: 'evt_009', patient_id: 'patient_001', household_id: 'household_001',
    type: 'timer', category: 'ice', label: 'Ice applied — right knee',
    details: { location: 'right knee', action: 'on' },
    input_method: 'manual', created_by: 'Caregiver', created_at: today(10, 10), synced: true,
  },
];

const timerEnd = new Date(now.getTime() + 15 * 60 * 1000);
export const DEMO_TIMERS: CareTimer[] = [
  {
    id: 'timer_001', patient_id: 'patient_001', household_id: 'household_001',
    label: 'Ice off — right knee', type: 'ice',
    duration_seconds: 1200,
    started_at: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    ends_at: timerEnd.toISOString(),
    status: 'running', linked_event_id: 'evt_009', created_by: 'Caregiver',
  },
  {
    id: 'timer_002', patient_id: 'patient_001', household_id: 'household_001',
    label: 'Pain reassessment', type: 'reassessment',
    duration_seconds: 1800,
    started_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    ends_at: new Date(now.getTime() + 20 * 60 * 1000).toISOString(),
    status: 'running', linked_event_id: 'evt_007', created_by: 'Caregiver',
  },
  {
    id: 'timer_003', patient_id: 'patient_001', household_id: 'household_001',
    label: 'Next breathing treatment', type: 'breathing',
    duration_seconds: 14400,
    started_at: today(8, 30),
    ends_at: today(12, 30),
    status: 'running', created_by: 'Caregiver',
  },
];

export const DEMO_PROTOCOLS: CareProtocol[] = [
  {
    id: 'proto_001',
    name: 'COPD Flare Day',
    description: 'Enhanced monitoring protocol for COPD exacerbation days',
    suggested_timers: [
      { label: 'Breathing treatment', type: 'breathing', duration_seconds: 14400 },
      { label: 'O₂ recheck', type: 'monitoring', duration_seconds: 3600 },
    ],
    monitoring_prompts: [
      'Check O₂ saturation every hour',
      'Monitor for increased shortness of breath',
      'Track sputum color changes',
      'Watch for confusion or increased drowsiness',
    ],
    caution_notes: [
      'Avoid sedating medications if possible during flare',
      'Keep rescue inhaler within reach',
      'Position patient upright or in tripod position',
    ],
    quick_actions: ['albuterol', 'oxygen', 'breathing_check', 'breathing_start'],
    active: true,
    patient_id: 'patient_001',
  },
  {
    id: 'proto_002',
    name: 'Knee Pain Day',
    description: 'Pain management protocol with ice and monitoring',
    suggested_timers: [
      { label: 'Ice timer', type: 'ice', duration_seconds: 1200 },
      { label: 'Pain reassessment', type: 'reassessment', duration_seconds: 1800 },
    ],
    monitoring_prompts: [
      'Rate pain every 30 minutes',
      'Check for increased swelling',
      'Monitor weight-bearing ability',
    ],
    caution_notes: [
      'Do not stack Tylenol with Lortab without tracking acetaminophen total',
      'Watch for sedation if gabapentin and Lortab are both given',
    ],
    quick_actions: ['tylenol', 'ibuprofen', 'gabapentin', 'ice_on', 'pain_check'],
    active: false,
    patient_id: 'patient_001',
  },
  {
    id: 'proto_003',
    name: 'Fall Watch Mode',
    description: 'Enhanced safety monitoring after a fall or near-fall',
    suggested_timers: [
      { label: 'Neuro check', type: 'monitoring', duration_seconds: 3600 },
      { label: 'Mobility reassessment', type: 'reassessment', duration_seconds: 7200 },
    ],
    monitoring_prompts: [
      'Check for new pain complaints',
      'Monitor for confusion, headache, nausea',
      'Inspect bruising or swelling',
      'Note any limping or guarding',
    ],
    caution_notes: [
      'Hold sedating medications when possible',
      'Ensure walker or support is immediately available',
      'Do not allow unattended bathroom trips',
    ],
    quick_actions: ['pain_check', 'blood_pressure', 'note'],
    active: false,
    patient_id: 'patient_001',
  },
];

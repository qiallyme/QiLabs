/* ─── Care Store — Central state for events, patient, warnings ─── */
import { create } from 'zustand';
import type { CareEvent, Patient, SafetyWarning, CareProtocol, AppSettings, SymptomCheck } from '../types';
import { DEMO_PATIENT, DEMO_EVENTS, DEMO_PROTOCOLS } from '../data/seed';
import { supabase } from '../lib/supabase';

interface CareState {
  // Data
  patient: Patient;
  events: CareEvent[];
  warnings: SafetyWarning[];
  protocols: CareProtocol[];
  settings: AppSettings;
  lastSymptomCheck: SymptomCheck | null;
  isSyncing: boolean;

  // Actions
  initializeSync: () => void;
  addEvent: (event: CareEvent) => void;
  updateEvent: (id: string, updates: Partial<CareEvent>) => void;
  deleteEvent: (id: string) => void;
  addWarning: (warning: SafetyWarning) => void;
  dismissWarning: (id: string) => void;
  updatePatient: (updates: Partial<Patient>) => void;
  toggleProtocol: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setSymptomCheck: (check: SymptomCheck) => void;
  clearEvents: () => void;
}

export const useCareStore = create<CareState>()((set, get) => ({
  patient: DEMO_PATIENT,
  events: [], // Start empty, pull truth from DB
  warnings: [],
  protocols: DEMO_PROTOCOLS,
  settings: {
    dark_mode: true,
    large_text: false,
    voice_enabled: true,
    notification_enabled: true,
    active_patient_id: 'patient_001',
    admin_mode: false,
  },
  lastSymptomCheck: null,
  isSyncing: false,

  initializeSync: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });

    // 1. Initial Fetch
    const { data: initialEvents, error } = await supabase
      .schema('qihealth')
      .from('care_events')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && initialEvents) {
      set({ events: initialEvents as CareEvent[] });
    } else {
      console.error("Failed to fetch from supabase:", error);
      // Fallback to local demo data if no auth / network fails
      set({ events: DEMO_EVENTS });
    }

    // 2. Subscribe to realtime changes! (Making Supabase the Source of Truth across devices)
    supabase
      .channel('qihealth-events-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'qihealth', table: 'care_events' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set((state) => ({
              events: [payload.new as CareEvent, ...state.events.filter(e => e.id !== payload.new.id)].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
            }));
          } else if (payload.eventType === 'UPDATE') {
            set((state) => ({
              events: state.events.map((e) => e.id === payload.new.id ? payload.new as CareEvent : e)
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state) => ({
              events: state.events.filter((e) => e.id !== payload.old.id)
            }));
          }
        }
      )
      .subscribe();
  },

  addEvent: async (event) => {
    // Optimistic UI Update locally immediately
    set((state) => ({
      events: [event, ...state.events].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }));

    // Push to Supabase Source of Truth (don't send synced flag as that's a UI specific thing or not in DB schema)
    const dbPayload = { ...event };
    
    // Attempt standard insert, Rely on RLS to inject `owner_id = auth.uid()`
    const { error } = await supabase.schema('qihealth').from('care_events').insert(dbPayload);
    if (error) console.error("Event push error:", error);
  },

  updateEvent: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    
    // Supabase
    const { error } = await supabase.schema('qihealth').from('care_events').update(updates).eq('id', id);
    if (error) console.error("Event update error:", error);
  },

  deleteEvent: async (id) => {
    // Optimistic update
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
    
    // Supabase
    const { error } = await supabase.schema('qihealth').from('care_events').delete().eq('id', id);
    if (error) console.error("Event delete error:", error);
  },

  // Remaining actions keep standard Zustand patterns (For now, just local until full DB scale-out)
  addWarning: (warning) =>
    set((state) => ({ warnings: [warning, ...state.warnings] })),

  dismissWarning: (id) =>
    set((state) => ({
      warnings: state.warnings.map((w) =>
        w.id === id ? { ...w, dismissed: true } : w
      ),
    })),

  updatePatient: (updates) =>
    set((state) => ({
      patient: { ...state.patient, ...updates, updated_at: new Date().toISOString() },
    })),

  toggleProtocol: (id) =>
    set((state) => ({
      protocols: state.protocols.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      ),
    })),

  updateSettings: (updates) =>
    set((state) => ({ settings: { ...state.settings, ...updates } })),

  setSymptomCheck: (check) => set({ lastSymptomCheck: check }),

  clearEvents: () => set({ events: [], warnings: [] }),
}));

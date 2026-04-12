-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE qihealth.care_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id text,
  household_id text,
  type text,
  category text,
  label text,
  details jsonb,
  dose text,
  route text,
  note text,
  input_method text,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  synced boolean DEFAULT true,
  CONSTRAINT care_events_pkey PRIMARY KEY (id),
  CONSTRAINT care_events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE qihealth.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  household_id text,
  name text,
  age integer,
  photo_url text,
  conditions jsonb DEFAULT '[]'::jsonb,
  allergies jsonb DEFAULT '[]'::jsonb,
  baseline_medications jsonb DEFAULT '[]'::jsonb,
  prn_medications jsonb DEFAULT '[]'::jsonb,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  doctor_contacts jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
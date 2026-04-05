-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('master', 'admin', 'partner', 'attorney', 'paralegal');
CREATE TYPE case_status AS ENUM ('active', 'closed', 'pending', 'settled');
CREATE TYPE case_type AS ENUM ('civil', 'criminal', 'family', 'corporate', 'personal_injury', 'other');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE event_type AS ENUM ('court_date', 'deadline', 'meeting', 'task', 'other');
CREATE TYPE event_status AS ENUM ('scheduled', 'completed', 'cancelled', 'postponed');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'paralegal',
  law_firm_id UUID,
  law_firm_name TEXT,
  permissions TEXT[],
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create law_firms table
CREATE TABLE law_firms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  law_firm_id UUID REFERENCES law_firms(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type case_type DEFAULT 'civil',
  client_id UUID REFERENCES clients(id),
  attorney_id UUID REFERENCES profiles(id),
  status case_status DEFAULT 'active',
  date_opened DATE DEFAULT CURRENT_DATE,
  date_closed DATE,
  description TEXT,
  jurisdiction TEXT,
  court TEXT,
  judge TEXT,
  law_firm_id UUID REFERENCES law_firms(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  case_id UUID REFERENCES cases(id),
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type event_type DEFAULT 'other',
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  description TEXT,
  case_id UUID REFERENCES cases(id),
  created_by UUID REFERENCES profiles(id),
  attendees UUID[],
  status event_status DEFAULT 'scheduled',
  reminder_minutes INTEGER DEFAULT 60,
  is_virtual BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  case_id UUID REFERENCES cases(id),
  uploaded_by UUID REFERENCES profiles(id),
  tags TEXT[],
  is_confidential BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table for billing
CREATE TABLE time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  user_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL,
  rate DECIMAL(10,2),
  date DATE DEFAULT CURRENT_DATE,
  billable BOOLEAN DEFAULT TRUE,
  billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cases_attorney_id ON cases(attorney_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_case_id ON tasks(case_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_time_entries_case_id ON time_entries(case_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read their own profile and profiles in their firm
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cases: Users can see cases they're involved with or in their firm
CREATE POLICY "Users can view relevant cases" ON cases FOR SELECT USING (
  attorney_id = auth.uid() OR 
  created_by = auth.uid() OR
  law_firm_id IN (SELECT law_firm_id FROM profiles WHERE id = auth.uid())
);

-- Tasks: Users can see tasks assigned to them or created by them
CREATE POLICY "Users can view relevant tasks" ON tasks FOR SELECT USING (
  assigned_to = auth.uid() OR 
  assigned_by = auth.uid()
);

-- Calendar events: Users can see events they created or are attending
CREATE POLICY "Users can view relevant events" ON calendar_events FOR SELECT USING (
  created_by = auth.uid() OR 
  auth.uid() = ANY(attendees)
);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_law_firms_updated_at BEFORE UPDATE ON law_firms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO law_firms (id, name, address, phone, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Blake & Associates', '123 Legal St, San Francisco, CA 94102', '(415) 555-0123', 'info@blakelaw.com');

-- Insert demo profiles (these will be created when users sign up)
-- The auth.users entries need to be created through Supabase Auth
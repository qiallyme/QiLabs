-- Query to find your workspace ID(s)
-- Run this in your Supabase SQL Editor

-- Option 1: List all workspaces with owner info
SELECT 
  w.id as workspace_id,
  w.name as workspace_name,
  w.owner_id,
  p.display_name as owner_name,
  w.created_at
FROM public.workspaces w
LEFT JOIN public.profiles p ON w.owner_id = p.id
ORDER BY w.created_at DESC;

-- Option 2: Get workspace for current user (if authenticated)
-- This assumes you're logged in via Supabase Auth
SELECT 
  w.id as workspace_id,
  w.name as workspace_name
FROM public.workspaces w
WHERE w.owner_id = auth.uid()
ORDER BY w.created_at DESC
LIMIT 1;

-- Option 3: If you don't have a workspace yet, create one:
-- First, make sure you have a profile:
-- INSERT INTO public.profiles (id, display_name)
-- VALUES (auth.uid(), 'Your Name')
-- ON CONFLICT (id) DO NOTHING;

-- Then create a workspace:
-- INSERT INTO public.workspaces (owner_id, name)
-- VALUES (auth.uid(), 'My Workspace')
-- RETURNING id as workspace_id, name;


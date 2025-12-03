-- Create registrations table to store public sign-ups

CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  gender text,
  church text,
  ministry text,
  testimony text,
  created_at timestamptz DEFAULT now()
);

-- Simple policy: allow inserts from anon so the public can register (optional; you can tighten later)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_insert" ON public.registrations
  FOR INSERT
  WITH CHECK (true);

-- Allow public select if you want to show registrations (optional)
-- CREATE POLICY "public_select" ON public.registrations
--   FOR SELECT
--   USING (true);

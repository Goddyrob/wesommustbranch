-- Add created_by column and RLS policies for media_albums

ALTER TABLE public.media_albums
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Enable Row Level Security
ALTER TABLE public.media_albums ENABLE ROW LEVEL SECURITY;

-- Public read access (SELECT)
DROP POLICY IF EXISTS "public_select" ON public.media_albums;
CREATE POLICY "public_select" ON public.media_albums
  FOR SELECT
  USING (true);

-- Allow insert for authenticated users; require created_by equals auth uid (with check)
DROP POLICY IF EXISTS "insert_authenticated" ON public.media_albums;
CREATE POLICY "insert_authenticated" ON public.media_albums
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Allow update only by the owner (created_by)
DROP POLICY IF EXISTS "update_owner" ON public.media_albums;
CREATE POLICY "update_owner" ON public.media_albums
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Allow delete only by the owner (created_by)
DROP POLICY IF EXISTS "delete_owner" ON public.media_albums;
CREATE POLICY "delete_owner" ON public.media_albums
  FOR DELETE
  USING (created_by = auth.uid());

-- Note: Administrators can be handled separately via a role check or additional policies.
-- Apply the policies immediately

-- Grant SELECT to anon role so public site can read (optional if you manage via policies)
-- GRANT SELECT ON public.media_albums TO anon;
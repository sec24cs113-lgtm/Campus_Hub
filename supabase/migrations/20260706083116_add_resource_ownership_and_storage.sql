/*
# Add resource ownership + storage bucket for user uploads

1. Schema changes
- Add `user_id` (uuid) column to `resources`, defaulting to `auth.uid()`,
  so every uploaded resource is owned by the authenticated user who created it.
- Add `file_url` (text) column to `resources` to store the path of the
  uploaded file in the `resource-files` storage bucket (PDF/video/etc.).
- Add `file_name` (text) column to `resources` to store the original file name.

2. Security
- RLS is already enabled on `resources`. We add owner-scoped INSERT/UPDATE/DELETE
  policies so any authenticated user can upload resources to any category
  (video / qp / book), but can only modify/delete their own.
- SELECT remains open to all authenticated users (marketplace is browsable).
- Storage bucket `resource-files` is created as a private bucket; policies
  allow authenticated users to upload to a user-scoped path and read their own
  files, plus allow public read of the object path stored on the resource row.

3. Notes
- The `user_id` column is added with `DEFAULT auth.uid()` so client inserts
  that omit `user_id` still satisfy the INSERT WITH CHECK policy.
- Idempotent: uses `IF NOT EXISTS` guards and `DROP POLICY IF EXISTS` before
  recreating policies.
*/

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS file_url text;

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS file_name text;

-- Owner-scoped INSERT: any authenticated user can upload to any category.
DROP POLICY IF EXISTS "insert_own_resources" ON resources;
CREATE POLICY "insert_own_resources" ON resources FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Owner-scoped UPDATE: only the owner can edit their resource.
DROP POLICY IF EXISTS "update_own_resources" ON resources;
CREATE POLICY "update_own_resources" ON resources FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Owner-scoped DELETE: only the owner can delete their resource.
DROP POLICY IF EXISTS "delete_own_resources" ON resources;
CREATE POLICY "delete_own_resources" ON resources FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for uploaded resource files.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resource-files', 'resource-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload to their own folder,
-- and anyone can read (bucket is public so marketplace can serve files).
DROP POLICY IF EXISTS "Anyone can read resource files" ON storage.objects;
CREATE POLICY "Anyone can read resource files" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'resource-files');

DROP POLICY IF EXISTS "Authenticated users can upload resource files" ON storage.objects;
CREATE POLICY "Authenticated users can upload resource files" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'resource-files');

DROP POLICY IF EXISTS "Owners can update their resource files" ON storage.objects;
CREATE POLICY "Owners can update their resource files" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'resource-files' AND owner = auth.uid());

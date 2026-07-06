/*
# Add storage DELETE policy for resource-files bucket

1. Security
- The `resource-files` storage bucket already has SELECT (public read), INSERT
  (authenticated), and UPDATE (owner-scoped) policies, but no DELETE policy.
- Without a DELETE policy, users cannot remove the files they uploaded, so
  deleting a resource row would leave orphaned files in storage.
- Add an owner-scoped DELETE policy: an authenticated user may delete an
  object in the `resource-files` bucket only if they own it (owner = auth.uid()).

2. Notes
- Idempotent: drops the policy first if it already exists.
- Mirrors the existing UPDATE policy's ownership predicate for consistency.
*/

DROP POLICY IF EXISTS "Owners can delete their resource files" ON storage.objects;
CREATE POLICY "Owners can delete their resource files" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'resource-files' AND owner = auth.uid());

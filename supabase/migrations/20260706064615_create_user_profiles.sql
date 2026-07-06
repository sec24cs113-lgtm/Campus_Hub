/*
# Create user_profiles table

## Overview
Stores extended profile data for every authenticated user. A row is automatically
created (via database trigger) whenever a new user signs up through Supabase Auth.

## New Tables

### user_profiles
- id: UUID — matches auth.users.id (primary key + foreign key)
- full_name: Display name (pulled from auth metadata at signup)
- institution: University / college name
- bio: Short personal bio
- avatar_url: Profile photo URL
- subject_badge: Primary subject expertise
- wallet_balance: Virtual wallet balance (USD)
- resources_purchased: Count of resources the user has bought
- created_at: Timestamp

## Trigger
`on_auth_user_created` — fires AFTER INSERT on auth.users and inserts a matching
row into user_profiles using the new user's id and full_name from raw_user_meta_data.

## Security
- RLS enabled
- Authenticated users can SELECT and UPDATE their own row only
- INSERT is handled exclusively by the trigger (service role), not the client
- No DELETE policy — profiles are permanent
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  institution text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  subject_badge text NOT NULL DEFAULT '',
  wallet_balance numeric(10, 2) NOT NULL DEFAULT 0.00,
  resources_purchased integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON user_profiles;
CREATE POLICY "users_select_own_profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON user_profiles;
CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger function: auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Back-fill any existing auth users who don't yet have a profile row
INSERT INTO public.user_profiles (id, full_name)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', '')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);

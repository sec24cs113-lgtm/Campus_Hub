/*
# Librarian Book Exchange Workflow

## Summary
Adds the physical-book exchange workflow to CampusHub. Books purchased on the
marketplace now flow through a librarian who verifies the physical book, holds
it for buyer pickup, and confirms handover. Payment stays in escrow until the
librarian confirms delivery, at which point the admin releases funds to the
seller.

## New columns on `transactions`
- `submission_deadline` (timestamptz) — deadline by which the seller must hand
  the physical book to the librarian. Defaults to 5 days after purchase.
- `pickup_deadline` (timestamptz) — deadline by which the buyer must collect the
  book from the librarian. Set when status becomes "Ready for Buyer Pickup".
- `librarian_id` (uuid) — the librarian handling this exchange. Nullable; the
  system auto-assigns the first librarian-flagged user on purchase.
- `librarian_notes` (text) — free-text notes from the librarian (condition,
  damage reports, etc.).
- `penalty_applied` (boolean, default false) — set true if the seller missed the
  submission deadline and a penalty was applied.
- `refund_initiated` (boolean, default false) — set true if a buyer refund was
  initiated due to seller failure or dispute.

## `transactions.order_status` value flow
Listed -> Purchased -> Awaiting Seller Submission -> Received by Librarian ->
Ready for Buyer Pickup -> Delivered to Buyer -> Completed

## New table `librarian_alerts`
A lightweight inbox for the librarian. One row per book-exchange event that
requires librarian attention (purchase confirmed, book submitted, deadline
missed, dispute raised, etc.).
- `id` uuid pk
- `transaction_id` uuid fk -> transactions.id (cascade)
- `librarian_id` uuid fk -> auth.users.id (null on delete)
- `type` text — alert category: 'new_exchange' | 'book_submitted' |
  'deadline_missed' | 'dispute' | 'pickup_overdue'
- `message` text
- `read` boolean default false
- `created_at` timestamptz default now()

## New column on `user_profiles`
- `librarian_role` boolean default false — flags a user as a librarian. Used in
  RLS policies to scope librarian_alerts and to allow status updates on
  book-exchange transactions.

## Security / RLS
- `transactions`: existing policies unchanged. New policy added so a librarian
  (user_profiles.librarian_role = true) can SELECT and UPDATE book-exchange
  transactions. Admins already have full access via the existing admin_all
  policy.
- `librarian_alerts`: new table. Librarians can read/update their own alerts;
  any authenticated user can INSERT (system creates alerts on purchase). Admins
  get full access.
- `user_profiles`: existing policies unchanged. Librarians need to read other
  users' names for the dashboard, so the existing admin_select_all_profiles
  policy is extended via a new librarian_select_profiles policy.

## Notes
1. The migration is idempotent — uses IF NOT EXISTS / DO blocks for columns and
   DROP POLICY IF EXISTS before each CREATE POLICY.
2. No data is dropped or renamed.
3. `librarian_id` is nullable so existing transactions are unaffected.
*/

-- 1. Extend transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS submission_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS pickup_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS librarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS librarian_notes text,
  ADD COLUMN IF NOT EXISTS penalty_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS refund_initiated boolean NOT NULL DEFAULT false;

-- 2. Librarian flag on user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS librarian_role boolean NOT NULL DEFAULT false;

-- 3. librarian_alerts table
CREATE TABLE IF NOT EXISTS librarian_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  librarian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('new_exchange','book_submitted','deadline_missed','dispute','pickup_overdue')),
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE librarian_alerts ENABLE ROW LEVEL SECURITY;

-- Index for librarian dashboard queries
CREATE INDEX IF NOT EXISTS idx_librarian_alerts_librarian
  ON librarian_alerts (librarian_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_librarian
  ON transactions (librarian_id, order_status);

-- 4. Policies

-- 4a. Librarian can read/update book-exchange transactions
DROP POLICY IF EXISTS "librarian_select_transactions" ON transactions;
CREATE POLICY "librarian_select_transactions"
ON transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.librarian_role = true
  )
);

DROP POLICY IF EXISTS "librarian_update_transactions" ON transactions;
CREATE POLICY "librarian_update_transactions"
ON transactions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.librarian_role = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.librarian_role = true
  )
);

-- 4b. Librarian alerts — librarians read/update own, anyone can insert, admin full
DROP POLICY IF EXISTS "librarian_select_alerts" ON librarian_alerts;
CREATE POLICY "librarian_select_alerts"
ON librarian_alerts FOR SELECT
TO authenticated
USING (
  librarian_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.admin_role = true
  )
);

DROP POLICY IF EXISTS "auth_insert_alerts" ON librarian_alerts;
CREATE POLICY "auth_insert_alerts"
ON librarian_alerts FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "librarian_update_alerts" ON librarian_alerts;
CREATE POLICY "librarian_update_alerts"
ON librarian_alerts FOR UPDATE
TO authenticated
USING (librarian_id = auth.uid())
WITH CHECK (librarian_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_alerts" ON librarian_alerts;
CREATE POLICY "admin_all_alerts"
ON librarian_alerts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.admin_role = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.admin_role = true
  )
);

-- 4c. Librarian can read user profiles (names) for the dashboard
DROP POLICY IF EXISTS "librarian_select_profiles" ON user_profiles;
CREATE POLICY "librarian_select_profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles p
    WHERE p.id = auth.uid() AND p.librarian_role = true
  )
);

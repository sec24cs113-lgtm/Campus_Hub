/*
# Add admin role, transactions, refunds, and notifications tables

## Overview
1. Adds admin_role, suspended, banned columns to user_profiles
2. Creates transactions, refunds, notifications tables
3. RLS policies: admins get full access; users get own-row access

## Schema Changes

### user_profiles (modified)
- admin_role boolean DEFAULT false
- suspended boolean DEFAULT false
- banned boolean DEFAULT false

### transactions (new)
- id, buyer_id, seller_id, resource_id, amount, payment_status, escrow_status, order_status, created_at

### refunds (new)
- id, transaction_id, buyer_id, reason, status, amount, created_at, resolved_at

### notifications (new)
- id, title, message, target_audience, channel, sent_by, created_at
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS admin_role boolean NOT NULL DEFAULT false;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;

-- Admins can read all profiles
DROP POLICY IF EXISTS "admin_select_all_profiles" ON user_profiles;
CREATE POLICY "admin_select_all_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true));

-- Admins can update any profile (moderation actions)
DROP POLICY IF EXISTS "admin_update_profiles" ON user_profiles;
CREATE POLICY "admin_update_profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true) OR auth.uid() = id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  escrow_status text NOT NULL DEFAULT 'held',
  order_status text NOT NULL DEFAULT 'processing',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_transactions" ON transactions;
CREATE POLICY "admin_all_transactions" ON transactions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true));

DROP POLICY IF EXISTS "user_select_own_transactions" ON transactions;
CREATE POLICY "user_select_own_transactions" ON transactions
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_refunds" ON refunds;
CREATE POLICY "admin_all_refunds" ON refunds
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true));

DROP POLICY IF EXISTS "user_select_own_refunds" ON refunds;
CREATE POLICY "user_select_own_refunds" ON refunds
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid());

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  target_audience text NOT NULL DEFAULT 'all',
  channel text NOT NULL DEFAULT 'in-app',
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications" ON notifications
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true));

DROP POLICY IF EXISTS "user_select_notifications" ON notifications;
CREATE POLICY "user_select_notifications" ON notifications
  FOR SELECT TO authenticated
  USING (true);

-- Admins can manage all resources
DROP POLICY IF EXISTS "admin_all_resources" ON resources;
CREATE POLICY "admin_all_resources" ON resources
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = auth.uid() AND p.admin_role = true));

CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

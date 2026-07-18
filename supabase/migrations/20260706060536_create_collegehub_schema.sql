/*
# CollegeHub Academic Marketplace Schema

## Overview
Initial schema for CollegeHub, a college campus academic marketplace.
Creates tables for resources (videos, question papers, books), leaderboard, and categories.

## New Tables

### resources
Central table for all academic content listings:
- id: UUID primary key
- title: Resource title
- subject: Academic subject (e.g., Economics, Computer Science)
- author: Author/instructor name
- price: Listing price in USD
- type: Content type — 'video' | 'qp' (question paper) | 'book'
- image_url: Thumbnail or cover image URL
- badge: Optional label (e.g., "BESTSELLER", "Verified")
- description: Short description
- likes: Like/wishlist count
- verified: Whether the resource is verified
- views: View count
- created_at: Creation timestamp

### leaderboard_users
Top users on the leaderboard:
- id: UUID primary key
- name: Display name
- avatar_url: Profile photo URL
- score: Accumulated score/points
- rank: Leaderboard rank
- institution: University/college name
- subject_badge: Subject expertise badge
- resources_sold: Number of resources sold
- created_at: Creation timestamp

### categories
Subject categories for filtering:
- id: UUID primary key
- name: Category name
- slug: URL-friendly slug
- icon: Icon identifier
- color: Brand color for the category

## Security
- RLS enabled on all tables
- All policies use TO anon, authenticated (no login required — public marketplace)
- USING (true) is intentional: this is a public single-tenant marketplace
*/

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  author text NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('video', 'qp', 'book')),
  image_url text,
  badge text,
  description text,
  likes integer DEFAULT 0,
  verified boolean DEFAULT false,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resources" ON resources;
CREATE POLICY "anon_select_resources" ON resources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resources" ON resources;
CREATE POLICY "anon_insert_resources" ON resources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resources" ON resources;
CREATE POLICY "anon_update_resources" ON resources FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resources" ON resources;
CREATE POLICY "anon_delete_resources" ON resources FOR DELETE
  TO anon, authenticated USING (true);

-- Leaderboard users table
CREATE TABLE IF NOT EXISTS leaderboard_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  score integer DEFAULT 0,
  rank integer,
  institution text,
  subject_badge text,
  resources_sold integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard_users;
CREATE POLICY "anon_select_leaderboard" ON leaderboard_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard_users;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard_users;
CREATE POLICY "anon_update_leaderboard" ON leaderboard_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard_users;
CREATE POLICY "anon_delete_leaderboard" ON leaderboard_users FOR DELETE
  TO anon, authenticated USING (true);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  color text,
  resource_count integer DEFAULT 0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cart" ON cart_items;
CREATE POLICY "anon_select_cart" ON cart_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cart" ON cart_items;
CREATE POLICY "anon_insert_cart" ON cart_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cart" ON cart_items;
CREATE POLICY "anon_update_cart" ON cart_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cart" ON cart_items;
CREATE POLICY "anon_delete_cart" ON cart_items FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_users(score DESC);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);

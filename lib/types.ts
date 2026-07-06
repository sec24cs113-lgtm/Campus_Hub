export type ResourceType = 'video' | 'qp' | 'book';

export interface Resource {
  id: string;
  title: string;
  subject: string;
  author: string;
  price: number;
  type: ResourceType;
  image_url: string | null;
  badge: string | null;
  description: string | null;
  likes: number;
  verified: boolean;
  views: number;
  created_at: string;
  user_id?: string | null;
  file_url?: string | null;
  file_name?: string | null;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url: string | null;
  score: number;
  rank: number | null;
  institution: string | null;
  subject_badge: string | null;
  resources_sold: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  resource_count: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  institution: string;
  bio: string;
  avatar_url: string | null;
  subject_badge: string;
  wallet_balance: number;
  resources_purchased: number;
  created_at: string;
  admin_role?: boolean;
  suspended?: boolean;
  banned?: boolean;
}

export interface Transaction {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  resource_id: string | null;
  amount: number;
  payment_status: string;
  escrow_status: string;
  order_status: string;
  created_at: string;
}

export interface Refund {
  id: string;
  transaction_id: string | null;
  buyer_id: string | null;
  reason: string;
  status: string;
  amount: number;
  created_at: string;
  resolved_at: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  channel: string;
  sent_by: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      resources: {
        Row: Resource;
        Insert: {
          title: string;
          subject: string;
          author: string;
          price?: number;
          type: ResourceType;
          image_url?: string | null;
          badge?: string | null;
          description?: string | null;
          likes?: number;
          verified?: boolean;
          views?: number;
          user_id?: string | null;
          file_url?: string | null;
          file_name?: string | null;
        };
        Update: Partial<Omit<Resource, 'id' | 'created_at'>>;
        Relationships: [];
      };
      leaderboard_users: {
        Row: LeaderboardUser;
        Insert: Omit<LeaderboardUser, 'id' | 'created_at'>;
        Update: Partial<Omit<LeaderboardUser, 'id' | 'created_at'>>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id'>;
        Update: Partial<Omit<Category, 'id'>>;
        Relationships: [];
      };
      user_profiles: {
        Row: UserProfile;
        Insert: { id: string; full_name?: string; institution?: string; bio?: string; avatar_url?: string | null; subject_badge?: string; wallet_balance?: number; resources_purchased?: number };
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
        Relationships: [];
      };
      cart_items: {
        Row: { id: string; resource_id: string; session_id: string; created_at: string };
        Insert: { resource_id: string; session_id: string };
        Update: Partial<{ resource_id: string; session_id: string }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Missing Supabase env vars. Check .env for VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type OrderStatus =
  | 'Listed'
  | 'Purchased'
  | 'AwaitingSellerSubmission'
  | 'ReceivedByLibrarian'
  | 'ReadyForBuyerPickup'
  | 'DeliveredToBuyer'
  | 'Completed'
  | 'Disputed';

export const ORDER_FLOW: OrderStatus[] = [
  'Listed',
  'Purchased',
  'AwaitingSellerSubmission',
  'ReceivedByLibrarian',
  'ReadyForBuyerPickup',
  'DeliveredToBuyer',
  'Completed',
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  Listed: 'Listed',
  Purchased: 'Purchased',
  AwaitingSellerSubmission: 'Awaiting Seller Submission',
  ReceivedByLibrarian: 'Received by Librarian',
  ReadyForBuyerPickup: 'Ready for Buyer Pickup',
  DeliveredToBuyer: 'Delivered to Buyer',
  Completed: 'Completed',
  Disputed: 'Disputed',
};

export const STATUS_PILL: Record<OrderStatus, string> = {
  Listed: 'status-Listed',
  Purchased: 'status-Purchased',
  AwaitingSellerSubmission: 'status-AwaitingSellerSubmission',
  ReceivedByLibrarian: 'status-ReceivedByLibrarian',
  ReadyForBuyerPickup: 'status-ReadyForBuyerPickup',
  DeliveredToBuyer: 'status-DeliveredToBuyer',
  Completed: 'status-Completed',
  Disputed: 'status-Disputed',
};

export interface Resource {
  id: string;
  title: string;
  subject: string;
  author: string | null;
  price: number;
  type: 'video' | 'qp' | 'book';
  image_url: string | null;
  badge: string | null;
  description: string | null;
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  institution: string | null;
  admin_role: boolean;
  librarian_role: boolean;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  resource_id: string;
  amount: number;
  order_status: OrderStatus;
  escrow_status: string;
  payment_status: string;
  created_at: string;
  submission_deadline: string | null;
  pickup_deadline: string | null;
  librarian_id: string | null;
  librarian_notes: string | null;
  penalty_applied: boolean;
  refund_initiated: boolean;
}

export interface LibrarianAlert {
  id: string;
  transaction_id: string;
  librarian_id: string | null;
  type: 'new_exchange' | 'book_submitted' | 'deadline_missed' | 'dispute' | 'pickup_overdue';
  message: string;
  read: boolean;
  created_at: string;
}

export interface TransactionDetail extends Transaction {
  resource?: Resource;
  buyer?: UserProfile;
  seller?: UserProfile;
  librarian?: UserProfile;
}

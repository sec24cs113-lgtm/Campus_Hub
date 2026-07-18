import { supabase, type Transaction, type Resource, type UserProfile, type LibrarianAlert, type OrderStatus, ORDER_FLOW, STATUS_LABEL } from '../lib/supabase';

export interface LibRow extends Transaction {
  resource: Resource | null;
  buyer: UserProfile | null;
  seller: UserProfile | null;
  librarian: UserProfile | null;
}

export async function fetchLibrarianTransactions(librarianId: string): Promise<LibRow[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      resource:resources(*),
      buyer:user_profiles!transactions_buyer_id_fkey(*),
      seller:user_profiles!transactions_seller_id_fkey(*),
      librarian:user_profiles!transactions_librarian_id_fkey(*)
    `)
    .or(`librarian_id.eq.${librarianId},librarian_id.is.null`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as unknown as LibRow[]) ?? [];
}

export async function fetchAlerts(librarianId: string): Promise<LibrarianAlert[]> {
  const { data, error } = await supabase
    .from('librarian_alerts')
    .select('*')
    .eq('librarian_id', librarianId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as LibrarianAlert[]) ?? [];
}

export async function markAlertRead(id: string) {
  await supabase.from('librarian_alerts').update({ read: true }).eq('id', id);
}

export async function markAllAlertsRead(librarianId: string) {
  await supabase.from('librarian_alerts').update({ read: true }).eq('librarian_id', librarianId).eq('read', false);
}

export async function updateOrderStatus(
  id: string,
  next: OrderStatus,
  extra?: { librarianNotes?: string; pickupDeadline?: string | null }
) {
  const patch: Record<string, unknown> = { order_status: next };
  if (extra?.librarianNotes !== undefined) patch.librarian_notes = extra.librarianNotes;
  if (extra?.pickupDeadline !== undefined) patch.pickup_deadline = extra.pickupDeadline;
  const { error } = await supabase.from('transactions').update(patch).eq('id', id);
  if (error) throw new Error(error.message);

  // create an alert for the next actor
  if (next === 'ReceivedByLibrarian') {
    await supabase.from('librarian_alerts').insert({
      transaction_id: id, type: 'book_submitted', message: 'Book received by librarian — verifying condition.',
    });
  }
}

export async function reportDispute(id: string, reason: string) {
  const { error } = await supabase
    .from('transactions')
    .update({ order_status: 'Disputed', librarian_notes: reason })
    .eq('id', id);
  if (error) throw new Error(error.message);
  await supabase.from('librarian_alerts').insert({
    transaction_id: id, type: 'dispute', message: `Dispute raised: ${reason}`,
  });
}

export async function extendPickup(id: string, extraDays: number) {
  const { data, error } = await supabase.from('transactions').select('pickup_deadline').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  const base = data?.pickup_deadline ? new Date(data.pickup_deadline) : new Date();
  const next = new Date(base.getTime() + extraDays * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from('transactions').update({ pickup_deadline: next }).eq('id', id);
}

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_FLOW.indexOf(current);
  if (idx === -1 || idx >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[idx + 1];
}

export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export function statusIndex(status: OrderStatus): number {
  const i = ORDER_FLOW.indexOf(status);
  return i === -1 ? -1 : i;
}

export { STATUS_LABEL };

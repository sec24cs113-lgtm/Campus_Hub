import { useEffect, useState } from 'react';
import { supabase, type UserProfile, type Transaction, STATUS_LABEL } from '../lib/supabase';
import StatusPill from '../components/StatusPill';

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tx, setTx] = useState<Transaction[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const [u, t] = await Promise.all([
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
    ]);
    setUsers((u.data as UserProfile[]) ?? []);
    setTx((t.data as Transaction[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const toggleLibrarian = async (id: string, val: boolean) => {
    setBusy(id);
    await supabase.from('user_profiles').update({ librarian_role: !val }).eq('id', id);
    await load();
    setBusy(null);
  };

  const releaseEscrow = async (id: string) => {
    setBusy(id);
    await supabase.from('transactions').update({
      order_status: 'Completed', escrow_status: 'released', payment_status: 'released',
    }).eq('id', id);
    await load();
    setBusy(null);
  };

  const refundBuyer = async (id: string) => {
    setBusy(id);
    await supabase.from('transactions').update({
      order_status: 'Completed', escrow_status: 'refunded', refund_initiated: true, penalty_applied: true,
    }).eq('id', id);
    await load();
    setBusy(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-extrabold mb-1">Admin Console</h1>
        <p className="muted">Manage librarian roles, escrow release, and dispute resolution.</p>
      </div>

      <section>
        <h2 className="section-title mb-3">Users & librarian access</h2>
        <div className="card divide-y divide-neutral-100">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                {(u.full_name ?? 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-800">{u.full_name ?? 'Unnamed'}</div>
                <div className="muted text-xs">{u.institution ?? '—'} {u.admin_role && '· Admin'} {u.librarian_role && '· Librarian'}</div>
              </div>
              <button onClick={() => toggleLibrarian(u.id, u.librarian_role)} disabled={busy === u.id}
                className={u.librarian_role ? 'btn-secondary text-sm' : 'btn-primary text-sm'}>
                {u.librarian_role ? 'Remove librarian' : 'Make librarian'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">Transactions & escrow</h2>
        <div className="card divide-y divide-neutral-100">
          {tx.map((t) => (
            <div key={t.id} className="p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold text-neutral-800">${Number(t.amount).toFixed(2)}</div>
                <div className="muted text-xs">
                  {new Date(t.created_at).toLocaleDateString()} · escrow: {t.escrow_status}
                </div>
              </div>
              <StatusPill status={t.order_status} />
              {t.order_status === 'DeliveredToBuyer' && (
                <button onClick={() => releaseEscrow(t.id)} disabled={busy === t.id} className="btn-primary text-sm">
                  Release payment
                </button>
              )}
              {(t.order_status === 'Disputed' || t.order_status === 'AwaitingSellerSubmission') && (
                <button onClick={() => refundBuyer(t.id)} disabled={busy === t.id} className="btn-danger text-sm">
                  Refund buyer & penalize seller
                </button>
              )}
            </div>
          ))}
          {tx.length === 0 && <div className="p-6 text-center muted">No transactions.</div>}
        </div>
      </section>
    </div>
  );
}

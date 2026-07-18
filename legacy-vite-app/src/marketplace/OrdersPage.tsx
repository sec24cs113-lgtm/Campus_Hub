import { useEffect, useState } from 'react';
import { supabase, type Transaction, type Resource, type UserProfile, STATUS_LABEL, STATUS_PILL } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Row extends Transaction {
  resource: Resource | null;
  buyer: UserProfile | null;
  seller: UserProfile | null;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          resource:resources(*),
          buyer:user_profiles!transactions_buyer_id_fkey(*),
          seller:user_profiles!transactions_seller_id_fkey(*)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) console.warn(error.message);
      setRows((data as unknown as Row[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="p-10 muted">Loading orders…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-extrabold mb-6">My orders</h1>
      {rows.length === 0 ? (
        <div className="card p-10 text-center muted">No transactions yet. When you buy or sell a book, it will appear here.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => {
            const isBuyer = t.buyer_id === user?.id;
            const counterparty = isBuyer ? t.seller : t.buyer;
            return (
              <div key={t.id} className="card p-4 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-neutral-900">{t.resource?.title ?? 'Resource'}</div>
                  <div className="muted text-xs">
                    {isBuyer ? 'Seller' : 'Buyer'}: {counterparty?.full_name ?? '—'} · ${Number(t.amount).toFixed(2)}
                  </div>
                </div>
                <span className={`badge ${STATUS_PILL[t.order_status]}`}>{STATUS_LABEL[t.order_status]}</span>
                <span className="muted text-xs">
                  {t.submission_deadline ? `Submit by ${new Date(t.submission_deadline).toLocaleDateString()}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

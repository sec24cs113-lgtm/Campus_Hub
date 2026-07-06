'use client';

import { useEffect, useState, useCallback } from 'react';
import { CreditCard, Eye, RotateCcw, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, AdminTable, AdminLoading, AdminEmpty, Badge, ActionButton } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';
import type { Transaction } from '@/lib/types';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminTransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    const { data, error } = await rawClient.from('transactions').select('*').order('created_at', { ascending: false });
    if (!error && data) setTxns(data as Transaction[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  const updateTxn = async (id: string, updates: Partial<Transaction>) => {
    await rawClient.from('transactions').update(updates).eq('id', id);
    fetchTxns();
  };

  const statusColor = (s: string) => s === 'completed' || s === 'released' ? '#10b981' : s === 'pending' || s === 'held' ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <AdminPageHeader title="Transaction Management" subtitle="View and manage all marketplace transactions" />

      {loading ? (
        <AdminLoading />
      ) : txns.length === 0 ? (
        <AdminEmpty icon={CreditCard} title="No transactions yet" subtitle="Transactions will appear here once purchases are made" />
      ) : (
        <AdminTable headers={['Buyer', 'Seller', 'Resource', 'Amount', 'Payment', 'Escrow', 'Order', 'Date', 'Actions']}>
          {txns.map((t) => (
            <tr key={t.id} className="border-t" style={{ borderColor: '#f1f5f9' }}>
              <td className="px-4 py-3 text-sm font-mono" style={{ color: '#475569' }}>{t.buyer_id?.slice(0, 8) || '—'}...</td>
              <td className="px-4 py-3 text-sm font-mono" style={{ color: '#475569' }}>{t.seller_id?.slice(0, 8) || '—'}...</td>
              <td className="px-4 py-3 text-sm font-mono" style={{ color: '#475569' }}>{t.resource_id?.slice(0, 8) || '—'}...</td>
              <td className="px-4 py-3 text-sm font-bold" style={{ color: '#1e293b' }}>{formatInr(t.amount)}</td>
              <td className="px-4 py-3"><Badge status={t.payment_status} color={statusColor(t.payment_status)} /></td>
              <td className="px-4 py-3"><Badge status={t.escrow_status} color={statusColor(t.escrow_status)} /></td>
              <td className="px-4 py-3"><Badge status={t.order_status} color={statusColor(t.order_status)} /></td>
              <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <ActionButton onClick={() => {}} icon={Eye} color="#3b82f6" title="View Details" />
                  <ActionButton onClick={() => updateTxn(t.id, { escrow_status: 'released', payment_status: 'completed', order_status: 'completed' })} icon={CheckCircle} color="#10b981" title="Release Payment" />
                  <ActionButton onClick={() => {}} icon={RotateCcw} color="#f59e0b" title="Refund" />
                  <ActionButton onClick={() => updateTxn(t.id, { order_status: 'cancelled' })} icon={XCircle} color="#ef4444" title="Cancel" />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}

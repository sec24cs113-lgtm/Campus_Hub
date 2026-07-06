'use client';

import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, AdminTable, AdminLoading, AdminEmpty, AdminFilterTabs, Badge, ActionButton } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';
import type { Refund } from '@/lib/types';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const filters = ['All', 'Pending', 'Approved', 'Rejected', 'Completed'];

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    const { data, error } = await rawClient.from('refunds').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      let filtered = data as Refund[];
      if (filter !== 'All') filtered = filtered.filter((r) => r.status === filter.toLowerCase());
      setRefunds(filtered);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const updateRefund = async (id: string, status: string) => {
    await rawClient.from('refunds').update({ status, resolved_at: new Date().toISOString() }).eq('id', id);
    fetchRefunds();
  };

  const statusColor = (s: string) => s === 'completed' || s === 'approved' ? '#10b981' : s === 'pending' ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <AdminPageHeader title="Refund Management" subtitle="Review and process refund requests" />

      <div className="mb-5">
        <AdminFilterTabs tabs={filters} active={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <AdminLoading />
      ) : refunds.length === 0 ? (
        <AdminEmpty icon={RotateCcw} title="No refund requests" subtitle="Refund requests will appear here" />
      ) : (
        <AdminTable headers={['Buyer', 'Transaction', 'Reason', 'Amount', 'Status', 'Date', 'Actions']}>
          {refunds.map((r) => (
            <tr key={r.id} className="border-t" style={{ borderColor: '#f1f5f9' }}>
              <td className="px-4 py-3 text-sm font-mono" style={{ color: '#475569' }}>{r.buyer_id?.slice(0, 8) || '—'}...</td>
              <td className="px-4 py-3 text-sm font-mono" style={{ color: '#475569' }}>{r.transaction_id?.slice(0, 8) || '—'}...</td>
              <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{r.reason || '—'}</td>
              <td className="px-4 py-3 text-sm font-bold" style={{ color: '#1e293b' }}>{formatInr(r.amount)}</td>
              <td className="px-4 py-3"><Badge status={r.status} color={statusColor(r.status)} /></td>
              <td className="px-4 py-3 text-sm" style={{ color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <ActionButton onClick={() => updateRefund(r.id, 'approved')} icon={CheckCircle} color="#10b981" title="Approve Refund" />
                  <ActionButton onClick={() => updateRefund(r.id, 'rejected')} icon={XCircle} color="#ef4444" title="Reject Refund" />
                  <ActionButton onClick={() => updateRefund(r.id, 'completed')} icon={RotateCcw} color="#3b82f6" title="Refund to Wallet" />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}

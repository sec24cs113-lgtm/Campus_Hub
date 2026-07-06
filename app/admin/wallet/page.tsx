'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, DollarSign, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, StatCard, AdminCard, AdminLoading } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminWalletPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [txns, wallets, refunds] = await Promise.all([
        rawClient.from('transactions').select('amount, escrow_status, order_status'),
        rawClient.from('user_profiles').select('wallet_balance'),
        rawClient.from('refunds').select('amount, status'),
      ]);
      const txnData = txns.data || [];
      const platformRevenue = txnData.filter((t: any) => t.order_status === 'completed').reduce((s: number, t: any) => s + t.amount, 0);
      const escrowBalance = txnData.filter((t: any) => t.escrow_status === 'held').reduce((s: number, t: any) => s + t.amount, 0);
      const totalWallets = (wallets.data || []).reduce((s: number, w: any) => s + (w.wallet_balance || 0), 0);
      const pendingPayouts = (refunds.data || []).filter((r: any) => r.status === 'pending').reduce((s: number, r: any) => s + r.amount, 0);
      const completedPayouts = (refunds.data || []).filter((r: any) => r.status === 'completed').reduce((s: number, r: any) => s + r.amount, 0);

      setData({ platformRevenue, escrowBalance, totalWallets, pendingPayouts, completedPayouts });
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader title="Wallet Management" subtitle="Platform revenue, escrow, and user wallet balances" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Platform Revenue" value={formatInr(data.platformRevenue)} icon={TrendingUp} color="#10b981" />
        <StatCard label="Escrow Balance" value={formatInr(data.escrowBalance)} icon={Wallet} color="#f59e0b" />
        <StatCard label="Student Wallets" value={formatInr(data.totalWallets)} icon={Users} color="#3b82f6" />
        <StatCard label="Pending Payouts" value={formatInr(data.pendingPayouts)} icon={Clock} color="#ef4444" />
        <StatCard label="Completed Payouts" value={formatInr(data.completedPayouts)} icon={CheckCircle} color="#10b981" />
      </div>

      <AdminCard>
        <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Recent Wallet Activity</h3>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Wallet transaction history will appear here as payments are processed.</p>
      </AdminCard>
    </div>
  );
}

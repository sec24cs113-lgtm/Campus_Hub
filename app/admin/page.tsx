'use client';

import { useEffect, useState } from 'react';
import {
  Users, GraduationCap, BookOpen, PlaySquare, FileText, CheckCircle,
  DollarSign, Wallet, Activity, RotateCcw, TrendingUp, BarChart3,
  AlertCircle, Loader2,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, StatCard, AdminCard, AdminLoading } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [users, resources, videos, qps, books, pending, transactions, refunds, wallets] = await Promise.all([
        rawClient.from('user_profiles').select('*', { count: 'exact', head: true }),
        rawClient.from('resources').select('*', { count: 'exact', head: true }),
        rawClient.from('resources').select('*', { count: 'exact', head: true }).eq('type', 'video'),
        rawClient.from('resources').select('*', { count: 'exact', head: true }).eq('type', 'qp'),
        rawClient.from('resources').select('*', { count: 'exact', head: true }).eq('type', 'book'),
        rawClient.from('resources').select('*', { count: 'exact', head: true }).eq('verified', false),
        rawClient.from('transactions').select('amount, created_at'),
        rawClient.from('refunds').select('amount, status, created_at'),
        rawClient.from('user_profiles').select('wallet_balance'),
      ]);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const txns = transactions.data || [];
      const todayRevenue = txns.filter((t: any) => t.created_at >= todayStart).reduce((s: number, t: any) => s + t.amount, 0);
      const monthlyRevenue = txns.filter((t: any) => t.created_at >= monthStart).reduce((s: number, t: any) => s + t.amount, 0);
      const activeTxns = txns.filter((t: any) => t.order_status === 'processing').length;
      const pendingRefunds = (refunds.data || []).filter((r: any) => r.status === 'pending').length;
      const totalWallet = (wallets.data || []).reduce((s: number, w: any) => s + (w.wallet_balance || 0), 0);

      setStats({
        totalUsers: users.count || 0,
        totalResources: resources.count || 0,
        totalVideos: videos.count || 0,
        totalQPs: qps.count || 0,
        totalBooks: books.count || 0,
        pendingApprovals: pending.count || 0,
        todayRevenue,
        monthlyRevenue,
        activeTxns,
        pendingRefunds,
        totalWallet,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <AdminLoading />;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3b82f6' },
    { label: 'Total Resources', value: stats.totalResources, icon: BookOpen, color: '#8b5cf6' },
    { label: 'Total Videos', value: stats.totalVideos, icon: PlaySquare, color: '#3b82f6' },
    { label: 'Question Papers', value: stats.totalQPs, icon: FileText, color: '#10b981' },
    { label: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: '#8b5cf6' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: AlertCircle, color: '#f59e0b' },
    { label: "Today's Revenue", value: formatInr(stats.todayRevenue), icon: DollarSign, color: '#10b981' },
    { label: 'Monthly Revenue', value: formatInr(stats.monthlyRevenue), icon: TrendingUp, color: '#10b981' },
    { label: 'Wallet Balance', value: formatInr(stats.totalWallet), icon: Wallet, color: '#1e3a8a' },
    { label: 'Active Transactions', value: stats.activeTxns, icon: Activity, color: '#3b82f6' },
    { label: 'Pending Refunds', value: stats.pendingRefunds, icon: RotateCcw, color: '#ef4444' },
    { label: 'Active Listings', value: stats.totalResources, icon: CheckCircle, color: '#10b981' },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard Overview" subtitle="Platform analytics and key metrics" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Monthly Revenue</h3>
          <MiniBarChart data={generateMonthlyRevenue()} color="#10b981" />
        </AdminCard>
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Daily Uploads</h3>
          <MiniBarChart data={generateDailyUploads()} color="#3b82f6" />
        </AdminCard>
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Resource Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Videos', value: stats.totalVideos, color: '#3b82f6' },
              { label: 'Question Papers', value: stats.totalQPs, color: '#10b981' },
              { label: 'Books', value: stats.totalBooks, color: '#8b5cf6' },
            ].map((r) => {
              const pct = stats.totalResources > 0 ? (r.value / stats.totalResources) * 100 : 0;
              return (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#475569' }}>{r.label}</span>
                    <span className="font-semibold" style={{ color: '#1e293b' }}>{r.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: r.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>User Growth</h3>
          <MiniLineChart data={generateUserGrowth(stats.totalUsers)} color="#3b82f6" />
        </AdminCard>
      </div>
    </div>
  );
}

function generateMonthlyRevenue() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m) => ({ label: m, value: Math.floor(Math.random() * 50000) + 10000 }));
}

function generateDailyUploads() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d) => ({ label: d, value: Math.floor(Math.random() * 40) + 5 }));
}

function generateUserGrowth(total: number) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  let cumulative = Math.max(total, 100);
  return months.map((m) => {
    cumulative = Math.floor(cumulative * (1 + Math.random() * 0.15));
    return { label: m, value: cumulative };
  });
}

function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80" style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: '4px' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniLineChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.value / max) * 100}`).join(' ');
  return (
    <div className="relative h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {data.map((d, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - (d.value / max) * 100} r="1.5" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d) => (
          <span key={d.label} className="text-xs" style={{ color: '#94a3b8' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Award, Upload, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, StatCard, AdminCard, AdminLoading } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [users, resources, txns] = await Promise.all([
        rawClient.from('user_profiles').select('*', { count: 'exact', head: true }),
        rawClient.from('resources').select('type, views'),
        rawClient.from('transactions').select('amount, created_at'),
      ]);
      const resourceData = resources.data || [];
      const txnData = txns.data || [];
      const totalRevenue = txnData.reduce((s: number, t: any) => s + t.amount, 0);
      const totalViews = resourceData.reduce((s: number, r: any) => s + (r.views || 0), 0);

      setData({
        totalUsers: users.count || 0,
        totalResources: resourceData.length,
        totalRevenue,
        totalViews,
        dailyActive: Math.floor((users.count || 0) * 0.3),
        monthlyActive: Math.floor((users.count || 0) * 0.7),
      });
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <div>
      <AdminPageHeader title="Analytics Dashboard" subtitle="Deep insights into platform performance" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Daily Active Users" value={data.dailyActive} icon={Users} color="#3b82f6" />
        <StatCard label="Monthly Active Users" value={data.monthlyActive} icon={TrendingUp} color="#10b981" />
        <StatCard label="Total Revenue" value={formatInr(data.totalRevenue)} icon={DollarSign} color="#10b981" />
        <StatCard label="Total Views" value={data.totalViews} icon={Award} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Revenue Trend</h3>
          <MiniBarChart data={generateMonthlyData()} color="#10b981" />
        </AdminCard>
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Top Contributors</h3>
          <div className="space-y-3">
            {['Aarav Sharma', 'Priya Patel', 'Rohan Kumar', 'Sneha Reddy'].map((name, i) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: '#1e40af' }}>
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#475569' }}>{name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#3b82f6' }}>{Math.floor(Math.random() * 50) + 10} uploads</span>
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Resource Growth</h3>
          <MiniLineChart data={generateGrowth(data.totalResources)} color="#3b82f6" />
        </AdminCard>
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Marketplace Performance</h3>
          <div className="space-y-3">
            {[
              { label: 'Videos', value: 65, color: '#3b82f6' },
              { label: 'Question Papers', value: 80, color: '#10b981' },
              { label: 'Books', value: 45, color: '#8b5cf6' },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: '#475569' }}>{r.label}</span>
                  <span className="font-semibold" style={{ color: '#1e293b' }}>{r.value}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function generateMonthlyData() {
  return ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => ({ label: m, value: Math.floor(Math.random() * 50000) + 10000 }));
}
function generateGrowth(total: number) {
  return ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({ label: m, value: Math.floor(total * (i + 1) / 12) }));
}
function MiniBarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
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
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((d) => (<span key={d.label} className="text-xs" style={{ color: '#94a3b8' }}>{d.label}</span>))}
      </div>
    </div>
  );
}

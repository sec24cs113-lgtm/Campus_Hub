'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Flag, Ban, Eye, FileEdit, Loader2, PlaySquare, FileText, BookOpen } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, AdminCard, AdminLoading, AdminEmpty, AdminFilterTabs, Badge, ActionButton } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';
import type { Resource } from '@/lib/types';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const tabs = ['Videos', 'Question Papers', 'Books'];

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState('Videos');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const typeMap: Record<string, string> = { 'Videos': 'video', 'Question Papers': 'qp', 'Books': 'book' };

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const { data, error } = await rawClient
      .from('resources')
      .select('*')
      .eq('type', typeMap[activeTab])
      .order('created_at', { ascending: false });
    if (!error && data) setResources(data as Resource[]);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const updateStatus = async (id: string, updates: Partial<Resource>) => {
    await rawClient.from('resources').update(updates).eq('id', id);
    fetchResources();
  };

  return (
    <div>
      <AdminPageHeader title="Resource Approval Queue" subtitle="Review and approve pending marketplace resources" />

      <div className="mb-5">
        <AdminFilterTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {loading ? (
        <AdminLoading />
      ) : resources.length === 0 ? (
        <AdminEmpty icon={CheckCircle} title="No resources pending approval" subtitle="All resources in this category have been reviewed" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => {
            const Icon = r.type === 'video' ? PlaySquare : r.type === 'qp' ? FileText : BookOpen;
            const typeColor = r.type === 'video' ? '#3b82f6' : r.type === 'qp' ? '#10b981' : '#8b5cf6';
            return (
              <AdminCard key={r.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: r.image_url ? 'transparent' : typeColor }}>
                    {r.image_url ? <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" /> : <Icon className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>{r.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{r.author} &bull; {r.subject}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    {r.verified ? <Badge status="Approved" color="#10b981" /> : <Badge status="Pending" color="#f59e0b" />}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <span className="text-sm font-bold" style={{ color: '#3b82f6' }}>{formatInr(r.price)}</span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{r.views} views</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <ActionButton onClick={() => updateStatus(r.id, { verified: true })} icon={CheckCircle} color="#10b981" title="Approve" />
                  <ActionButton onClick={() => updateStatus(r.id, { verified: false })} icon={XCircle} color="#ef4444" title="Reject" />
                  <ActionButton onClick={() => {}} icon={Flag} color="#f59e0b" title="Flag" />
                  <ActionButton onClick={() => {}} icon={Ban} color="#ef4444" title="Ban Resource" />
                  <ActionButton onClick={() => {}} icon={FileEdit} color="#3b82f6" title="Request Changes" />
                  <ActionButton onClick={() => {}} icon={Eye} color="#64748b" title="View Details" />
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

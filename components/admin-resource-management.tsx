'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, AdminTable, AdminLoading, AdminEmpty, AdminFilterTabs, Badge, ActionButton } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';
import type { Resource } from '@/lib/types';
import { Eye, Edit3, CheckCircle, XCircle, Trash2, BarChart2 } from 'lucide-react';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const filters = ['All', 'Pending', 'Approved', 'Rejected'];

export function createResourceManagementPage(resourceType: string, pageTitle: string, pageSubtitle: string) {
  return function ResourceManagementPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchResources = useCallback(async () => {
      setLoading(true);
      let q = rawClient.from('resources').select('*').eq('type', resourceType).order('created_at', { ascending: false });
      const { data, error } = await q;
      if (!error && data) {
        let filtered = data as Resource[];
        if (filter === 'Pending') filtered = filtered.filter((r) => !r.verified);
        else if (filter === 'Approved') filtered = filtered.filter((r) => r.verified);
        setResources(filtered);
      }
      setLoading(false);
    }, [filter]);

    useEffect(() => { fetchResources(); }, [fetchResources]);

    const updateResource = async (id: string, updates: Partial<Resource>) => {
      await rawClient.from('resources').update(updates).eq('id', id);
      fetchResources();
    };

    const deleteResource = async (id: string, fileUrl?: string | null) => {
      if (fileUrl) await rawClient.storage.from('resource-files').remove([fileUrl]);
      await rawClient.from('resources').delete().eq('id', id);
      fetchResources();
    };

    return (
      <div>
        <AdminPageHeader title={pageTitle} subtitle={pageSubtitle} />

        <div className="mb-5">
          <AdminFilterTabs tabs={filters} active={filter} onChange={setFilter} />
        </div>

        {loading ? (
          <AdminLoading />
        ) : resources.length === 0 ? (
          <AdminEmpty icon={Eye} title="No resources found" subtitle="Try a different filter" />
        ) : (
          <AdminTable headers={['Title', 'Author', 'Subject', 'Price', 'Views', 'Status', 'Actions']}>
            {resources.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: '#f1f5f9' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: r.image_url ? 'transparent' : '#3b82f6' }}>
                      {r.image_url ? <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" /> : <Eye className="w-5 h-5 text-white" />}
                    </div>
                    <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{r.title}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{r.author}</td>
                <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{r.subject}</td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#3b82f6' }}>{formatInr(r.price)}</td>
                <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{r.views}</td>
                <td className="px-4 py-3">
                  {r.verified ? <Badge status="Approved" color="#10b981" /> : <Badge status="Pending" color="#f59e0b" />}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <ActionButton onClick={() => {}} icon={Edit3} color="#3b82f6" title="Edit Metadata" />
                    <ActionButton onClick={() => updateResource(r.id, { verified: true })} icon={CheckCircle} color="#10b981" title="Approve" />
                    <ActionButton onClick={() => updateResource(r.id, { verified: false })} icon={XCircle} color="#ef4444" title="Reject" />
                    <ActionButton onClick={() => {}} icon={BarChart2} color="#8b5cf6" title="View Analytics" />
                    <ActionButton onClick={() => deleteResource(r.id, r.file_url)} icon={Trash2} color="#ef4444" title="Delete" />
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    );
  };
}

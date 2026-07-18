'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, Eye, Ban, CheckCircle, AlertTriangle, Trash2, KeyRound,
  Shield, Search, Loader2, UserCog,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, AdminCard, AdminTable, AdminLoading, AdminEmpty, AdminFilterTabs, Badge, ActionButton } from '@/components/admin-ui';
import { formatInr } from '@/lib/currency';
import type { UserProfile } from '@/lib/types';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const filters = ['All', 'Students', 'Admins', 'Suspended', 'Banned'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let q = rawClient.from('user_profiles').select('*').order('created_at', { ascending: false });
    if (filter === 'Admins') q = q.eq('admin_role', true);
    else if (filter === 'Suspended') q = q.eq('suspended', true);
    else if (filter === 'Banned') q = q.eq('banned', true);
    else if (filter === 'Students') q = q.eq('admin_role', false);
    q = q.range(page * pageSize, (page + 1) * pageSize - 1);
    const { data, error } = await q;
    if (!error && data) setUsers(data as UserProfile[]);
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateField = async (id: string, field: string, value: boolean) => {
    await rawClient.from('user_profiles').update({ [field]: value }).eq('id', id);
    fetchUsers();
  };

  const filtered = query
    ? users.filter((u) => u.full_name.toLowerCase().includes(query.toLowerCase()) || u.id.includes(query))
    : users;

  return (
    <div>
      <AdminPageHeader title="User Management" subtitle="Manage all registered users on the platform" />

      <div className="flex items-center justify-between mb-5">
        <AdminFilterTabs tabs={filters} active={filter} onChange={(t) => { setFilter(t); setPage(0); }} />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white"
            style={{ border: '1.5px solid #e2e8f0', color: '#475569', width: '240px' }}
          />
        </div>
      </div>

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <AdminEmpty icon={Users} title="No users found" subtitle="Try a different filter or search term" />
      ) : (
        <>
          <AdminTable headers={['User', 'Institution', 'Role', 'Status', 'Wallet', 'Actions']}>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: '#f1f5f9' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: '#1e40af' }}>
                      {u.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{u.full_name || 'Unknown'}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{u.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{u.institution || '—'}</td>
                <td className="px-4 py-3">
                  {u.admin_role ? <Badge status="Admin" color="#3b82f6" /> : <Badge status="Student" color="#10b981" />}
                </td>
                <td className="px-4 py-3">
                  {u.banned ? <Badge status="Banned" color="#ef4444" /> : u.suspended ? <Badge status="Suspended" color="#f59e0b" /> : <Badge status="Active" color="#10b981" />}
                </td>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#1e293b' }}>{formatInr(u.wallet_balance)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <ActionButton onClick={() => {}} icon={Eye} color="#3b82f6" title="View Profile" />
                    {u.suspended ? (
                      <ActionButton onClick={() => updateField(u.id, 'suspended', false)} icon={CheckCircle} color="#10b981" title="Unsuspend" />
                    ) : (
                      <ActionButton onClick={() => updateField(u.id, 'suspended', true)} icon={AlertTriangle} color="#f59e0b" title="Suspend" />
                    )}
                    <ActionButton onClick={() => updateField(u.id, 'banned', !u.banned)} icon={Ban} color="#ef4444" title={u.banned ? "Unban" : "Ban"} />
                    <ActionButton onClick={() => updateField(u.id, 'admin_role', !u.admin_role)} icon={UserCog} color="#8b5cf6" title="Change Role" />
                    <ActionButton onClick={() => {}} icon={KeyRound} color="#64748b" title="Reset Password" />
                    <ActionButton onClick={() => {}} icon={Trash2} color="#ef4444" title="Delete Account" />
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm" style={{ color: '#94a3b8' }}>Page {page + 1}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', color: '#475569' }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={filtered.length < pageSize}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', color: '#475569' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BookMarked, Users, CheckCircle, XCircle, Eye, UserPlus, MapPin, AlertTriangle,
  Clock, Package, Truck, Loader2, Search,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageHeader, StatCard, AdminCard, AdminTable, AdminLoading, AdminEmpty, AdminFilterTabs, Badge, ActionButton } from '@/components/admin-ui';
import type { UserProfile } from '@/lib/types';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Librarian extends UserProfile {
  librarian_role?: boolean;
}

interface Pickup {
  id: string;
  book_id: string;
  book_title: string;
  buyer_name: string;
  seller_name: string;
  status: string;
  scheduled_date: string;
  location: string;
  notes: string;
}

const pickupTabs = ['Pending', 'Scheduled', 'Completed', 'Issues'];

export default function AdminLibrariansPage() {
  const [librarians, setLibrarians] = useState<Librarian[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickupTab, setPickupTab] = useState('Pending');
  const [query, setQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: libData } = await rawClient
      .from('user_profiles')
      .select('*')
      .eq('librarian_role', true)
      .order('created_at', { ascending: false });
    setLibrarians((libData as Librarian[]) || []);

    // Generate mock pickup data for demonstration
    const mockPickups: Pickup[] = [
      { id: '1', book_id: 'b1', book_title: 'Advanced Physics', buyer_name: 'Aarav Sharma', seller_name: 'Priya Patel', status: 'pending', scheduled_date: new Date().toISOString(), location: 'Library Desk A', notes: '' },
      { id: '2', book_id: 'b2', book_title: 'Calculus Made Easy', buyer_name: 'Rohan Kumar', seller_name: 'Sneha Reddy', status: 'scheduled', scheduled_date: new Date().toISOString(), location: 'Main Gate', notes: 'Bring ID proof' },
      { id: '3', book_id: 'b3', book_title: 'Data Structures', buyer_name: 'Anil Gupta', seller_name: 'Meera Singh', status: 'completed', scheduled_date: new Date(Date.now() - 86400000).toISOString(), location: 'Cafeteria', notes: '' },
      { id: '4', book_id: 'b4', book_title: 'Organic Chemistry', buyer_name: 'Vikram Joshi', seller_name: 'Kavita Nair', status: 'issues', scheduled_date: new Date().toISOString(), location: 'Hostel Block B', notes: 'Buyer not available' },
    ];
    setPickups(mockPickups);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateLibrarianRole = async (id: string, role: boolean) => {
    await rawClient.from('user_profiles').update({ librarian_role: role }).eq('id', id);
    fetchData();
  };

  const filteredLibrarians = query
    ? librarians.filter((l) => l.full_name?.toLowerCase().includes(query.toLowerCase()))
    : librarians;

  const filteredPickups = pickups.filter((p) => {
    if (pickupTab === 'Pending') return p.status === 'pending';
    if (pickupTab === 'Scheduled') return p.status === 'scheduled';
    if (pickupTab === 'Completed') return p.status === 'completed';
    if (pickupTab === 'Issues') return p.status === 'issues';
    return true;
  });

  const pickupStatusColor = (s: string) => {
    if (s === 'completed') return '#10b981';
    if (s === 'scheduled') return '#3b82f6';
    if (s === 'pending') return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Librarian Management" subtitle="Manage librarians and oversee book pickup coordination" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Librarians" value={librarians.length} icon={BookMarked} color="#8b5cf6" />
        <StatCard label="Pending Pickups" value={pickups.filter(p => p.status === 'pending').length} icon={Clock} color="#f59e0b" />
        <StatCard label="Completed Deliveries" value={pickups.filter(p => p.status === 'completed').length} icon={CheckCircle} color="#10b981" />
        <StatCard label="Reported Issues" value={pickups.filter(p => p.status === 'issues').length} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Librarians List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: '#1e293b' }}>Librarians</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search librarians..."
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white"
              style={{ border: '1.5px solid #e2e8f0', color: '#475569', width: '240px' }}
            />
          </div>
        </div>

        {filteredLibrarians.length === 0 ? (
          <AdminEmpty icon={BookMarked} title="No librarians found" subtitle="Assign librarian role to students" />
        ) : (
          <AdminTable headers={['Name', 'Institution', 'Status', 'Actions']}>
            {filteredLibrarians.map((l) => (
              <tr key={l.id} className="border-t" style={{ borderColor: '#f1f5f9' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: '#8b5cf6' }}>
                      {l.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{l.full_name}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{l.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#475569' }}>{l.institution || '—'}</td>
                <td className="px-4 py-3">
                  <Badge status="Active" color="#10b981" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <ActionButton onClick={() => {}} icon={Eye} color="#3b82f6" title="View Profile" />
                    <ActionButton onClick={() => updateLibrarianRole(l.id, false)} icon={XCircle} color="#ef4444" title="Remove Librarian" />
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>

      {/* Pickup Coordination */}
      <div>
        <h2 className="font-bold text-lg mb-4" style={{ color: '#1e293b' }}>Pickup Coordination</h2>

        <div className="mb-5">
          <AdminFilterTabs tabs={pickupTabs} active={pickupTab} onChange={setPickupTab} />
        </div>

        {filteredPickups.length === 0 ? (
          <AdminEmpty icon={Package} title="No pickups found" subtitle="Pickups will appear here when book orders are placed" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPickups.map((p) => (
              <AdminCard key={p.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                      <Package className="w-5 h-5" style={{ color: '#10b981' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{p.book_title}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{new Date(p.scheduled_date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <Badge status={p.status} color={pickupStatusColor(p.status)} />
                </div>

                <div className="space-y-2 mb-3 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#475569' }}>Buyer: <strong style={{ color: '#1e293b' }}>{p.buyer_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#475569' }}>Seller: <strong style={{ color: '#1e293b' }}>{p.seller_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#475569' }}>{p.location}</span>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-xs p-2 rounded-lg mb-3" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                    Note: {p.notes}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {}}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Assign Librarian
                  </button>
                  <button
                    onClick={() => {}}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </AdminCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

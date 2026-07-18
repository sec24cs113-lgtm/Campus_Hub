'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AdminSidebar from '@/components/admin-sidebar';
import AdminTopBar from '@/components/admin-top-bar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const isAdmin = profile?.admin_role === true || user?.email?.endsWith('@college.edu.in');
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    setChecked(true);
  }, [user, profile, loading, router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#f0f3fb' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f0f3fb' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '224px' }}>
        <AdminTopBar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

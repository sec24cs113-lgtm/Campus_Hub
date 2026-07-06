'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './sidebar';
import TopBar from './top-bar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (loading) return;
    if (!user && !isLoginPage) {
      router.replace('/login');
    } else if (user && isLoginPage) {
      router.replace('/');
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f3fb' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse"
            style={{ backgroundColor: '#0d1b3e' }}
          >
            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: '#3b82f6', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f0f3fb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '208px' }}>
        <TopBar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
      {/* Floating Upload Button */}
      <Link
        href="/upload"
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 group"
        style={{
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
        }}
        title="Upload a resource"
      >
        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
        <span className="hidden sm:inline">Upload</span>
      </Link>
    </div>
  );
}

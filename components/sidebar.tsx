'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, PlaySquare, FileText, BookOpen, BarChart2,
  User, GraduationCap, LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/videos', icon: PlaySquare, label: 'Video Marketplace' },
  { href: '/qp', icon: FileText, label: 'QP Marketplace' },
  { href: '/books', icon: BookOpen, label: 'Book Marketplace' },
  { href: '/leaderboard', icon: BarChart2, label: 'Leaderboard' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 flex flex-col z-30" style={{ backgroundColor: '#0d1b3e' }}>
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">CollegeHub</span>
        </div>
        <p className="text-xs font-semibold tracking-widest ml-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ACADEMIC MARKETPLACE
        </p>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 sidebar-scroll overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group"
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ backgroundColor: '#3b82f6' }}
                />
              )}
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? '#60a5fa' : 'inherit' }}
              />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 mt-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

      {/* User Profile */}
      <div className="px-3 py-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/50"
              style={{ backgroundColor: '#1e40af' }}
            >
              {initials}
            </div>
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ backgroundColor: '#10b981', borderColor: '#0d1b3e' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate">{displayName}</p>
          <p className="text-xs font-bold tracking-wider truncate" style={{ color: '#fbbf24' }}>
            PREMIUM MEMBER
          </p>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

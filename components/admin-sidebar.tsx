'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, CheckCircle, PlaySquare, FileText, BookOpen,
  CreditCard, Wallet, RotateCcw, Bell, FileBarChart, BarChart3,
  Settings, LogOut, GraduationCap, Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navSections = [
  {
    label: 'Main',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/users', icon: Users, label: 'Users' },
      { href: '/admin/approvals', icon: CheckCircle, label: 'Approvals' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { href: '/admin/videos', icon: PlaySquare, label: 'Videos' },
      { href: '/admin/question-papers', icon: FileText, label: 'Question Papers' },
      { href: '/admin/books', icon: BookOpen, label: 'Books' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
      { href: '/admin/wallet', icon: Wallet, label: 'Wallet' },
      { href: '/admin/refunds', icon: RotateCcw, label: 'Refunds' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
      { href: '/admin/reports', icon: FileBarChart, label: 'Reports' },
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { href: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 flex flex-col z-30" style={{ backgroundColor: '#0a1628' }}>
      <div className="px-5 pt-7 pb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1e40af' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight block leading-tight">CollegeHub</span>
            <span className="text-xs font-bold tracking-widest" style={{ color: '#60a5fa' }}>ADMIN PANEL</span>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto sidebar-scroll">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-bold tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {section.label.toUpperCase()}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => {
                const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group"
                    style={{
                      backgroundColor: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      }
                    }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ backgroundColor: '#3b82f6' }} />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#60a5fa' : 'inherit' }} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-5 mt-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />

      <div className="px-3 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: '#1e40af' }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-semibold truncate">{displayName}</p>
          <p className="text-xs font-bold tracking-wider truncate" style={{ color: '#fbbf24' }}>ADMIN</p>
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

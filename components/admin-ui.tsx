'use client';

import { ReactNode } from 'react';
import { Loader2, Search } from 'lucide-react';

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-bold text-2xl" style={{ color: '#1e293b' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color, trend, subtitle }: { label: string; value: string | number; icon: any; color: string; trend?: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl p-5 transition-all hover:shadow-md" style={{ backgroundColor: '#ffffff', border: '1px solid #e8edf5' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>{label}</p>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{subtitle}</p>}
    </div>
  );
}

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ backgroundColor: '#ffffff', border: '1px solid #e8edf5' }}>
      {children}
    </div>
  );
}

export function AdminSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white"
        style={{ border: '1.5px solid #e2e8f0', color: '#475569', width: '240px' }}
        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
      />
    </div>
  );
}

export function AdminFilterTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: active === t ? '#3b82f6' : '#ffffff',
            color: active === t ? '#ffffff' : '#475569',
            border: `1.5px solid ${active === t ? '#3b82f6' : '#e2e8f0'}`,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function AdminTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e8edf5' }}>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-bold tracking-wider uppercase" style={{ color: '#64748b' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function AdminTableRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      className="transition-colors cursor-pointer"
      style={{ backgroundColor: 'transparent', borderBottom: '1px solid #f1f5f9' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`} style={{ color: '#475569' }}>{children}</td>;
}

export function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3b82f6' }} />
    </div>
  );
}

export function AdminEmpty({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-12 h-12 mb-4" style={{ color: '#cbd5e1' }} />
      <p className="font-semibold" style={{ color: '#64748b' }}>{title}</p>
      {subtitle && <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{subtitle}</p>}
    </div>
  );
}

export function Badge({ status, color }: { status: string; color: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: `${color}15`, color }}>
      {status}
    </span>
  );
}

export function ActionButton({ onClick, icon: Icon, color, title, disabled }: { onClick: () => void; icon: any; color: string; title: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70 disabled:opacity-50"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export function AdminButton({ children, onClick, variant = 'primary', disabled, className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean; className?: string }) {
  const colors = {
    primary: { bg: '#3b82f6', color: '#ffffff', border: 'none' },
    secondary: { bg: '#ffffff', color: '#475569', border: '#e2e8f0' },
    danger: { bg: '#ef4444', color: '#ffffff', border: 'none' },
  };
  const style = colors[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: variant === 'secondary' ? `1.5px solid ${style.border}` : 'none',
      }}
    >
      {children}
    </button>
  );
}

export function AdminSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2.5 rounded-xl text-sm outline-none"
      style={{ border: '1.5px solid #e2e8f0', color: '#475569', backgroundColor: '#ffffff' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

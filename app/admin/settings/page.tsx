'use client';

import { useState } from 'react';
import { Settings, Save, Loader2, Globe, CreditCard, Bell, Shield } from 'lucide-react';
import { AdminPageHeader, AdminCard } from '@/components/admin-ui';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Configure platform-wide settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
              <Settings className="w-5 h-5" style={{ color: '#3b82f6' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#1e293b' }}>Platform Settings</h3>
          </div>
          <div className="space-y-4">
            <SettingToggle label="Allow new registrations" defaultOn />
            <SettingToggle label="Require email verification" defaultOn={false} />
            <SettingToggle label="Maintenance mode" defaultOn={false} />
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <Globe className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#1e293b' }}>Approved College Domains</h3>
          </div>
          <div className="space-y-2">
            {['@college.edu.in', '@university.ac.in', '@iit.ac.in'].map((d) => (
              <div key={d} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
                <span className="text-sm font-mono" style={{ color: '#475569' }}>{d}</span>
                <button className="text-xs font-semibold" style={{ color: '#ef4444' }}>Remove</button>
              </div>
            ))}
            <input
              placeholder="Add new domain..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
            />
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#1e293b' }}>Payment Gateway</h3>
          </div>
          <div className="space-y-4">
            <SettingToggle label="Enable escrow payments" defaultOn />
            <SettingToggle label="Auto-release after 7 days" defaultOn />
            <SettingToggle label="Allow wallet payments" defaultOn />
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef2f2' }}>
              <Shield className="w-5 h-5" style={{ color: '#ef4444' }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: '#1e293b' }}>Security Settings</h3>
          </div>
          <div className="space-y-4">
            <SettingToggle label="Two-factor authentication" defaultOn />
            <SettingToggle label="Session timeout (30 min)" defaultOn />
            <SettingToggle label="IP whitelist for admin access" defaultOn={false} />
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function SettingToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: '#475569' }}>{label}</span>
      <button
        onClick={() => setOn(!on)}
        className="w-11 h-6 rounded-full transition-all relative"
        style={{ backgroundColor: on ? '#3b82f6' : '#cbd5e1' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
          style={{ left: on ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}

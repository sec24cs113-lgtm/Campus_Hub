'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, PlaySquare, FileText, Star, TrendingUp,
  ShoppingBag, Edit3, CheckCircle, CreditCard, Award,
  Save, X, Loader2, User, Trash2, Upload as UploadIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { formatInr } from '@/lib/currency';
import type { Resource } from '@/lib/types';

const tabs = ['Overview', 'My Uploads', 'My Purchases', 'Settings'];

const defaultSettings = [
  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Get notified about new resources in your subjects', on: true },
  { key: 'leaderboardVisibility', label: 'Leaderboard Visibility', desc: 'Show your profile on the public leaderboard', on: true },
  { key: 'purchaseReceipts', label: 'Purchase Receipts', desc: 'Receive email receipts for all transactions', on: false },
  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of trending academic resources', on: true },
];

const typeIcon = { video: PlaySquare, book: BookOpen, qp: FileText } as const;
const typeColor = { video: '#3b82f6', book: '#8b5cf6', qp: '#10b981' } as const;
const typeLabel = { video: 'Video', book: 'Book', qp: 'Question Paper' } as const;

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [editName, setEditName] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSubject, setEditSubject] = useState('');

  const [uploads, setUploads] = useState<Resource[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchUploads = useCallback(async () => {
    if (!user) return;
    setUploadsLoading(true);
    setDeleteError(null);
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setDeleteError(error.message);
    } else {
      setUploads(data as Resource[]);
    }
    setUploadsLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'My Uploads' && user) {
      fetchUploads();
    }
  }, [activeTab, user, fetchUploads]);

  const handleDelete = async (resource: Resource) => {
    if (!user) return;
    setDeletingId(resource.id);
    setDeleteError(null);
    try {
      if (resource.file_url) {
        await supabase.storage.from('resource-files').remove([resource.file_url]);
      }
      const { error } = await supabase.from('resources').delete().eq('id', resource.id);
      if (error) throw new Error(error.message);
      setUploads((prev) => prev.filter((r) => r.id !== resource.id));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete resource.');
    } finally {
      setDeletingId(null);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const startEdit = () => {
    setEditName(profile?.full_name || displayName);
    setEditInstitution(profile?.institution || '');
    setEditBio(profile?.bio || '');
    setEditSubject(profile?.subject_badge || '');
    setSaveError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      full_name: editName.trim(),
      institution: editInstitution.trim(),
      bio: editBio.trim(),
      subject_badge: editSubject.trim(),
    });
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div
        className="rounded-2xl p-6 flex items-start gap-6"
        style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #1e3a8a 100%)' }}
      >
        <div className="relative flex-shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl ring-4 ring-white/20"
              style={{ backgroundColor: '#1e40af', color: '#93c5fd' }}
            >
              {initials}
            </div>
          )}
          <span
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ backgroundColor: '#10b981', borderColor: '#0d1b3e' }}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Full Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm font-semibold text-white outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Institution</label>
                  <input
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    placeholder="e.g. MIT"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Subject / Expertise</label>
                <input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  placeholder="Tell the community about yourself…"
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              {saveError && (
                <p className="text-xs" style={{ color: '#fca5a5' }}>{saveError}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-white font-bold text-xl">{displayName}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#f59e0b', color: '#0d1b3e' }}>
                    PREMIUM MEMBER
                  </span>
                  {(profile?.institution || profile?.subject_badge) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                      {[profile.institution, profile.subject_badge].filter(Boolean).join(' \u2022 ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={startEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Resources Purchased', value: String(profile?.resources_purchased ?? 0), icon: ShoppingBag, color: '#3b82f6' },
          { label: 'Wallet Balance', value: formatInr(profile?.wallet_balance ?? 0), icon: CreditCard, color: '#10b981' },
          { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '—', icon: Award, color: '#f59e0b' },
          { label: 'Subject Focus', value: profile?.subject_badge || 'Not set', icon: TrendingUp, color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{ border: '1px solid #e8edf5' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight truncate" style={{ color: '#1e293b' }}>{value}</p>
              <p className="text-xs leading-tight" style={{ color: '#94a3b8' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e8edf5' }}>
        <div className="flex" style={{ borderBottom: '1px solid #e8edf5' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-4 text-sm font-medium transition-colors relative"
              style={{ color: activeTab === tab ? '#3b82f6' : '#94a3b8' }}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#3b82f6' }} />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-xs mb-2" style={{ color: '#64748b' }}>ABOUT</h3>
                {profile?.bio ? (
                  <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{profile.bio}</p>
                ) : (
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1' }}
                    onClick={startEdit}
                  >
                    <User className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Add a bio to tell the community about yourself &rarr;</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>ACCOUNT DETAILS</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>Email</span>
                      <span className="text-xs font-medium truncate ml-2" style={{ color: '#475569' }}>{email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>Institution</span>
                      <span className="text-xs font-medium" style={{ color: '#475569' }}>{profile?.institution || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>Subject</span>
                      <span className="text-xs font-medium" style={{ color: '#475569' }}>{profile?.subject_badge || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#94a3b8' }}>Member since</span>
                      <span className="text-xs font-medium" style={{ color: '#475569' }}>
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>ACHIEVEMENTS</p>
                  <div className="space-y-1.5">
                    {[
                      profile?.resources_purchased && profile.resources_purchased > 0 ? `${profile.resources_purchased} resources purchased` : null,
                      profile?.subject_badge ? `${profile.subject_badge} enthusiast` : null,
                      'Verified member',
                    ].filter(Boolean).map((a) => (
                      <div key={a!} className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                        <span className="text-xs capitalize" style={{ color: '#475569' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'My Uploads' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-lg" style={{ color: '#1e293b' }}>My Uploads</h2>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>Resources you&apos;ve shared with the community.</p>
                </div>
                <a
                  href="/upload"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload New
                </a>
              </div>

              {deleteError && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                  {deleteError}
                </div>
              )}

              {uploadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#3b82f6' }} />
                </div>
              ) : uploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UploadIcon className="w-12 h-12 mb-4" style={{ color: '#cbd5e1' }} />
                  <p className="font-semibold" style={{ color: '#64748b' }}>No uploads yet</p>
                  <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Share your first resource with the community.</p>
                  <a
                    href="/upload"
                    className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold inline-block"
                    style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                  >
                    Upload a Resource
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploads.map((r) => {
                    const Icon = r.type === 'video' ? PlaySquare : r.type === 'qp' ? FileText : BookOpen;
                    const typeColor = r.type === 'video' ? '#3b82f6' : r.type === 'qp' ? '#10b981' : '#8b5cf6';
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-4 p-4 rounded-xl transition-all"
                        style={{ backgroundColor: '#ffffff', border: '1px solid #e8edf5' }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: r.image_url ? 'transparent' : typeColor }}
                        >
                          {r.image_url ? (
                            <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                          ) : (
                            <Icon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: '#1e293b' }}>{r.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                            {r.subject} &bull; {r.author} &bull; <span className="capitalize">{r.type}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="font-bold text-sm" style={{ color: '#3b82f6' }}>{formatInr(r.price)}</span>
                            {r.verified ? (
                              <span className="flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: '#94a3b8' }}>Pending review</span>
                            )}
                            <span className="text-xs" style={{ color: '#94a3b8' }}>
                              {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(r)}
                          disabled={deletingId === r.id}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50"
                          style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
                          title="Delete resource"
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'My Purchases' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-12 h-12 mb-4" style={{ color: '#cbd5e1' }} />
              <p className="font-semibold" style={{ color: '#64748b' }}>No purchases yet</p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Browse the marketplace and add resources to your collection.</p>
              <a
                href="/"
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold inline-block"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                Browse Marketplace
              </a>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="space-y-4">
              {settings.map(({ key, label, desc, on }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: '#1e293b' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{desc}</p>
                  </div>
                  <button
                    onClick={() => setSettings((prev) => prev.map((s) => s.key === key ? { ...s, on: !s.on } : s))}
                    className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
                    style={{ backgroundColor: on ? '#3b82f6' : '#e2e8f0' }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: on ? '24px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

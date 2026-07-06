'use client';

import { useState } from 'react';
import { Bell, Send, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth-context';
import { AdminPageHeader, AdminCard } from '@/components/admin-ui';

const rawClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [channel, setChannel] = useState('in-app');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return;
    setSending(true);
    await rawClient.from('notifications').insert({
      title, message, target_audience: audience, channel, sent_by: user?.id,
    });
    setSending(false);
    setSent(true);
    setTitle(''); setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <AdminPageHeader title="Notifications" subtitle="Send announcements to platform users" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Compose Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-white"
                  style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="librarians">Librarians</option>
                  <option value="admins">Admins</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-white"
                  style={{ border: '1.5px solid #e2e8f0', color: '#475569' }}
                >
                  <option value="in-app">In-App</option>
                  <option value="push">Push</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !title || !message}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sent ? 'Sent!' : 'Send Notification'}
            </button>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1e293b' }}>Recent Notifications</h3>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Sent notifications will appear here.</p>
        </AdminCard>
      </div>
    </div>
  );
}

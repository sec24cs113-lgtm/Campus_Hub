'use client';

import { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function CreateAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await signUp(email, password, name);

    if (error) {
      setMessage(error);
      setLoading(false);
      return;
    }

    // Promote to admin via edge function
    try {
      const res = await fetch('/api/promote-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage('Account created but admin promotion pending. Log in and contact support.');
      } else {
        setMessage('Admin account created! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch {
      setMessage('Account created. Log in to continue.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0f3fb' }}>
      <div className="w-full max-w-md p-8 rounded-2xl" style={{ backgroundColor: '#ffffff', border: '1px solid #e8edf5' }}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1e40af' }}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Create Admin Account</h1>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Set up your administrator credentials</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Name"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
              onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
              onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@college.edu.in"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
              onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
              onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#475569' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
              onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
              onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
            />
          </div>

          {message && (
            <p className={`text-sm text-center p-3 rounded-xl ${message.includes('created') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

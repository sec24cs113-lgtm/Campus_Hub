import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, fullName.trim() || email.split('@')[0]);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    const dest = loc.state?.from ?? '/';
    nav(dest, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md card-soft p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white text-lg font-bold">C</span>
          <div>
            <div className="font-display font-extrabold text-xl text-neutral-900">CampusHub</div>
            <div className="text-xs text-neutral-500">Campus marketplace & librarian exchange</div>
          </div>
        </div>

        <div className="flex rounded-lg bg-neutral-100 p-1 mb-6">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${mode === m ? 'bg-white text-primary-700 shadow-card' : 'text-neutral-500'}`}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jordan Lee" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <div className="rounded-lg bg-error-50 text-error-600 text-sm px-3 py-2">{error}</div>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="muted mt-6 text-center text-xs">
          Demo accounts are seeded on first run. Ask for librarian credentials in the Admin panel.
        </p>
      </div>
    </div>
  );
}

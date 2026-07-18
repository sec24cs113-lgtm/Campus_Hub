'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, PlaySquare, FileText, BookOpen, Trophy,
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type Tab = 'signin' | 'signup';

const features = [
  { icon: PlaySquare, label: 'Video Courses', desc: '1,200+ expert-led lectures' },
  { icon: FileText, label: 'Question Papers', desc: 'PYQs from 120+ universities' },
  { icon: BookOpen, label: 'Book Store', desc: 'Curated academic textbooks' },
  { icon: Trophy, label: 'Leaderboard', desc: 'Compete and earn recognition' },
];

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signInEmail || !signInPassword) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, signUpName);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSuccess('Account created! Signing you in…');
    setTimeout(() => router.replace('/'), 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden p-10"
        style={{ backgroundColor: '#0d1b3e' }}
      >
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1290141/pexels-photo-1290141.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,27,62,0.6) 0%, rgba(13,27,62,0.95) 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-2xl tracking-tight">CollegeHub</span>
              <p className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                ACADEMIC MARKETPLACE
              </p>
            </div>
          </div>
        </div>

        {/* Center text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
          <h2 className="text-white font-bold text-3xl leading-tight mb-4">
            Your academic<br />marketplace awaits.
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Join 28,000+ students accessing premium academic content from top universities worldwide.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}
                >
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200"
              alt="Alex"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <p className="text-white text-sm font-semibold">&quot;CollegeHub transformed how I study for exams.&quot;</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Alex Rivera &bull; MIT, Computer Science</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
        style={{ backgroundColor: '#f0f3fb' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: '#0d1b3e' }}>CollegeHub</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            {/* Tabs */}
            <div className="flex" style={{ borderBottom: '1px solid #e2e8f0' }}>
              {(['signin', 'signup'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                  className="flex-1 py-4 text-sm font-semibold transition-colors relative"
                  style={{ color: tab === t ? '#3b82f6' : '#94a3b8' }}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                  {tab === t && (
                    <span
                      className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                      style={{ backgroundColor: '#3b82f6' }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-7">
              {/* Error / Success Messages */}
              {error && (
                <div
                  className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-sm"
                  style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}
                >
                  <span className="mt-0.5 flex-shrink-0">&#9888;</span>
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm"
                  style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}

              {tab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold" style={{ color: '#475569' }}>Password</label>
                      <button type="button" className="text-xs font-medium" style={{ color: '#3b82f6' }}>
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-2"
                    style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center pt-1" style={{ color: '#94a3b8' }}>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('signup'); setError(''); }}
                      className="font-semibold"
                      style={{ color: '#3b82f6' }}
                    >
                      Sign up free
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#475569' }}>Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={signUpConfirm}
                        onChange={(e) => setSignUpConfirm(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e2e8f0', color: '#1e293b' }}
                        onFocus={(e) => (e.currentTarget.style.border = '1.5px solid #3b82f6')}
                        onBlur={(e) => (e.currentTarget.style.border = '1.5px solid #e2e8f0')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: '#94a3b8' }}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 mt-2"
                    style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center pt-1" style={{ color: '#94a3b8' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('signin'); setError(''); }}
                      className="font-semibold"
                      style={{ color: '#3b82f6' }}
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#94a3b8' }}>
            By continuing you agree to our{' '}
            <span className="font-medium" style={{ color: '#64748b' }}>Terms of Service</span> and{' '}
            <span className="font-medium" style={{ color: '#64748b' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

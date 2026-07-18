import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-10 text-center muted">Loading…</div>;
  if (!session) return <Navigate to="/auth" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

export function RequireLibrarian({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="p-10 text-center muted">Loading…</div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (!profile.librarian_role && !profile.admin_role)
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 card text-center">
        <h2 className="section-title">Access restricted</h2>
        <p className="muted mt-2">Your account is not flagged as a librarian. Ask an admin to enable librarian access.</p>
      </div>
    );
  return <>{children}</>;
}

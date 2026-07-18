import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const isLibrarian = profile?.librarian_role;
  const isAdmin = profile?.admin_role;

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-lg text-primary-700">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">C</span>
            CampusHub
          </Link>
          <nav className="ml-6 hidden sm:flex items-center gap-1 text-sm">
            <NavLink to="/" end className={({ isActive }) => `px-3 py-2 rounded-lg font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100'}`}>
              Marketplace
            </NavLink>
            {isLibrarian && (
              <NavLink to="/librarian" className={({ isActive }) => `px-3 py-2 rounded-lg font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                Librarian Dashboard
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `px-3 py-2 rounded-lg font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-neutral-800">{profile?.full_name ?? 'User'}</div>
              <div className="text-xs text-neutral-500">
                {isLibrarian ? 'Librarian' : isAdmin ? 'Admin' : 'Student'}
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
              {(profile?.full_name ?? 'U').slice(0, 1).toUpperCase()}
            </div>
            <button onClick={signOut} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

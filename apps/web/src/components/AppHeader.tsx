import { useAuth } from '../context/AuthContext';

export default function AppHeader() {
  const { user, logout } = useAuth();

  const initials = user?.email
    .split('@')[0]
    .split(/[._-]/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            C
          </span>
          <span>
            <span className="brand__name">Calibre</span>
            <span className="brand__tagline">Détecter, comprendre, progresser</span>
          </span>
        </div>

        <div className="header-user">
          <span className={`role-badge role-badge--${user?.role}`}>{user?.role === 'manager' ? 'Manager' : 'Apprenant'}</span>
          <span className="header-user__avatar" aria-hidden="true">
            {initials || '?'}
          </span>
          <span className="header-user__email">{user?.email}</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}

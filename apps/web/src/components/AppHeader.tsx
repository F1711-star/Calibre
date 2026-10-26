import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const initials = user?.email
    ?.split('@')[0]
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
            <span className="brand__tagline">{t.header.tagline}</span>
          </span>
        </div>

        <div className="header-user">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            aria-label="Changer de langue"
            title="Changer de langue"
          >
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            title="Basculer le thème"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className={`role-badge role-badge--${user?.role}`}>
            {user?.role === 'manager' ? t.header.roleManager : t.header.roleLearner}
          </span>
          <span className="header-user__avatar" aria-hidden="true">
            {initials || '?'}
          </span>
          <span className="header-user__email">{user?.email}</span>
          <button type="button" className="btn btn--ghost btn--small" onClick={logout}>
            {t.common.logout}
          </button>
        </div>
      </div>
    </header>
  );
}

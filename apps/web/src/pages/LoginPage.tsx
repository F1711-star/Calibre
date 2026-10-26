import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.auth.invalid;
      if (msg.toLowerCase().includes('identifiants') || msg.toLowerCase().includes('invalid')) {
        setError(t.auth.invalid);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-topbar">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          >
            {locale === 'fr' ? 'EN' : 'FR'}
          </button>
          <button type="button" className="btn btn--ghost btn--small" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="brand brand--auth">
          <span className="brand__mark" aria-hidden="true">
            C
          </span>
          <span>
            <span className="brand__name">Calibre</span>
            <span className="brand__tagline">{t.header.tagline}</span>
          </span>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">{t.auth.eyebrow}</span>
          <h1>{t.auth.title}</h1>
          <p>{t.auth.subtitle}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">{t.auth.email}</span>
            <input
              className="input"
              type="email"
              placeholder="prenom.nom@calibre.test"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="label">{t.auth.password}</span>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? t.auth.connecting : t.common.login}
          </button>
        </form>

        <div className="demo-accounts">
          <span className="demo-accounts__title">{t.auth.demo}</span>
          <code>learner.a1@calibre.test · password123</code>
          <code>manager.alpha@calibre.test · password123</code>
        </div>
      </div>
    </div>
  );
}

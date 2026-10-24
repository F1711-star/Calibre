import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand brand--auth">
          <span className="brand__mark" aria-hidden="true">
            C
          </span>
          <span>
            <span className="brand__name">Calibre</span>
            <span className="brand__tagline">Détecter, comprendre, progresser</span>
          </span>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">Espace sécurisé</span>
          <h1>Reprendre l'entraînement</h1>
          <p>Connectez-vous pour retrouver votre boîte de réception et vos exercices.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Adresse e-mail</span>
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
            <span className="label">Mot de passe</span>
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="demo-accounts">
          <span className="demo-accounts__title">Comptes de démonstration</span>
          <code>learner.a1@calibre.test · password123</code>
          <code>manager.alpha@calibre.test · password123</code>
        </div>
      </div>
    </div>
  );
}

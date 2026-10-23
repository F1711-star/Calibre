import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Tableau de bord - Manager</h1>
        <button onClick={logout}>Déconnexion</button>
      </header>
      <p>Connecté en tant que {user?.email} (manager)</p>
      <p>À venir : heatmap équipe x technique, score de maturité</p>
    </div>
  );
}

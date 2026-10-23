import { useAuth } from '../context/AuthContext';

export default function InboxPage() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Boîte mail simulée - Apprenant</h1>
        <button onClick={logout}>Déconnexion</button>
      </header>
      <p>Connecté en tant que {user?.email} (apprenant)</p>
      <p>À venir : liste des contenus, surligneur, formulaire de réponse</p>
    </div>
  );
}

import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Tableau de bord</span>
            <h1>Pilotage de l'équipe</h1>
            <p className="page-heading__subtitle">
              Connecté en tant que manager de l'équipe {user?.teamId}. Les indicateurs arrivent à l'étape suivante.
            </p>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="panel dashboard-card">
            <span className="dashboard-card__icon">◎</span>
            <h2>Heatmap équipe</h2>
            <p>Visualisez les techniques les mieux et les moins bien maîtrisées par votre équipe.</p>
            <span className="pill pill--muted">Jour 3</span>
          </section>
          <section className="panel dashboard-card">
            <span className="dashboard-card__icon">↗</span>
            <h2>Score de maturité</h2>
            <p>Suivez la progression collective et repérez les besoins de renforcement.</p>
            <span className="pill pill--muted">Jour 3</span>
          </section>
          <section className="panel dashboard-card">
            <span className="dashboard-card__icon">✦</span>
            <h2>Contenus</h2>
            <p>Consultez la banque de messages et générez de nouveaux exercices.</p>
            <span className="pill pill--muted">Jour 4</span>
          </section>
        </div>
      </main>
    </>
  );
}

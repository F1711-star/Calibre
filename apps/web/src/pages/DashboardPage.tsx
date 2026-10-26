import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import { apiFetch } from '../lib/api';
import { techniqueLabel } from '../lib/types';
import type { TeamDashboard } from '../lib/types';

function heatmapColor(rate: number, total: number): string {
  if (total === 0) return 'heatmap-cell heatmap-cell--empty';
  if (rate >= 80) return 'heatmap-cell heatmap-cell--high';
  if (rate >= 60) return 'heatmap-cell heatmap-cell--mid';
  if (rate >= 40) return 'heatmap-cell heatmap-cell--low';
  return 'heatmap-cell heatmap-cell--bad';
}

export default function DashboardPage() {
  const [data, setData] = useState<TeamDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<TeamDashboard>('/stats/team')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Tableau de bord</span>
            <h1>Pilotage de l'équipe</h1>
            <p className="page-heading__subtitle">
              Suivi par technique, classements et score de maturité selon le seuil de confidentialité.
            </p>
          </div>
          {data && (
            <span className="session-pill">
              {data.team.name} · {data.team.learnerCount} apprenant{data.team.learnerCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="dashboard-grid dashboard-grid--stats">
            <div className="panel skeleton skeleton--stat" />
            <div className="panel skeleton skeleton--stat" />
            <div className="panel skeleton skeleton--stat" />
          </div>
        ) : (
          data && (
            <>
              <div className="dashboard-grid dashboard-grid--stats">
                <section className="panel stat-card">
                  <span className="stat-card__label">Réponses soumises</span>
                  <span className="stat-card__value">{data.totals.answersCount}</span>
                  <span className="stat-card__hint">Total sur l'équipe</span>
                </section>
                <section className="panel stat-card">
                  <span className="stat-card__label">Réponses justes</span>
                  <span className="stat-card__value stat-card__value--success">
                    {data.totals.correctCount} / {data.totals.answersCount}
                  </span>
                  <span className="stat-card__hint">
                    Verdict + technique corrects ({data.totals.answersCount === 0 ? 0 : Math.round((data.totals.correctCount / data.totals.answersCount) * 100)}%)
                  </span>
                </section>
                <section className="panel stat-card">
                  <span className="stat-card__label">Score de maturité</span>
                  {data.maturityVisible && data.maturityScore !== null ? (
                    <>
                      <span className="stat-card__value stat-card__value--accent">{data.maturityScore}</span>
                      <span className="stat-card__hint">/ 100 · seuil {data.minTeamSizeForMaturity}+ membres</span>
                    </>
                  ) : (
                    <>
                      <span className="stat-card__value stat-card__value--muted">Masqué</span>
                      <span className="stat-card__hint">
                        Nécessite au moins {data.minTeamSizeForMaturity} apprenants dans l'équipe
                      </span>
                    </>
                  )}
                </section>
              </div>

              <div className="dashboard-layout">
                <section className="panel heatmap-panel">
                  <div className="panel__header">
                    <div>
                      <span className="eyebrow">Heatmap</span>
                      <h2>Réussite par technique</h2>
                      <p>Taux de réponses justes (verdict + technique corrects) par type de manipulation.</p>
                    </div>
                  </div>
                  <div className="heatmap-table">
                    <div className="heatmap-table__header">
                      <span>Technique</span>
                      <span>Réponses</span>
                      <span>Justes</span>
                      <span>Taux</span>
                    </div>
                    {data.heatmap.map((cell) => (
                      <div key={cell.technique} className="heatmap-table__row">
                        <span className="heatmap-table__label">{techniqueLabel(cell.technique)}</span>
                        <span>{cell.totalAnswers}</span>
                        <span>{cell.correct}</span>
                        <span className="heatmap-table__rate">
                          <span className={heatmapColor(cell.rate, cell.totalAnswers)}>{cell.rate}%</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel ranking-panel">
                  <div className="panel__header">
                    <div>
                      <span className="eyebrow">Classement</span>
                      <h2>Top contributeurs</h2>
                      <p>Triés par nombre de réponses justes (décroissant).</p>
                    </div>
                  </div>
                  <div className="ranking-list">
                    {data.topContributors.length === 0 ? (
                      <p className="hint">Aucune réponse enregistrée pour cette équipe.</p>
                    ) : (
                      data.topContributors.map((contributor, index) => (
                        <div key={contributor.userId} className="ranking-item">
                          <span className="ranking-item__rank">{index + 1}</span>
                          <div className="ranking-item__identity">
                            <strong>{contributor.email}</strong>
                            <span>
                              {contributor.answersCount} réponse{contributor.answersCount > 1 ? 's' : ''} · moyenne{' '}
                              {contributor.averageScore}/100
                            </span>
                          </div>
                          <span className="ranking-item__score">{contributor.accuracy}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </>
          )
        )}
      </main>
    </>
  );
}

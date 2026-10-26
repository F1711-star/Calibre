import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import { apiFetch } from '../lib/api';
import { techniqueLabel } from '../lib/types';
import type { TeamDashboard } from '../lib/types';
import { useI18n } from '../context/I18nContext';

function heatmapColor(rate: number, total: number): string {
  if (total === 0) return 'heatmap-cell heatmap-cell--empty';
  if (rate >= 80) return 'heatmap-cell heatmap-cell--high';
  if (rate >= 60) return 'heatmap-cell heatmap-cell--mid';
  if (rate >= 40) return 'heatmap-cell heatmap-cell--low';
  return 'heatmap-cell heatmap-cell--bad';
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [data, setData] = useState<TeamDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<TeamDashboard>('/stats/team')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : t.common.error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">{t.dashboard.eyebrow}</span>
            <h1>{t.dashboard.title}</h1>
            <p className="page-heading__subtitle">
              {t.dashboard.subtitle}
            </p>
          </div>
          {data && (
            <span className="session-pill">
              {data.team.name} · {t.dashboard.members(data.team.learnerCount)}
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
                  <span className="stat-card__label">{t.dashboard.answersSubmitted}</span>
                  <span className="stat-card__value">{data.totals.answersCount}</span>
                  <span className="stat-card__hint">{t.dashboard.totalTeam}</span>
                </section>
                <section className="panel stat-card">
                  <span className="stat-card__label">{t.dashboard.correctAnswers}</span>
                  <span className="stat-card__value stat-card__value--success">
                    {data.totals.correctCount} / {data.totals.answersCount}
                  </span>
                  <span className="stat-card__hint">
                    {t.dashboard.verdictTechniqueCorrect} ({data.totals.answersCount === 0 ? 0 : Math.round((data.totals.correctCount / data.totals.answersCount) * 100)}%)
                  </span>
                </section>
                <section className="panel stat-card">
                  <span className="stat-card__label">{t.dashboard.maturityScore}</span>
                  {data.maturityVisible && data.maturityScore !== null ? (
                    <>
                      <span className="stat-card__value stat-card__value--accent">{data.maturityScore}</span>
                      <span className="stat-card__hint">{t.dashboard.maturityThreshold(data.minTeamSizeForMaturity)}</span>
                    </>
                  ) : (
                    <>
                      <span className="stat-card__value stat-card__value--muted">{t.dashboard.hidden}</span>
                      <span className="stat-card__hint">
                        {t.dashboard.maturityHidden(data.minTeamSizeForMaturity)}
                      </span>
                    </>
                  )}
                </section>
              </div>

              <div className="dashboard-layout">
                <section className="panel heatmap-panel">
                  <div className="panel__header">
                    <div>
                      <span className="eyebrow">{t.dashboard.heatmapEyebrow}</span>
                      <h2>{t.dashboard.heatmapTitle}</h2>
                      <p>{t.dashboard.heatmapSubtitle}</p>
                    </div>
                  </div>
                  <div className="heatmap-table">
                    <div className="heatmap-table__header">
                      <span>{t.dashboard.technique}</span>
                      <span>{t.dashboard.answers}</span>
                      <span>{t.dashboard.correct}</span>
                      <span>{t.dashboard.rate}</span>
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
                      <span className="eyebrow">{t.dashboard.rankingEyebrow}</span>
                      <h2>{t.dashboard.rankingTitle}</h2>
                      <p>{t.dashboard.rankingSubtitle}</p>
                    </div>
                  </div>
                  <div className="ranking-list">
                    {data.topContributors.length === 0 ? (
                      <p className="hint">{t.dashboard.noAnswers}</p>
                    ) : (
                      data.topContributors.map((contributor, index) => (
                        <div key={contributor.userId} className="ranking-item">
                          <span className="ranking-item__rank">{index + 1}</span>
                          <div className="ranking-item__identity">
                            <strong>{contributor.email}</strong>
                            <span>
                              {t.dashboard.responses(contributor.answersCount)} · {t.dashboard.average}{' '}
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

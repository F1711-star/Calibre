import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import AppHeader from '../components/AppHeader';
import EmailBody from '../components/EmailBody';
import { apiFetch } from '../lib/api';
import { TECHNIQUE_OPTIONS, techniqueLabel } from '../lib/types';
import type { AnswerResult, Highlight, LearnerContent, Technique, Verdict } from '../lib/types';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Facile',
  2: 'Moyen',
  3: 'Difficile',
};

function mergeHighlights(highlights: Highlight[]): Highlight[] {
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const merged: Highlight[] = [];
  for (const highlight of sorted) {
    const previous = merged.at(-1);
    if (previous && highlight.start <= previous.end) {
      previous.end = Math.max(previous.end, highlight.end);
    } else {
      merged.push({ ...highlight });
    }
  }
  return merged;
}

function senderInitials(senderName: string): string {
  return senderName
    .replace(/<[^>]*>/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function InboxPage() {
  const [content, setContent] = useState<LearnerContent | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [verdict, setVerdict] = useState<Verdict>('suspicious');
  const [technique, setTechnique] = useState<Technique>('none');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const correctionRef = useRef<HTMLElement>(null);

  async function loadNext() {
    setLoading(true);
    setError('');
    setResult(null);
    setHighlights([]);
    setVerdict('suspicious');
    setTechnique('none');
    setExplanation('');
    try {
      const data = await apiFetch<{ content: LearnerContent | null; remaining: number }>('/contents/next');
      setContent(data.content);
      setRemaining(data.remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le contenu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNext();
  }, []);

  const handleHighlight = (range: { start: number; end: number }) => {
    setHighlights((previous) => mergeHighlights([...previous, { ...range, reason: 'Passage surligné' }]));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content) return;
    setSubmitting(true);
    setError('');
    try {
      const answer = await apiFetch<AnswerResult>('/answers', {
        method: 'POST',
        body: JSON.stringify({
          contentId: content.id,
          verdict,
          technique,
          explanation,
          highlights,
        }),
      });
      setResult(answer);
      setRemaining((value) => Math.max(0, value - 1));
      window.setTimeout(() => correctionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer la réponse");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !submitting &&
    explanation.trim().length > 0 &&
    (verdict === 'reliable' || technique !== 'none');

  const displayHighlights = result ? (result.content.highlights as Highlight[]) : highlights;
  const score = result?.feedback?.score ?? result?.explanationScore ?? null;
  const allCorrect = Boolean(result?.verdictCorrect && result?.techniqueCorrect);

  return (
    <>
      <AppHeader />
      <main className="page">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Boîte de réception</span>
            <h1>Exercice de détection</h1>
            <p className="page-heading__subtitle">
              Analysez le message, surlignez les indices et expliquez votre raisonnement.
            </p>
          </div>
          <span className="session-pill">{remaining} contenu{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}</span>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="training-grid">
            <div className="panel skeleton skeleton--email" />
            <div className="panel skeleton skeleton--form" />
          </div>
        ) : !content ? (
          <section className="panel empty-state">
            <span className="empty-state__icon">✓</span>
            <h2>Tous les contenus ont été traités</h2>
            <p>Vous avez terminé la banque d'exercices disponible. Les prochains contenus arriveront bientôt.</p>
            <button type="button" className="btn btn--primary" onClick={() => { setError(''); void loadNext(); }}>
              Vérifier à nouveau
            </button>
          </section>
        ) : (
          <div className="training-grid">
            <article className="panel email-card">
              <div className="email-card__top">
                <span className="avatar" aria-hidden="true">
                  {senderInitials(content.senderName)}
                </span>
                <div className="email-card__identity">
                  <strong>{content.senderName}</strong>
                  <span>à moi · aujourd'hui</span>
                </div>
                <span className={`difficulty-badge difficulty-badge--${content.difficulty}`}>
                  {DIFFICULTY_LABELS[content.difficulty] ?? 'Standard'}
                </span>
              </div>

              <div className="email-card__subject">
                <h2>{content.title}</h2>
                {!result && (
                  <p className="hint hint--accent">
                    Sélectionnez à la souris les passages qui vous semblent suspects : ils seront surlignés.
                  </p>
                )}
              </div>

              <EmailBody
                body={content.body}
                highlights={displayHighlights}
                selectable={!result}
                variant={result ? 'correction' : 'user'}
                onSelectText={handleHighlight}
              />

              {!result && highlights.length > 0 && (
                <div className="email-card__footer">
                  <span>{highlights.length} passage{highlights.length > 1 ? 's' : ''} surligné{highlights.length > 1 ? 's' : ''}</span>
                  <button type="button" className="btn btn--link" onClick={() => setHighlights([])}>
                    Effacer les surlignages
                  </button>
                </div>
              )}

              {result && (
                <div className="email-card__footer email-card__footer--legend">
                  <strong>Indices attendus</strong>
                  <div className="legend">
                    {(result.content.highlights as Highlight[]).length === 0 ? (
                      <span className="hint">Aucun indice de manipulation dans ce message.</span>
                    ) : (
                      (result.content.highlights as Highlight[]).map((highlight, index) => (
                        <span key={`${highlight.start}-${index}`} className="legend__item">
                          <span className="legend__dot" />
                          {highlight.reason ?? highlight.text}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </article>

            {!result ? (
              <form className="panel form-panel" onSubmit={handleSubmit}>
                <div className="form-panel__heading">
                  <span className="step-badge">Votre analyse</span>
                  <h2>Que concludez-vous ?</h2>
                </div>

                <div className="field">
                  <span className="label">Verdict</span>
                  <div className="segmented" role="group" aria-label="Verdict">
                    <button
                      type="button"
                      className={verdict === 'reliable' ? 'active active--reliable' : ''}
                      onClick={() => {
                        setVerdict('reliable');
                        setTechnique('none');
                      }}
                    >
                      Fiable
                    </button>
                    <button
                      type="button"
                      className={verdict === 'suspicious' ? 'active active--suspicious' : ''}
                      onClick={() => setVerdict('suspicious')}
                    >
                      Suspect
                    </button>
                  </div>
                </div>

                <label className="field">
                  <span className="label">Technique de manipulation</span>
                  <select
                    className="select"
                    value={technique}
                    onChange={(event) => setTechnique(event.target.value as Technique)}
                    disabled={verdict === 'reliable'}
                  >
                    {TECHNIQUE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {verdict === 'suspicious' && technique === 'none' && (
                    <span className="hint hint--warning">Choisissez la technique qui correspond à l'indice principal.</span>
                  )}
                </label>

                <label className="field">
                  <span className="label">
                    Votre explication <span className="label__counter">{explanation.length}/1000</span>
                  </span>
                  <textarea
                    className="textarea"
                    rows={5}
                    maxLength={1000}
                    placeholder="Expliquez pourquoi ce message est fiable ou suspect, en citant les indices que vous avez repérés."
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                  />
                </label>

                <button type="submit" className="btn btn--primary btn--block" disabled={!canSubmit}>
                  {submitting ? 'Analyse en cours...' : 'Envoyer ma réponse'}
                </button>
                <p className="hint hint--center">
                  Verdict et technique sont corrigés par le code. L'IA ne note que la qualité de votre explication.
                </p>
              </form>
            ) : (
              <section ref={correctionRef} className="panel form-panel correction-panel">
                <div className={`result-banner ${allCorrect ? 'result-banner--success' : 'result-banner--error'}`}>
                  <span className="result-banner__icon">{allCorrect ? '✓' : '!'}</span>
                  <div className="result-banner__text">
                    <h2>{allCorrect ? 'Bonne analyse' : 'À revoir'}</h2>
                    <p>
                      {allCorrect
                        ? 'Vous avez identifié le bon verdict et la bonne technique.'
                        : 'La correction vous montre les indices à retenir pour la prochaine fois.'}
                    </p>
                  </div>
                  {score !== null && (
                    <span className="score-badge">
                      {score}
                      <small>/100</small>
                    </span>
                  )}
                </div>

                {result.injectionFlag && (
                  <div className="alert alert--warning">
                    Des instructions ont été détectées dans votre explication. Elles ont été ignorées et n'ont pas influencé la correction.
                  </div>
                )}

                <div className="result-checks">
                  <div className={`check ${result.verdictCorrect ? 'check--ok' : 'check--bad'}`}>
                    <span>{result.verdictCorrect ? '✓' : '×'}</span>
                    Verdict : {result.verdict === 'reliable' ? 'fiable' : 'suspect'}
                  </div>
                  <div className={`check ${result.techniqueCorrect ? 'check--ok' : 'check--bad'}`}>
                    <span>{result.techniqueCorrect ? '✓' : '×'}</span>
                    Technique : {techniqueLabel(result.technique)}
                  </div>
                </div>

                <div className="result-section">
                  <h3>Technique attendue</h3>
                  <p>{techniqueLabel(result.content.expectedTechnique)}</p>
                </div>

                <div className="result-section">
                  <h3>Ce qu'il fallait repérer</h3>
                  <p>{result.content.explanation}</p>
                </div>

                {result.feedback && (
                  <>
                    <div className="feedback-grid">
                      <div className="feedback-card feedback-card--good">
                        <h3>Points forts</h3>
                        <ul>
                          {result.feedback.strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="feedback-card feedback-card--warn">
                        <h3>À améliorer</h3>
                        <ul>
                          {result.feedback.weaknesses.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="improved-version">
                      <span className="improved-version__label">
                        Explication modèle
                        <span>{result.feedback.source === 'llm' ? 'IA' : 'mode local'}</span>
                      </span>
                      <p>{result.feedback.improvedVersion}</p>
                      {result.feedback.note && <p className="hint">{result.feedback.note}</p>}
                    </div>
                  </>
                )}

                <button type="button" className="btn btn--primary btn--block" onClick={() => void loadNext()}>
                  Contenu suivant
                </button>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}

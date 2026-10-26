import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import AppHeader from '../components/AppHeader';
import EmailBody from '../components/EmailBody';
import { apiFetch } from '../lib/api';
import { TECHNIQUE_OPTIONS, techniqueLabel } from '../lib/types';
import type { AnswerResult, Highlight, LearnerContent, Technique, Verdict } from '../lib/types';
import { useI18n } from '../context/I18nContext';

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
  const { t } = useI18n();
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

  const DIFFICULTY_LABELS: Record<number, string> = {
    1: t.inbox.difficultEasy,
    2: t.inbox.difficultMedium,
    3: t.inbox.difficultHard,
  };

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
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNext();
  }, []);

  const handleHighlight = (range: { start: number; end: number }) => {
    setHighlights((previous) => mergeHighlights([...previous, { ...range, reason: t.common.passagesHighlighted(1) }]));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content) return;
    setSubmitting(true);
    setError('');
    try {
      const payloadHighlights = highlights.map((h) => ({ start: h.start, end: h.end }));
      const answer = await apiFetch<AnswerResult>('/answers', {
        method: 'POST',
        body: JSON.stringify({
          contentId: content.id,
          verdict,
          technique,
          explanation,
          highlights: payloadHighlights,
        }),
      });
      setResult(answer);
      setRemaining((value) => Math.max(0, value - 1));
      window.setTimeout(() => correctionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
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
            <span className="eyebrow">{t.inbox.eyebrow}</span>
            <h1>{t.inbox.title}</h1>
            <p className="page-heading__subtitle">{t.inbox.subtitle}</p>
          </div>
          <span className="session-pill">{t.common.contentsRemaining(remaining)}</span>
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
            <h2>{t.inbox.emptyTitle}</h2>
            <p>{t.inbox.emptyDesc}</p>
            <button type="button" className="btn btn--primary" onClick={() => { setError(''); setLoading(true); void loadNext(); }}>
              {t.common.verifyAgain}
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
                  <span>{t.inbox.toMe}</span>
                </div>
                <span className={`difficulty-badge difficulty-badge--${content.difficulty}`}>
                  {DIFFICULTY_LABELS[content.difficulty] ?? t.inbox.difficultMedium}
                </span>
              </div>

              <div className="email-card__subject">
                <h2>{content.title}</h2>
                {!result && (
                  <p className="hint hint--accent">
                    {t.inbox.hintSelect}
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
                  <span>{t.common.passagesHighlighted(highlights.length)}</span>
                  <button type="button" className="btn btn--link" onClick={() => setHighlights([])}>
                    {t.common.clearHighlights}
                  </button>
                </div>
              )}

              {result && (
                <div className="email-card__footer email-card__footer--legend">
                  <strong>{t.inbox.legend}</strong>
                  <div className="legend">
                    {(result.content.highlights as Highlight[]).length === 0 ? (
                      <span className="hint">{t.inbox.noHints}</span>
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
                  <span className="step-badge">{t.inbox.eyebrow}</span>
                  <h2>{t.inbox.formTitle}</h2>
                </div>

                <div className="field">
                  <span className="label">{t.inbox.verdict}</span>
                  <div className="segmented" role="group" aria-label={t.inbox.verdict}>
                    <button
                      type="button"
                      className={verdict === 'reliable' ? 'active active--reliable' : ''}
                      onClick={() => {
                        setVerdict('reliable');
                        setTechnique('none');
                      }}
                    >
                      {t.inbox.reliable}
                    </button>
                    <button
                      type="button"
                      className={verdict === 'suspicious' ? 'active active--suspicious' : ''}
                      onClick={() => setVerdict('suspicious')}
                    >
                      {t.inbox.suspicious}
                    </button>
                  </div>
                </div>

                <label className="field">
                  <span className="label">{t.inbox.technique}</span>
                  <select
                    className="select"
                    value={technique}
                    onChange={(event) => setTechnique(event.target.value as Technique)}
                    disabled={verdict === 'reliable'}
                  >
                    {TECHNIQUE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value === 'none' ? t.inbox.noManipulation : option.label}
                      </option>
                    ))}
                  </select>
                  {verdict === 'suspicious' && technique === 'none' && (
                    <span className="hint hint--warning">{t.inbox.chooseTechnique}</span>
                  )}
                </label>

                <label className="field">
                  <span className="label">
                    {t.inbox.explanation} <span className="label__counter">{explanation.length}/1000</span>
                  </span>
                  <textarea
                    className="textarea"
                    rows={5}
                    maxLength={1000}
                    placeholder={t.inbox.explanationPlaceholder}
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                  />
                </label>

                <button type="submit" className="btn btn--primary btn--block" disabled={!canSubmit}>
                  {submitting ? t.inbox.sending : t.inbox.send}
                </button>
                <p className="hint hint--center">
                  {t.inbox.note}
                </p>
              </form>
            ) : (
              <section ref={correctionRef} className="panel form-panel correction-panel">
                <div className={`result-banner ${allCorrect ? 'result-banner--success' : 'result-banner--error'}`}>
                  <span className="result-banner__icon">{allCorrect ? '✓' : '!'}</span>
                  <div className="result-banner__text">
                    <h2>{allCorrect ? t.inbox.correction.good : t.inbox.correction.review}</h2>
                    <p>
                      {allCorrect
                        ? t.inbox.correction.goodDesc
                        : t.inbox.correction.reviewDesc}
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
                    {t.inbox.correction.injection}
                  </div>
                )}

                <div className="result-checks">
                  <div className={`check ${result.verdictCorrect ? 'check--ok' : 'check--bad'}`}>
                    <span>{result.verdictCorrect ? '✓' : '×'}</span>
                    {t.inbox.correction.verdict} : {result.verdict === 'reliable' ? t.inbox.reliable.toLowerCase() : t.inbox.suspicious.toLowerCase()}
                  </div>
                  <div className={`check ${result.techniqueCorrect ? 'check--ok' : 'check--bad'}`}>
                    <span>{result.techniqueCorrect ? '✓' : '×'}</span>
                    {t.inbox.correction.technique} : {techniqueLabel(result.technique)}
                  </div>
                </div>

                <div className="result-section">
                  <h3>{t.inbox.correction.expectedTechnique}</h3>
                  <p>{techniqueLabel(result.content.expectedTechnique)}</p>
                </div>

                <div className="result-section">
                  <h3>{t.inbox.correction.toSpot}</h3>
                  <p>{result.content.explanation}</p>
                </div>

                {result.feedback && (
                  <>
                    <div className="feedback-grid">
                      <div className="feedback-card feedback-card--good">
                        <h3>{t.inbox.correction.strengths}</h3>
                        <ul>
                          {result.feedback.strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="feedback-card feedback-card--warn">
                        <h3>{t.inbox.correction.weaknesses}</h3>
                        <ul>
                          {result.feedback.weaknesses.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="improved-version">
                      <span className="improved-version__label">
                        {t.inbox.correction.modelExplanation}
                        <span>{result.feedback.source === 'llm' ? t.inbox.correction.ai : t.inbox.correction.local}</span>
                      </span>
                      <p>{result.feedback.improvedVersion}</p>
                      {result.feedback.note && <p className="hint">{result.feedback.note}</p>}
                    </div>
                  </>
                )}

                <button type="button" className="btn btn--primary btn--block" onClick={() => void loadNext()}>
                  {t.inbox.correction.next}
                </button>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export type Technique =
  | 'none'
  | 'deformed_statistic'
  | 'invented_quote'
  | 'fake_urgency'
  | 'dubious_source'
  | 'spoofed_sender';

export type Verdict = 'reliable' | 'suspicious';

export type Highlight = {
  start: number;
  end: number;
  reason?: string;
  text?: string;
};

export type LearnerContent = {
  id: string;
  title: string;
  body: string;
  senderName: string;
  difficulty: number;
  createdAt: string;
};

export type ExplanationFeedback = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvedVersion: string;
  source: 'llm' | 'local';
  note?: string;
};

export type AnswerResult = {
  id: string;
  verdict: Verdict;
  technique: Technique;
  verdictCorrect: boolean;
  techniqueCorrect: boolean;
  explanationScore: number | null;
  injectionFlag: boolean;
  createdAt: string;
  feedback: ExplanationFeedback | null;
  content: {
    id: string;
    title: string;
    body: string;
    senderName: string;
    isReliable: boolean;
    technique: Technique;
    expectedTechnique: Technique;
    difficulty: number;
    highlights: Highlight[];
    explanation: string;
  };
};

export const TECHNIQUE_OPTIONS: Array<{ value: Technique; label: string }> = [
  { value: 'none', label: 'Aucune manipulation' },
  { value: 'deformed_statistic', label: 'Statistique déformée' },
  { value: 'invented_quote', label: 'Citation inventée' },
  { value: 'fake_urgency', label: 'Urgence artificielle' },
  { value: 'dubious_source', label: 'Source douteuse' },
  { value: 'spoofed_sender', label: 'Expéditeur usurpé' },
];

export function techniqueLabel(technique: Technique): string {
  return TECHNIQUE_OPTIONS.find((option) => option.value === technique)?.label ?? technique;
}

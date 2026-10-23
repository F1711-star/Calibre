export const ROLES = ['learner', 'manager'] as const;
export type Role = (typeof ROLES)[number];

export const TECHNIQUES = [
  'none',
  'deformed_statistic',
  'invented_quote',
  'fake_urgency',
  'dubious_source',
  'spoofed_sender',
] as const;
export type Technique = (typeof TECHNIQUES)[number];

export const VERDICTS = ['reliable', 'suspicious'] as const;
export type Verdict = (typeof VERDICTS)[number];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: Role;
    teamId: string;
  };
}

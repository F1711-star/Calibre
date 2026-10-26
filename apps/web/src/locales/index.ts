import { fr } from './fr';
import { en } from './en';

export const dictionaries = { fr, en } as const;
export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof fr;
export { fr, en };

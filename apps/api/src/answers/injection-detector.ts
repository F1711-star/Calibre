const INJECTION_PATTERNS: RegExp[] = [
  /ignore[rz]?\s+(toutes?\s+)?(les\s+)?(instructions?|consignes?|tes\s+instructions?)/i,
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /(oublie|forget)\s+(tout|everything|tes\s+instructions)/i,
  /(system|developer)\s*prompt|prompt\s+syst[èe]me/i,
  /tu\s+es\s+(maintenant|d[ée]sormais)|you\s+are\s+now/i,
  /(donne|donnez|donner|mets|mettez|mettre|attribue|attribuez|attribuer)[\s-]*(moi\s+)?(nous\s+)?(lui\s+)?(une\s+)?(note|score|points?|point|bonne\s+note)/i,
  /\b(100|20\s*\/\s*20)\b/i,
  /\b20\/20\b/i,
  /vingt\s+sur\s+vingt/i,
  /note\s*(maximale|pleine)/i,
  /donnez[-\s]+moi\s+100/i,
  /(r[ée]v[èe]le|reveal|affiche)[\s-]*(la\s+)?(bonne\s+)?(r[ée]ponse|answer|verdict|solution)/i,
  /(jailbreak|\bDAN\b|do\s+anything\s+now)/i,
  /[A-Za-z0-9+/]{160,}={0,2}/,
];

export function sanitizeExplanation(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1000);
}

export function detectInjection(value: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

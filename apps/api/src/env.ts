import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const candidates = [fileURLToPath(new URL('../.env', import.meta.url)), '.env'];

for (const candidate of candidates) {
  try {
    loadEnvFile(candidate);
    break;
  } catch {
    continue;
  }
}

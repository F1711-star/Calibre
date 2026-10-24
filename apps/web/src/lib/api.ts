const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('calibre_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const raw = await res.text();
    let message = raw || `Erreur HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(raw) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) message = parsed.message.join(' ');
      else if (typeof parsed.message === 'string') message = parsed.message;
    } catch {
      console.debug('Réponse API non JSON', raw);
    }
    throw new Error(message);
  }

  return res.json();
}

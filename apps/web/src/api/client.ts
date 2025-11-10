import { useAuth } from '@/auth/useAuth';

export function useApi() {
  const { getAccessToken } = useAuth();

  async function api(path: string, init: RequestInit = {}) {
    const token = await getAccessToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const res = await fetch(path, { ...init, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    const ct = res.headers.get('content-type');
    if (ct && ct.includes('application/json')) return res.json();
    return res.text();
  }

  return { api };
}
